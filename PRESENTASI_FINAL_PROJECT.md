# 🎤 Materi Presentasi Final Project (Wajib Export ke PDF)
> Sesuai Ketentuan B: Kumpulkan PPT dalam format PDF dan upload ke repository GitHub.

---

## Slide 1: Judul Aplikasi & Identitas
- **Judul Aplikasi:** Webcomics Tracker V2 REST API
- **Nama Mentee:** Zaky Muhammad Althaf
- **NIM:** 2610512121
- **Program:** Study Club Backend Basic — KSM Veterantech UPNVJ 2026

---

## Slide 2: Arsitektur Aplikasi (MVC + External API)
- **Pattern:** Modular MVC (*Model - Controller - Routes*) + *Middleware*
- **Tech Stack:** Node.js, Express.js, MongoDB + Mongoose, Dotenv, CORS
- **Alur Data:**
  1. **Client / Postman** mengirim HTTP Request ke **Routes** (`comicRoutes.js` / `mangadexRoutes.js`).
  2. **Controllers** memvalidasi input, menjalankan `try...catch`, lalu memproses data ke **Model** (`Comic.js`) di **MongoDB** atau memanggil **MangaDex External API** (`api.mangadex.org`).
  3. **Middleware** (`errorHandler.js`) menangkap error dan mengembalikan HTTP status code yang sesuai (`200`, `201`, `400`, `404`, `409`, `500`).

---

## Slide 3: Link Repository GitHub
- **Link GitHub:** `https://github.com/<username-github-anda>/webcomics-v2` *(Ganti dengan link repo public Anda setelah push)*
- **Kelengkapan Repo:**
  - Kode modular MVC lengkap
  - `postman_collection.json` untuk pengujian
  - `README.md` dan `.env.example`
  - `.gitignore` (aman tanpa `.env` dan `node_modules`)

---

## Slide 4: HTTP Method & Endpoint yang Digunakan

| HTTP Method | Endpoint | Kegunaan |
|---|---|---|
| **GET** | `/api/comics` | Mengambil semua data komik + Query Parameter (`?search=`, `?status=`, `?genre=`, `?sort=`) |
| **GET** | `/api/comics/stats` | Mengambil statistik agregasi koleksi menggunakan MongoDB `$group` |
| **GET** | `/api/comics/:id` | Mengambil 1 detail komik menggunakan Dynamic Path Parameter (`:id`) |
| **POST** | `/api/comics` | Menambahkan komik baru ke MongoDB |
| **PUT** | `/api/comics/:id` | Mengubah data, progres chapter, atau rating komik (auto-status `Completed`) |
| **DELETE** | `/api/comics/:id` | Menghapus komik dari MongoDB |
| **GET** | `/api/mangadex/search` | Mencari manga secara real-time dari **MangaDex External API** |
| **POST** | `/api/mangadex/import/:mangadexId` | Mengimpor data manga dari MangaDex langsung ke MongoDB |

---

## Slide 5: Kesimpulan
- Proyek **Webcomics Tracker V2** berhasil memenuhi seluruh persyaratan backend dasar: arsitektur modular MVC, integrasi database persisten **MongoDB**, dynamic routing (`:id` dan query parameters), error handling terstruktur (`try...catch` + status code), serta keamanan `.env`.
- Nilai tambah utama aplikasi ini adalah integrasi dengan **MangaDex External API** menggunakan native `fetch`, sehingga pengguna tidak perlu mengetik seluruh detail manga secara manual dan dapat langsung mengimpornya ke database MongoDB pribadi.
