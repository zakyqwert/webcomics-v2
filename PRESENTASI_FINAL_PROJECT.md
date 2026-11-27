Materi Presentasi Final Project - Webcomics Tracker V2 REST API
================================================================

Dokumen ini berisi ringkasan materi 15 slide yang digunakan pada PRESENTASI_FINAL_PROJECT.pdf dan PRESENTASI_FINAL_PROJECT.pptx.

---

Slide 1: Cover
--------------

Judul: Webcomics Tracker V2 REST API
Subjudul: Final Project Backend - Study Club Backend Basic KSM Veterantech UPNVJ 2026
Disusun oleh: Zaky Muhammad Althaf (2610512121)

---

Slide 2: Gambaran Umum
----------------------

- Webcomics Tracker V2 adalah REST API untuk melacak koleksi komik dan manga: judul, author, genre, status baca, rating, chapter, dan cover.
- Mendukung CRUD lengkap dengan fitur pencarian (?search), filter (?status, ?genre), dan pengurutan (?sort=rating).
- Data tersimpan persisten di MongoDB Atlas (5 komik aktif: Solo Leveling, One Piece, Tower of God, Omniscient Reader, Frieren).
- Integrasi AniList GraphQL API: cari manga langsung dari database AniList dan import otomatis ke koleksi lokal.
- Tech Stack: Node.js v24 (ES Modules), Express.js, MongoDB Atlas, Mongoose, Postman, Git dan GitHub.

---

Slide 3: Arsitektur Aplikasi (MVC)
----------------------------------

Alur Request:
Client (Postman) -> Routes -> Controller -> Model -> MongoDB Atlas

Struktur Folder:
- server.js: Entry point, PORT=3000
- config/db.js: Koneksi MongoDB Atlas
- models/Comic.js: Skema data Comic (Mongoose)
- controllers/: Logika CRUD, Stats, dan AniList
- routes/: Endpoint /api/comics dan /api/anilist
- middleware/: Error handling (400, 404, 500)

