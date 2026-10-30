# Joomax Portal: Home

Halaman Home (HTML, CSS, JS biasa). Header, footer, dan welcome screen dipanggil lewat script dari repo masing-masing:
- Welcome: https://designjoomax.github.io/welcomescreen/welcome.js (di `<head>`)
- Header & footer: https://designjoomax.github.io/headerfooter/ (akhir `<body>`)

## Atur link dan isi
Semua ada di `assets/js/home.config.js`: Quick Access, pengumuman, tools, gallery. `href: "#"` = link sementara. Gambar tools/gallery kosong = placeholder otomatis; isi `thumb` / `img` dengan path gambar (mis. `assets/img/frame.jpg`).

## Link preview (tr.ee/joomax, WhatsApp, dll)
- Teks dan link ada di blok `LINK PREVIEW` di `<head>` pada `index.html`.
- Gambar: ganti file `assets/img/link-preview.jpg` (1200x630, di bawah 300 KB). Setelah ganti, naikkan `?v=1` jadi `?v=2` di dua baris gambar supaya cache preview ter-refresh.
- Tag ini harus ada langsung di HTML (tidak bisa dari JavaScript), karena aplikasi chat membacanya tanpa menjalankan script.

## File
| File | Fungsi |
|---|---|
| `index.html` | Struktur halaman + pemanggil script |
| `assets/css/home.css` | Tampilan |
| `assets/js/home.config.js` | Semua URL dan isi (edit di sini) |
| `assets/js/home.js` | Render, pencarian, detail pengumuman |

## Deploy (GitHub Pages)
Upload isi folder ini ke root repo, lalu Settings > Pages > Deploy from branch > `main` / `(root)`.
