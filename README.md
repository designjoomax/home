# Joomax Portal: Home

Halaman Home (HTML, CSS, JS biasa, tanpa build). Live: https://designjoomax.github.io/home/

Header, footer, dan welcome screen dimuat dari repo masing-masing:
- Welcome screen: `https://designjoomax.github.io/welcomescreen/welcome.js` (di `<head>`)
- Header & footer: `https://designjoomax.github.io/headerfooter/` (menu dan link footer diatur DI SANA)

## Struktur
```
index.html            struktur halaman + pemanggil script
css/home.css          tampilan
js/home.config.js     semua isi dan link (edit di sini)
js/home.js            slider banner, render kartu, pencarian
assets/               khusus gambar
  banner/             gambar banner slide
  thumb/              thumbnail Quick Access dan Tools
  icon/icon.png       favicon
  img/link-preview.jpg  gambar preview link (WhatsApp, dll)
```

## Mengatur isi (`js/home.config.js`)
| Bagian | Cara |
|---|---|
| Banner | Taruh gambar di `assets/banner/`, ubah `img` di `banner.items`. Tambah/hapus item bebas. Ukuran terbaik 1440 x 530. `autoplay: 0` = tidak otomatis |
| Quick Access | Satu item = satu kartu. Lebih dari 2 item otomatis bisa digeser (panah muncul sendiri) |
| Featured Tools | Tiga kartu tools: `name`, `desc`, `href`, `thumb` |
| Latest Memories | Item pertama tampil besar. `id` harus sama dengan `id` album di repo gallery. `img` kosong = placeholder |

`href: "#"` = link sementara. Link ke luar situs otomatis dibuka di tab baru.

## Menambah menu nanti
Tambah satu item di `quick` atau `tools`, selesai. Menu header/footer ditambah di repo `headerfooter` (`joomax-layout.config.js`).

## Link preview (tr.ee/joomax, WhatsApp, dll)
Teks dan link ada di blok `LINK PREVIEW` di `<head>` `index.html`. Ganti gambar `assets/img/link-preview.jpg` (1200x630, di bawah 300 KB), lalu naikkan `?v=1` jadi `?v=2` di dua baris gambar supaya cache preview ter-refresh. Tag ini harus ada langsung di HTML (bukan dari JavaScript) karena aplikasi chat membacanya tanpa menjalankan script.

## Deploy (GitHub Pages)
Upload isi folder ini ke root repo `home`, lalu Settings > Pages > Deploy from branch > `main` / `(root)`.