Koleksi Postman: Webcomics Tracker V2 - REST API/ (YAML v3)
External API: AniList GraphQL (https://graphql.anilist.co, tanpa API key)

---

Slide 4: Method dan Endpoint
----------------------------

Total 9 Endpoint (1 Health Check + 8 Endpoint Utama) pada Base URL http://localhost:3000:

1. GET    /                              - Health check status server dan info API
2. GET    /api/comics                    - Ambil semua komik (+ search, filter, sort)
3. GET    /api/comics/:id                - Ambil satu komik berdasarkan ID
4. POST   /api/comics                    - Tambah komik manual
5. PUT    /api/comics/:id                - Update data komik berdasarkan ID
6. DELETE /api/comics/:id                - Hapus komik berdasarkan ID
7. GET    /api/comics/stats              - Statistik koleksi (MongoDB aggregate)
8. GET    /api/anilist/search?title=&limit= - Cari manga di AniList GraphQL API
9. POST   /api/anilist/import/:anilistId   - Import manga dari AniList ke MongoDB

Catatan: Parameter :id diisi langsung di URL bar, bukan di tab Params.

---

Slide 5: Tempat Meletakkan ID di Postman
----------------------------------------

Variabel Koleksi (Collection Variables):
- base_url: http://localhost:3000
- comicId: Paste _id dari response GET All atau POST
- anilistId: 105398 (Solo Leveling)

Aturan Pengujian:
- Path parameter seperti {{comicId}} atau {{anilistId}} dimasukkan langsung di URL bar (contoh: {{base_url}}/api/comics/{{comicId}}).
- Tab Params hanya digunakan untuk query string (?search=, ?status=, ?genre=, ?sort=rating).

---

Slide 6: Hasil Pengujian - Create (POST)
----------------------------------------

Endpoint: POST {{base_url}}/api/comics
Status: 201 Created
Body JSON: title, author, genre, status, currentChapter, totalChapters, rating, notes.
Response mengembalikan objek komik baru dengan _id dari MongoDB dan source: "manual".

---

Slide 7: Hasil Pengujian - Get All dan Get By ID
------------------------------------------------

- GET {{base_url}}/api/comics -> 200 OK, menampilkan daftar seluruh komik beserta jumlahnya (count).
- GET {{base_url}}/api/comics/{{comicId}} -> 200 OK, menampilkan detail satu komik berdasarkan _id.

---

Slide 8: Hasil Pengujian - Search, Filter, dan Sort
---------------------------------------------------

- Search by Title: GET {{base_url}}/api/comics?search=solo -> 200 OK, menampilkan hasil yang cocok.
- Filter + Sort: GET {{base_url}}/api/comics?status=Reading&sort=rating -> 200 OK, menampilkan komik berstatus Reading terurut dari rating tertinggi (tanpa tanda minus pada sort=rating).

---

Slide 9: Hasil Pengujian - Update (Before dan After)
----------------------------------------------------

Endpoint: PUT {{base_url}}/api/comics/{{comicId}} -> 200 OK
Contoh pembaruan pada Frieren: mengubah status dari "Plan to Read" menjadi "Reading", currentChapter dari 0 ke 28, dan rating menjadi 9.3.

---

Slide 10: Hasil Pengujian - Delete dan Cek 404
----------------------------------------------

1. DELETE {{base_url}}/api/comics/{{comicId}} -> 200 OK ("Comic berhasil dihapus").
2. Cek ulang dengan GET {{base_url}}/api/comics/{{comicId}} -> 404 Not Found ("Comic tidak ditemukan").
Hal ini membuktikan data benar-benar terhapus permanen dari MongoDB Atlas.

---

Slide 11: Hasil Pengujian - AniList Search ke Import
----------------------------------------------------

1. Cari di AniList Search: GET {{base_url}}/api/anilist/search?title=Solo+Leveling -> 200 OK.
2. Salin nilai "anilistId" dari hasil pencarian (contoh: 105398).
3. Paste anilistId tersebut ke URL AniList Import: POST {{base_url}}/api/anilist/import/105398 -> 201 Created.
Data manga langsung tersimpan ke MongoDB dengan source: "anilist", publicationStatus, totalChapters, dan coverUrl.

---

Slide 12: Hasil Pengujian - Health Check dan Stats
--------------------------------------------------

- Health Check: GET {{base_url}}/ -> 200 OK, memastikan server Express aktif di port 3000 sebelum pengujian endpoint lain.
- Collection Stats: GET {{base_url}}/api/comics/stats -> 200 OK, menampilkan totalComics, jumlah per status (byStatus), dan rata-rata rating (avgRating) menggunakan MongoDB aggregate.

---

Slide 13: Link GitHub
---------------------

Repository: https://github.com/zakyqwert/webcomics-v2
Isi repo: kode sumber, README (panduan setup dan testing lengkap), Postman Collection YAML, .env.example, serta file presentasi (PDF dan PPTX) dan QR code menuju repository.

---

Slide 14: Kesimpulan
--------------------

- Seluruh ketentuan terpenuhi: CRUD lengkap, MongoDB Atlas persisten, arsitektur MVC modular, dynamic routing, error handling (400/404/500), dan pengujian endpoint via Postman.
- Yang dipelajari: membangun REST API dengan Node.js ES Modules, menghubungkan Express dengan MongoDB via Mongoose, menangani error, dan mengintegrasikan API eksternal (AniList GraphQL).
- Pengembangan selanjutnya: autentikasi pengguna (JWT), pagination, multiple reading lists, notifikasi chapter baru, dan deployment cloud.

---

Slide 15: Thank You
-------------------

Zaky Muhammad Althaf (2610512121)
Study Club Backend Basic - KSM Veterantech UPNVJ 2026
