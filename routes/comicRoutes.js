import express from 'express';
import {
  getAllComics,
  getComicById,
  createComic,
  updateComic,
  deleteComic,
  getComicStats
} from '../controllers/comicController.js';

const router = express.Router();

// Statistik harus diletakkan sebelum /:id agar tidak tertukar sebagai parameter ID
router.get('/stats', getComicStats);

// Route koleksi utama & query parameter (?search, ?status, ?genre, ?sort)
router.route('/').get(getAllComics).post(createComic);

// Dynamic routing dengan Path Parameter (/:id)
router.route('/:id').get(getComicById).put(updateComic).delete(deleteComic);

export default router;
