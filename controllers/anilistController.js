import Comic from '../models/Comic.js';

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';

/**
 * Helper untuk mengirim query GraphQL ke AniList API.
 */
async function fetchAniList(query, variables) {
  const response = await fetch(ANILIST_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  const json = await response.json();

  if (!response.ok || json.errors) {
    const errMsg = json.errors?.[0]?.message || response.statusText;
    const error = new Error(`AniList API error: ${errMsg}`);
    error.statusCode = response.status === 404 ? 404 : response.status || 502;
    throw error;
  }

  return json.data;
}

/**
 * Helper untuk memformat response mentah dari AniList menjadi objek ringkas.
 */
function formatAniListItem(item) {
  const title = item.title?.english || item.title?.romaji || item.title?.native || 'Untitled';
  const author = item.staff?.nodes?.[0]?.name?.full || 'Unknown';
  const genre = Array.isArray(item.genres) && item.genres.length > 0 ? item.genres : ['General'];
  const coverUrl = item.coverImage?.large || item.coverImage?.medium || '';
  const cleanDescription = (item.description || '').replace(/<[^>]*>/g, '').trim().slice(0, 300);

  return {
    anilistId: String(item.id),
    title,
    author,
    genre,
    publicationStatus: item.status || 'RELEASING',
    totalChapters: Number(item.chapters) || 0,
    coverUrl,
    description: cleanDescription
  };
}

/**
 * @desc    Cari manga/manhwa/webtoon langsung dari API Eksternal AniList
 * @route   GET /api/anilist/search?title=Solo Leveling&limit=5
 * @access  Public
 */
export const searchAniList = async (req, res, next) => {
  try {
    const { title = '', limit = 10 } = req.query;

    if (!title.trim()) {
      res.status(400);
      throw new Error('Query parameter "title" wajib diisi untuk mencari di AniList');
    }

    const safeLimit = Math.min(25, Math.max(1, parseInt(limit, 10) || 10));

    const query = `
      query ($search: String, $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(search: $search, type: MANGA, sort: SEARCH_MATCH) {
            id
            title {
              romaji
              english
              native
            }
            genres
            status
            chapters
            coverImage {
              large
              medium
            }
            description
            staff(perPage: 1) {
              nodes {
                name {
                  full
                }
              }
            }
          }
        }
      }
    `;

    const data = await fetchAniList(query, { search: title.trim(), perPage: safeLimit });
    const formatted = (data?.Page?.media || []).map(formatAniListItem);

    res.status(200).json({
      success: true,
      source: 'AniList GraphQL API',
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * @desc    Ambil detail manga dari AniList dan langsung simpan (import) ke MongoDB
 * @route   POST /api/anilist/import/:anilistId
 * @access  Public
 */
export const importFromAniList = async (req, res, next) => {
  try {
    const { anilistId } = req.params;
    const numericId = parseInt(anilistId, 10);

    if (!numericId || String(numericId) !== String(anilistId).trim()) {
      res.status(400);
      throw new Error('Parameter "anilistId" harus berupa angka ID AniList yang valid');
    }

    const { status = 'Plan to Read', currentChapter = 0, rating = 0, notes = '' } = req.body || {};

    // Cek apakah sudah pernah diimport ke MongoDB
    const existing = await Comic.findOne({ anilistId: String(numericId) });
    if (existing) {
      res.status(409);
      throw new Error(`Komik "${existing.title}" sudah ada di koleksi Anda`);
    }

    const query = `
      query ($id: Int) {
        Media(id: $id, type: MANGA) {
          id
          title {
            romaji
            english
            native
          }
          genres
          status
          chapters
          coverImage {
            large
            medium
          }
          description
          staff(perPage: 1) {
            nodes {
              name {
                full
              }
            }
          }
        }
      }
    `;

    const data = await fetchAniList(query, { id: numericId });
    if (!data?.Media) {
      res.status(404);
      throw new Error(`Manga dengan AniList ID "${anilistId}" tidak ditemukan`);
    }

    const formatted = formatAniListItem(data.Media);

    const comic = await Comic.create({
      title: formatted.title,
      author: formatted.author,
      genre: formatted.genre,
      status,
      currentChapter,
      totalChapters: formatted.totalChapters,
      rating,
      notes: notes || formatted.description,
      anilistId: formatted.anilistId,
      coverUrl: formatted.coverUrl,
      source: 'anilist'
    });

    res.status(201).json({
      success: true,
      message: `Komik "${comic.title}" berhasil diimpor dari AniList`,
      data: comic
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};
