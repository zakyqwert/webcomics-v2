import express from 'express';
import { searchAniList, importFromAniList } from '../controllers/anilistController.js';

const router = express.Router();

// Mencari manga/manhwa/webtoon dari API eksternal AniList (?title=...&limit=...)
router.get('/search', searchAniList);

// Mengimpor manga dari AniList langsung ke database MongoDB lokal
router.post('/import/:anilistId', importFromAniList);

export default router;
