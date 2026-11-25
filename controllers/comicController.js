import Comic from '../models/Comic.js';

/**
 * @desc    Ambil semua komik dengan dukungan query filter (?search, ?status, ?genre, ?sort)
 * @route   GET /api/comics
 * @access  Public
 */
export const getAllComics = async (req, res, next) => {
  try {
    const { search, status, genre, sort } = req.query;
    const filter = {};

    // Filter pencarian judul atau author (case-insensitive)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter berdasarkan status bacaan
    if (status) {
      filter.status = status;
    }

    // Filter berdasarkan genre (case-insensitive)
    if (genre) {
      filter.genre = { $regex: genre, $options: 'i' };
    }

    // Pengaturan sorting (default: terbaru di atas)
    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'title') sortOption = { title: 1 };
    else if (sort === 'chapter') sortOption = { currentChapter: -1 };

    const comics = await Comic.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      count: comics.length,
      data: comics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ambil detail satu komik berdasarkan ID (Path Parameter /:id)
 * @route   GET /api/comics/:id
 * @access  Public
 */
export const getComicById = async (req, res, next) => {
  try {
    const comic = await Comic.findById(req.params.id);

    if (!comic) {
      res.status(404);
      throw new Error(`Komik dengan ID ${req.params.id} tidak ditemukan`);
    }

    res.status(200).json({
      success: true,
      data: comic
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Tambah komik baru ke MongoDB
 * @route   POST /api/comics
 * @access  Public
 */
export const createComic = async (req, res, next) => {
  try {
    const {
      title,
      author,
      genre,
      status,
      currentChapter,
      totalChapters,
      rating,
      notes,
      mangadexId,
      coverUrl
    } = req.body;

    if (!title || title.trim() === '') {
      res.status(400);
      throw new Error('Judul komik wajib diisi');
    }

    const comic = await Comic.create({
      title,
      author,
      genre: Array.isArray(genre) ? genre : genre ? genre.split(',').map((g) => g.trim()) : ['General'],
      status,
      currentChapter,
      totalChapters,
      rating,
      notes,
      ...(mangadexId && { mangadexId, source: 'mangadex' }),
      coverUrl
    });

    res.status(201).json({
      success: true,
      message: `Komik "${comic.title}" berhasil ditambahkan`,
      data: comic
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update data komik berdasarkan ID (termasuk progres chapter & rating)
 * @route   PUT /api/comics/:id
 * @access  Public
 */
export const updateComic = async (req, res, next) => {
  try {
    const comic = await Comic.findById(req.params.id);

    if (!comic) {
      res.status(404);
      throw new Error(`Komik dengan ID ${req.params.id} tidak ditemukan`);
    }

    const fields = [
      'title',
      'author',
      'status',
      'currentChapter',
      'totalChapters',
      'rating',
      'notes',
      'coverUrl'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        comic[field] = req.body[field];
      }
    });

    if (req.body.genre !== undefined) {
      comic.genre = Array.isArray(req.body.genre)
        ? req.body.genre
        : req.body.genre.split(',').map((g) => g.trim());
    }

    const updatedComic = await comic.save();

    res.status(200).json({
      success: true,
      message: `Komik "${updatedComic.title}" berhasil diperbarui`,
      data: updatedComic
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Hapus komik berdasarkan ID
 * @route   DELETE /api/comics/:id
 * @access  Public
 */
export const deleteComic = async (req, res, next) => {
  try {
    const comic = await Comic.findByIdAndDelete(req.params.id);

    if (!comic) {
      res.status(404);
      throw new Error(`Komik dengan ID ${req.params.id} tidak ditemukan`);
    }

    res.status(200).json({
      success: true,
      message: `Komik "${comic.title}" berhasil dihapus`,
      data: comic
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Statistik agregasi koleksi komik (total, status, rata-rata rating, total chapter)
 * @route   GET /api/comics/stats
 * @access  Public
 */
export const getComicStats = async (req, res, next) => {
  try {
    const stats = await Comic.aggregate([
      {
        $group: {
          _id: null,
          totalComics: { $sum: 1 },
          totalChaptersRead: { $sum: '$currentChapter' },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const statusBreakdown = await Comic.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const topRated = await Comic.find().sort({ rating: -1 }).limit(3).select('title rating status');

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0]
          ? {
              totalComics: stats[0].totalComics,
              totalChaptersRead: stats[0].totalChaptersRead,
              averageRating: Number(stats[0].averageRating.toFixed(2))
            }
          : { totalComics: 0, totalChaptersRead: 0, averageRating: 0 },
        statusBreakdown,
        topRated
      }
    });
  } catch (error) {
    next(error);
  }
};
