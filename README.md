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
├── .postman/
│   └── resources.yaml                  # Konfigurasi Postman Local Mode (v3 YAML)
├── Webcomics Tracker V2 - REST API/    # Koleksi 10 request Postman (format v3 YAML)
├── PRESENTASI_FINAL_PROJECT.md         # Materi slide presentasi wajib
├── README.md                           # Dokumentasi project & panduan testing
└── server.js                           # Entry point aplikasi Express
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

## 🧪 Panduan Pengujian Semua Endpoint di Postman

Project ini menggunakan **Postman v3 YAML** di folder `Webcomics Tracker V2 - REST API/` (terhubung otomatis via `.postman/resources.yaml`) dengan `baseUrl` = `http://localhost:3000`.

> [!IMPORTANT]
> Sebelum mengetes di Postman, pastikan server sudah berjalan (`npm run dev`) dan muncul pesan:  
> `🚀 Server Webcomics V2 berjalan di http://localhost:3000` dan `✅ MongoDB Terhubung`.

### Langkah Testing Berurutan (0 s.d. 9)

| # | Request | Cara Mengisi & Menjalankan | Hasil yang Diharapkan |
|---|---|---|---|
| **0** | **Health Check (Root)** (`GET /`) | Langsung klik **Send**. | `200 OK` + info author & daftar endpoint. |
| **1** | **Create Comic (Manual)** (`POST /api/comics`) | Klik tab **Body** di **bagian atas** (di bawah URL bar, sejajar Params/Headers) → pilih **raw** → **JSON**. Edit JSON (`title`, `author`, `genre`, `status`, `publicationStatus`, `currentChapter`, `totalChapters`, `rating`, `notes`) → **Send**. *(Jangan klik panel Response di bawah karena bersifat read-only).* | `201 Created` + data komik tersimpan di MongoDB. |
| **2** | **Get All Comics** (`GET /api/comics`) | Langsung klik **Send**. Salin salah satu `_id` (24 karakter hex) untuk tes nomor 4, 5, dan 6. | `200 OK` + daftar semua komik di MongoDB. |
| **3** | **Search & Filter Comics** (`GET /api/comics`) | Buka tab **Params** (Key & Value):<br>• `search`: judul/author (misal `Solo`)<br>• `status`: `Reading`, `Plan to Read`, `Completed`, atau `Dropped`<br>• `genre`: misal `Action`<br>• `sort`: `rating` (tertinggi ke terendah, **tanpa tanda minus**), `chapter`, atau `title` (A–Z). | `200 OK` + daftar komik sesuai filter/urutan. |
| **4** | **Get Comic By ID** (`GET /api/comics/:id`) | Ganti `{{comicId}}` **langsung di kotak URL** dengan 24 karakter `_id` dari langkah 2 (contoh: `http://localhost:3000/api/comics/6b09784e742d076a392574fc`). **Jangan taruh di tab Params.** | `200 OK` + detail 1 komik. |
| **5** | **Update Comic By ID** (`PUT /api/comics/:id`) | Ganti `{{comicId}}` di **kotak URL**, lalu di tab **Body → raw → JSON** kirim hanya field yang ingin diubah (misal `currentChapter`, `rating`, `notes`). Field lain tetap aman. Jika `currentChapter >= totalChapters`, `status` otomatis menjadi `Completed`. | `200 OK` + data komik terbarui. |
| **6** | **Delete Comic By ID** (`DELETE /api/comics/:id`) | Ganti `{{comicId}}` di **kotak URL** dengan `_id` target → klik **Send**. | `200 OK` + pesan komik berhasil dihapus. |
| **7** | **Get Collection Stats** (`GET /api/comics/stats`) | Langsung klik **Send**. | `200 OK` + `summary` (`totalComics`, `totalChaptersRead`, `averageRating`), `statusBreakdown`, dan `topRated`. |
| **8** | **External: Search AniList API** (`GET /api/anilist/search`) | Buka tab **Params** → isi Key `title` dengan judul manga (misal `Frieren`) dan `limit` (misal `5`) → **Send**. Salin angka `anilistId` dari hasil (misal `118586`). | `200 OK` + hasil real-time dari AniList GraphQL API (termasuk `publicationStatus`). |
| **9** | **External: Import Manga from AniList** (`POST /api/anilist/import/:anilistId`) | **Kosongkan tab Params!** Ganti `{{anilistId}}` **langsung di kotak URL** dengan angka ID dari langkah 8 (contoh: `http://localhost:3000/api/anilist/import/118586`). Opsional ubah `status`/`currentChapter`/`rating` di **Body → raw → JSON** (default: `Plan to Read`, chapter `0`). | `201 Created` + komik otomatis masuk ke MongoDB lengkap dengan `coverUrl` & `publicationStatus`. |

