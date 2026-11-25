import express from 'express';
import { searchMangaDex, importFromMangaDex } from '../controllers/mangadexController.js';

const router = express.Router();

// Mencari manga dari API eksternal MangaDex (?title=...&limit=...)
router.get('/search', searchMangaDex);

// Mengimpor manga dari MangaDex langsung ke database MongoDB lokal
router.post('/import/:mangadexId', importFromMangaDex);

export default router;
