import Comic from '../models/Comic.js';

const MANGADEX_BASE_URL = 'https://api.mangadex.org';
const HEADERS = {
  'User-Agent': 'WebcomicsTrackerV2/1.0 (UPNVJ-Backend-StudyClub)',
  Accept: 'application/json'
};

/**
 * Helper untuk memformat response mentah dari MangaDex API menjadi objek ringkas.
 */
function formatMangaDexItem(item) {
  const attr = item.attributes || {};
  const titleObj = attr.title || {};
  const title = titleObj.en || titleObj['ja-ro'] || Object.values(titleObj)[0] || 'Untitled';

  const descObj = attr.description || {};
  const description = descObj.en || Object.values(descObj)[0] || '';

  const tags = (attr.tags || [])
    .filter((t) => t.attributes?.group === 'genre')
    .map((t) => t.attributes?.name?.en)
    .filter(Boolean);

  // Cari relasi author dan cover_art
  const authorRel = (item.relationships || []).find((r) => r.type === 'author');
  const author = authorRel?.attributes?.name || 'Unknown';

  const coverRel = (item.relationships || []).find((r) => r.type === 'cover_art');
  const coverFileName = coverRel?.attributes?.fileName;
  const coverUrl = coverFileName
    ? `https://uploads.mangadex.org/covers/${item.id}/${coverFileName}.256.jpg`
    : '';

  return {
    mangadexId: item.id,
    title,
    author,
    genre: tags.length > 0 ? tags : ['General'],
    publicationStatus: attr.status || 'ongoing',
    lastChapter: Number(attr.lastChapter) || 0,
    coverUrl,
    description: description.slice(0, 300)
  };
}

/**
 * @desc    Cari manga langsung dari API Eksternal MangaDex
 * @route   GET /api/mangadex/search?title=naruto&limit=10
 * @access  Public
 */
export const searchMangaDex = async (req, res, next) => {
  try {
    const { title = '', limit = 10 } = req.query;

    if (!title.trim()) {
      res.status(400);
      throw new Error('Query parameter "title" wajib diisi untuk mencari di MangaDex');
    }

    const safeLimit = Math.min(25, Math.max(1, parseInt(limit, 10) || 10));
    const url = `${MANGADEX_BASE_URL}/manga?title=${encodeURIComponent(
      title
    )}&limit=${safeLimit}&includes[]=cover_art&includes[]=author&order[relevance]=desc`;

    const response = await fetch(url, { headers: HEADERS });

    if (!response.ok) {
      res.status(response.status);
      throw new Error(`MangaDex API error: ${response.statusText}`);
    }

    const json = await response.json();
    const formatted = (json.data || []).map(formatMangaDexItem);

    res.status(200).json({
      success: true,
      source: 'MangaDex External API',
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ambil detail manga dari MangaDex dan langsung simpan (import) ke MongoDB
 * @route   POST /api/mangadex/import/:mangadexId
 * @access  Public
 */
export const importFromMangaDex = async (req, res, next) => {
  try {
    const { mangadexId } = req.params;
    const { status = 'Plan to Read', currentChapter = 0, rating = 0, notes = '' } = req.body || {};

    // Cek apakah sudah pernah diimport ke MongoDB
    const existing = await Comic.findOne({ mangadexId });
    if (existing) {
      res.status(409);
      throw new Error(`Komik "${existing.title}" sudah ada di koleksi Anda`);
    }

    const url = `${MANGADEX_BASE_URL}/manga/${encodeURIComponent(
      mangadexId
    )}?includes[]=cover_art&includes[]=author`;

    const response = await fetch(url, { headers: HEADERS });

    if (response.status === 404) {
      res.status(404);
      throw new Error(`Manga dengan MangaDex ID "${mangadexId}" tidak ditemukan`);
    }

    if (!response.ok) {
      res.status(response.status);
      throw new Error(`Gagal mengambil data dari MangaDex: ${response.statusText}`);
    }

    const json = await response.json();
    const manga = formatMangaDexItem(json.data);

    const newComic = await Comic.create({
      title: manga.title,
      author: manga.author,
      genre: manga.genre,
      status,
      currentChapter,
      totalChapters: manga.lastChapter,
      rating,
      notes: notes || manga.description,
      mangadexId: manga.mangadexId,
      coverUrl: manga.coverUrl,
      source: 'mangadex'
    });

    res.status(201).json({
      success: true,
      message: `Berhasil mengimpor "${newComic.title}" dari MangaDex ke MongoDB`,
      data: newComic
    });
  } catch (error) {
    next(error);
  }
};
