# 📚 Webcomics Tracker V2 — REST API (Express.js + MongoDB + AniList API)

> **Final Project Study Club Backend Basic — KSM Veterantech UPNVJ 2026**  
> **Nama:** Zaky Muhammad Althaf  
> **NIM:** 2610512121  
> **Judul Project:** Webcomics Tracker V2 REST API

---

## 📌 Deskripsi Project

**Webcomics Tracker V2** adalah RESTful API berbasis **Node.js**, **Express.js**, dan **MongoDB (Mongoose)** untuk mengelola daftar bacaan manga, manhwa, dan webtoon. Selain mendukung operasi CRUD penuh ke database MongoDB, API ini terintegrasi langsung dengan **AniList GraphQL API** sehingga pengguna dapat mencari ribuan judul manga secara *real-time* dan langsung mengimpornya ke koleksi MongoDB pribadi.

---

## 🏗️ Arsitektur Modular (MVC)

```text
webcomics-v2/
├── config/
│   └── db.js                   # Konfigurasi koneksi MongoDB via Mongoose
├── controllers/
│   ├── comicController.js      # Logika CRUD, query filter, & statistik agregasi
│   └── anilistController.js   # Integrasi AniList API (Search & Import ke MongoDB)
├── middleware/
│   └── errorHandler.js         # Centralized error handling & 404 handler
├── models/
│   └── Comic.js                # Mongoose Schema & validasi data komik
├── routes/
│   ├── comicRoutes.js          # Endpoint /api/comics (Path & Query parameters)
│   └── anilistRoutes.js       # Endpoint /api/anilist
├── .env.example                # Template environment variable
├── .gitignore                  # Mengecualikan node_modules dan .env dari Git
├── package.json                # Daftar package dan script npm
├── postman_collection.json     # Koleksi endpoint Postman siap pakai
├── PRESENTASI_FINAL_PROJECT.md # Materi slide presentasi wajib
├── README.md                   # Dokumentasi project
└── server.js                   # Entry point aplikasi Express
```

---

## ⚙️ Instalasi & Menjalankan Server

### 1. Prasyarat
- **Node.js** v18+ (memiliki fitur `fetch` bawaan)
- **MongoDB** (bisa menggunakan MongoDB Atlas Cloud atau MongoDB lokal)

### 2. Langkah Instalasi
```bash
# 1. Masuk ke folder project
cd webcomics-v2

# 2. Install seluruh dependencies
npm install

# 3. Duplikat .env.example menjadi .env lalu isi MONGO_URI Anda
cp .env.example .env
```

### 3. Konfigurasi Environment Variable (`.env`)
| Variable | Keterangan | Contoh |
|---|---|---|
| `PORT` | Port server Express berjalan | `3000` |
| `MONGO_URI` | Connection string MongoDB Atlas / Lokal | `mongodb+srv://user:pass@cluster0.mongodb.net/webcomics_db` |

### 4. Jalankan Server
```bash
# Mode normal
npm start

# Mode development (auto-reload)
npm run dev
```
Server akan berjalan di `http://localhost:3000`.

---

## 🌐 Daftar Endpoint API

### A. Koleksi Komik (MongoDB CRUD)

| Method | Endpoint | Parameter | Deskripsi |
|---|---|---|---|
| `GET` | `/` | - | Cek status server & daftar endpoint |
| `GET` | `/api/comics` | Query: `?search=`, `?status=`, `?genre=`, `?sort=` | Ambil semua komik dengan filter & sorting |
| `GET` | `/api/comics/stats` | - | Statistik agregasi (total komik, total chapter, rata-rata rating) |
| `GET` | `/api/comics/:id` | Path: `:id` (MongoDB ObjectId) | Ambil detail 1 komik |
| `POST` | `/api/comics` | Body JSON (`title`, `author`, `genre`, `status`, `rating`, dll) | Tambah komik baru ke MongoDB |
| `PUT` | `/api/comics/:id` | Path: `:id`, Body JSON | Update data, progres chapter, atau rating komik |
| `DELETE` | `/api/comics/:id` | Path: `:id` | Hapus komik dari MongoDB |

### B. Integrasi Eksternal (AniList API)

| Method | Endpoint | Parameter | Deskripsi |
|---|---|---|---|
| `GET` | `/api/anilist/search` | Query: `?title=Solo Leveling&limit=5` | Cari komik langsung dari database AniList |
| `POST` | `/api/anilist/import/:anilistId` | Path: `:anilistId`, Body opsional (`status`, `rating`, `currentChapter`) | Import komik dari AniList ke MongoDB lokal |

---

## 🧪 Pengujian dengan Postman

1. Buka aplikasi **Postman**.
2. Klik **Import** dan pilih file [`postman_collection.json`](./postman_collection.json).
3. Pastikan variable `baseUrl` bernilai `http://localhost:3000`.
4. Jalankan request secara berurutan (Create -> Get All -> Search -> Update -> Delete, serta AniList Search & Import).

---

## 🔒 Keamanan & GitHub

- File `.env` dan folder `node_modules/` sudah dimasukkan ke dalam `.gitignore` sehingga kredensial database aman dan tidak ikut ter-commit ke GitHub.
- Gunakan *semantic commit messages* saat push ke repository:
  ```bash
  git init
  git add .
  git commit -m "feat: initialize Webcomics V2 REST API with MongoDB and AniList integration"
  ```
