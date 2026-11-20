# fixs.arts Custom Cursor

Library JavaScript ringan (±30 KB, tanpa dependency) untuk **cursor lingkaran kustom, efek transparan/glass, ripple saat klik, dan trail ala kuas/stylus (jejak gradasi yang memudar seperti ekor roket)**. Pasang di website mana pun dengan satu script tag.

Demo: https://fixsarts.github.io/cursor/demo/

## Fitur
- **Trail menggambar**: goresan halus mengikuti cursor, gradasi warna bebas (1 sampai banyak warna), runcing di ujung, glow, efek tekanan stylus, lalu memudar dan hilang sendiri. Tersedia preset `rocket`, `ink`, `neon`, `aurora`, `stardust`.
- **Panjang kuas bisa diatur** (`trailLength`): dari ekor pendek sampai menjuntai.
- **Sentuhan (touch) di smartphone**: jari = cursor. Trail, percikan, dan efek klik ikut hidup saat geser atau tap, tetap jalan walau halaman di-scroll.
- **Fleksibel on/off**: `FixsCursor.toggle()`, tombol melayang bawaan (`data-toggle="true"`), dan status bisa diingat (`data-remember="true"`).
- **Percikan partikel** saat cursor bergerak: titik, garis api, bintang, atau campuran, lengkap dengan arah, kecepatan, dan gravitasi.
- **7 efek klik**: `ripple`, `double`, `pulse`, `burst`, `confetti`, `sparkle`, `press`, bisa digabung.
- **Transparan dan glass**: atur `opacity`, `hoverOpacity`, dan `blur` (backdrop blur) pada lingkaran.
- Lingkaran yang mengikuti mouse dengan halus (warna dan ukuran bebas), panah bawaan tetap terlihat (bisa disembunyikan).
- Ripple saat klik, beberapa klik berurutan aman, elemen dihapus setelah animasi.
- Efek hover (cursor membesar) di link, tombol, dan elemen interaktif.
- Shadow DOM: tidak bentrok dengan CSS website, tidak mengubah `body` atau `html` secara default, `pointer-events: none`.
- Layar sentuh kini didukung (matikan dengan `data-touch="false"`), menghormati `prefers-reduced-motion`, aman dimuat dua kali.

## Pasang (paling sederhana)
Tambahkan sebelum `</body>` (atau di `<head>`):
```html
<script src="https://fixsarts.github.io/cursor/cursor.js"></script>
```
Cursor langsung aktif.

## Trail dalam satu baris
```html
<script src="https://fixsarts.github.io/cursor/cursor.js" data-preset="rocket"></script>
```
Ganti `rocket` dengan `ink`, `neon`, `aurora`, `stardust`, atau `glass`. Atau atur sendiri:
```html
<script
  src="https://fixsarts.github.io/cursor/cursor.js"
  data-trail="true"
  data-trail-colors="#ffd23f,#ff7a00,#e01e37,#4a0a3d"
  data-trail-size="18"
  data-trail-duration="850"
  data-trail-length="200"
  data-sparks="true"
  data-click-effect="ripple,burst"
  data-opacity="0.5"
  data-blur="4"
></script>
```

## Contoh konfigurasi
```html
<script
  src="https://fixsarts.github.io/cursor/cursor.js"
  data-color="#3330ff"
  data-size="18"
  data-ripple="true"
  data-ripple-color="#3330ff"
  data-ripple-size="90"
  data-ripple-duration="600"
  data-hover-effect="true"
  data-hide-native-cursor="false"
></script>
```
Daftar lengkap opsi, JavaScript API, dan perilaku otomatis: [docs/configuration.md](docs/configuration.md).

## JavaScript API (ringkas)
```js
FixsCursor.configure({ color: "#0a84ff", size: 24 }); // ubah langsung
FixsCursor.preset("neon");                            // ganti gaya
FixsCursor.disable(); FixsCursor.enable();
FixsCursor.ripple(200, 200);                           // ripple manual
FixsCursor.destroy();
```
Untuk mengendalikan sendiri kapan mulai: `data-auto="false"` lalu `FixsCursor.init({ ... })`.

## Struktur repo
```text
cursor/
├── cursor.js            versi terbaru (URL tetap)
├── releases/1.0.0/      salinan beku tiap versi
├── releases/1.1.0/
├── releases/1.3.0/
├── demo/                halaman demo (memakai ../cursor.js)
├── docs/configuration.md
├── README.md
└── LICENSE
```