### Nilai Status yang Valid pada Schema (`Comic.js`)
- **`status`** *(progres baca pengguna)*: `Reading`, `Plan to Read` *(default)*, `Completed`, `Dropped`
- **`publicationStatus`** *(status rilis komik)*: `Ongoing`, `Completed`, `Hiatus`, `Cancelled`, `Upcoming`, `Unknown` *(otomatis dipetakan dari AniList saat import)*

---

## 🛠️ Troubleshooting & Solusi Kendala Umum

1. **`Error: listen EADDRINUSE :::5000` atau `403 Forbidden` saat tes di Postman (khusus macOS)**  
   - **Penyebab:** Layanan bawaan macOS (*Control Center / AirPlay Receiver*) memakai port `5000` dan membalas `403 Forbidden`.  
   - **Solusi:** Gunakan `PORT=3000` di file `.env` dan pastikan `baseUrl` di Postman bernilai `http://localhost:3000`.

2. **MongoDB gagal terhubung (`current IP address not added` / timeout)**  
   - **Penyebab:** IP lokal belum diizinkan di MongoDB Atlas atau format `MONGO_URI` di `.env` masih memakai placeholder `<db_password>`.  
   - **Solusi:** Buka **MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`) → Confirm**, tunggu hingga status *Active*. Pastikan password di `.env` ditulis tanpa tanda `< >` dan sertakan nama database (misal `.../webcomics_db?retryWrites=true&w=majority`).

3. **Warning Postman: *"Postman no longer supports JSON for collection and environment local mode"***  
   - **Penyebab:** Postman Local Mode mewajibkan format **v3 YAML**, bukan `.json` lama.  
   - **Solusi:** Repository ini sudah dikonversi ke format v3 YAML di folder `Webcomics Tracker V2 - REST API/` dan didaftarkan di `.postman/resources.yaml`. Gunakan folder koleksi tersebut langsung tanpa import JSON.

4. **Postman menampilkan *"Cannot edit in read-only editor"* saat ingin menulis JSON**  
   - **Penyebab:** Panel bawah (`Response` / `History`) selalu bersifat *read-only*.  
   - **Solusi:** Klik tab **`Body`** di **panel atas** (tepat di bawah kolom URL, sebelah `Params`/`Headers`), pilih **`raw`** dan **`JSON`**, lalu edit teks JSON di kotak tersebut.

5. **Error `400 Format ID komik tidak valid` atau `404` pada Get/Update/Delete By ID atau Import AniList**  
   - **Penyebab:** Nilai ID ditaruh di tab **Params** (sebagai query param) atau placeholder `{{comicId}}` / `{{anilistId}}` belum diganti di URL.  
   - **Solusi:** Kosongkan tab **Params** dan masukkan ID **langsung di kotak URL** setelah garis miring terakhir (24 karakter hex untuk MongoDB `_id`, atau angka ID untuk `anilistId`).

6. **Mengapa `totalChapters` bernilai `0` pada manga ongoing yang diimpor dari AniList?**  
   - **Penjelasan:** Untuk judul yang masih `RELEASING` (ongoing, misalnya *Frieren* atau *One Piece*), AniList GraphQL API mengembalikan `chapters: null` hingga seri tersebut tamat (`FINISHED`). Backend menyimpan `totalChapters: 0` dan menandai kondisi rilisnya di `publicationStatus: "Ongoing"`.

7. **Mengapa menggunakan AniList API (bukan MangaDex atau MyAnimeList/Jikan)?**  
   - **Penjelasan:** `api.mangadex.org` diblokir oleh sebagian ISP di Indonesia (`fetch failed` tanpa VPN), dan Jikan/MyAnimeList sering mengalami *timeout*. **AniList GraphQL API** (`https://graphql.anilist.co`) dapat diakses langsung tanpa VPN maupun API key.

---

## 🔒 Keamanan & GitHub

- File `.env` dan folder `node_modules/` sudah dimasukkan ke dalam `.gitignore` sehingga kredensial database aman dan tidak ikut ter-commit ke GitHub.
- Gunakan *semantic commit messages* saat push ke repository:
  ```bash
  git init
  git add .
  git commit -m "feat: initialize Webcomics V2 REST API with MongoDB and AniList integration"
  ```
