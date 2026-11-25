import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import comicRoutes from './routes/comicRoutes.js';
import mangadexRoutes from './routes/mangadexRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Load environment variables dari .env
dotenv.config();

// Koneksi ke MongoDB
connectDB();

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint untuk cek status API
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Webcomics Tracker V2 REST API (Express + MongoDB + MangaDex)',
    author: 'Zaky Muhammad Althaf (2610512121)',
    endpoints: {
      comics: '/api/comics',
      stats: '/api/comics/stats',
      mangadexSearch: '/api/mangadex/search?title=solo',
      mangadexImport: '/api/mangadex/import/:mangadexId'
    }
  });
});

// Mount Routes
app.use('/api/comics', comicRoutes);
app.use('/api/mangadex', mangadexRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Webcomics V2 berjalan di http://localhost:${PORT}`);
});