## Deploy ke GitHub Pages
1. Buat repo publik `cursor` di akun `fixsarts`.
2. Upload semua isi folder ini ke root repo.
3. Settings > Pages > Source: Deploy from a branch > `main` / `(root)` > Save.
4. Tunggu 1 sampai 2 menit. Script aktif di `https://fixsarts.github.io/cursor/cursor.js` dan demo di `.../demo/`.

## Versi dan update
- **Latest**: `https://fixsarts.github.io/cursor/cursor.js`. Website pengguna otomatis dapat pembaruan setelah `cursor.js` diganti (GitHub Pages menyimpan cache sekitar 10 menit).
- **Versi tetap (Pages)**: `https://fixsarts.github.io/cursor/releases/1.3.0/cursor.js`
- **Rilis baru**: ubah `VERSION` dan komentar versi di `cursor.js`, salin ke `releases/<versi>/cursor.js`, commit, lalu buat tag Git `v<versi>`.
- Gunakan versi tetap untuk website penting, latest untuk website yang ingin selalu terbaru.

## CDN (jsDelivr)
jsDelivr mengambil langsung dari repo GitHub (perlu tag rilis, mis. `v1.0.0`):
```html
<script src="https://cdn.jsdelivr.net/gh/fixsarts/cursor@1.3.0/cursor.js"></script> <!-- versi tetap -->
<script src="https://cdn.jsdelivr.net/gh/fixsarts/cursor@1/cursor.js"></script>     <!-- terbaru 1.x -->
```
Jangan pakai `@main` di produksi (cache bisa lama).

## Troubleshooting
- **Cursor tidak muncul**: cek tab Network (script 404?), pastikan Pages aktif, dan pakai mouse (bukan layar sentuh). Ketik `FixsCursor` di Console untuk memastikan terpasang.
- **Trail tidak muncul**: pastikan `data-trail="true"` atau memakai `data-preset`, dan `prefers-reduced-motion` tidak aktif (trail ikut dimatikan).
- **Efek tidak muncul sama sekali** (ripple atau trail): sistem mungkin meminta *reduce motion*. Coba `data-reduced-motion="ignore"`.
- **Tidak ada ripple**: `prefers-reduced-motion` aktif di sistem, atau `data-ripple="false"`.
- **Perubahan tidak terlihat**: cache. Muat ulang paksa (Ctrl+Shift+R) atau pakai URL versi.
- **Efek hover tidak muncul di elemen kustom**: tambahkan atribut `data-cursor-hover` atau atur `data-selector`.
- **Cursor tertutup elemen lain**: naikkan `data-z-index`, dan pastikan tidak ada elemen `popover`/`dialog` modal yang menutupinya (lapisan top-layer browser selalu di atas).

## Batasan
- Tidak bekerja di dalam `<iframe>` (pasang script di tiap halaman iframe yang sama origin).
- Situs dengan CSP yang melarang script dari `fixsarts.github.io` harus mengizinkannya di `script-src`.
- `dialog.showModal()` dan elemen top-layer menutupi cursor kustom.
- Perangkat hibrida: mouse dan jari sama-sama diikuti. Getar (`touchHaptic`) hanya jalan di browser yang mendukung `navigator.vibrate` (Android, bukan iOS).
- Ripple memerlukan Web Animations API (semua browser modern).

## Changelog
- **1.3.0**: dukungan sentuhan (touch) untuk smartphone/tablet, opsi `touch`, `touchDot`, `touchHaptic`, tombol on/off melayang (`toggle`, `togglePosition`, `toggleLabel`), `remember` (simpan status), API `toggle()`, `enabled`, event `fixscursor:change`. Demo didesain ulang dengan tab, mode terang/gelap, tombol acak, dan salin script.
- **1.3.0**: percikan partikel, 7 efek klik (`ripple`, `double`, `pulse`, `burst`, `confetti`, `sparkle`, `press`), `trailLength` (panjang kuas), opsi `reducedMotion`, preset `stardust`, `FixsCursor.click()`. Perbaikan: cincin ripple tidak lagi memudar terlalu cepat, dan ripple tetap tampil (fade statis) saat sistem meminta reduce motion.
- **1.1.0**: trail menggambar (gradasi, glow, tekanan, mode `age`/`flow`), preset, `opacity`/`hoverOpacity`/`blur`/`dot`, `rippleOpacity`, API `preset()`/`clearTrail()`. Semua opsi lama tetap kompatibel.
- **1.0.0**: rilis pertama.

## Lisensi
MIT
