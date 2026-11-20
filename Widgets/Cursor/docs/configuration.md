# Konfigurasi

Urutan prioritas (yang bawah menimpa yang atas): default, `window.FixsCursorConfig`, atribut `data-*` di script tag, lalu JavaScript API.

## Opsi

| Opsi (JS) | Atribut `data-*` | Default | Keterangan |
|---|---|---|---|
| `color` | `data-color` | `#3330ff` | Warna lingkaran cursor (warna CSS apa pun) |
| `size` | `data-size` | `18` | Diameter lingkaran dalam px |
| `smoothing` | `data-smoothing` | `0.22` | Kehalusan gerak, 0.02 (sangat lembut) sampai 1 (instan) |
| `zIndex` | `data-z-index` | `2147483647` | Urutan tumpukan cursor |
| `opacity` | `data-opacity` | `1` | Transparansi lingkaran, 0 (hilang) sampai 1 (solid) |
| `hoverOpacity` | `data-hover-opacity` | `-1` | Transparansi saat hover. `-1` = sama dengan `opacity` |
| `blur` | `data-blur` | `0` | Blur latar di belakang lingkaran (px), efek kaca/glass. Paling bagus dipadu `opacity` rendah |
| `dot` | `data-dot` | `true` | `false` = sembunyikan lingkaran (cocok kalau hanya mau trail) |
| `ripple` | `data-ripple` | `true` | Aktifkan efek ripple saat klik |
| `rippleColor` | `data-ripple-color` | warna cursor | Warna ripple |
| `rippleSize` | `data-ripple-size` | `90` | Diameter akhir ripple (px) |
| `rippleDuration` | `data-ripple-duration` | `600` | Durasi ripple (ms) |
| `rippleWidth` | `data-ripple-width` | `2` | Tebal garis ripple (px) |
| `rippleOpacity` | `data-ripple-opacity` | `0.8` | Opacity awal ripple |
| `hoverEffect` | `data-hover-effect` | `true` | Cursor membesar di atas elemen interaktif |
| `hoverScale` | `data-hover-scale` | `1.8` | Faktor pembesaran saat hover |
| `hideNativeCursor` | `data-hide-native-cursor` | `false` | Sembunyikan panah bawaan (kolom teks tetap memakai cursor bawaan) |
| `preset` | `data-preset` | kosong | Paket pengaturan siap pakai (lihat bagian Preset). Opsi lain yang ditulis eksplisit menimpa preset |
| `selector` | `data-selector` | link, tombol, select, checkbox, radio, `[role=button]`, `[data-cursor-hover]`, dll | Selector elemen yang memicu efek hover |
| (khusus atribut) | `data-auto` | `true` | `false` = tidak aktif otomatis, panggil `FixsCursor.init()` sendiri |

Nilai boolean: `true`/`false`. Atribut `data-*` yang salah isi diganti default.

## Trail (efek menggambar)

Jejak seperti goresan kuas atau ekor roket mengikuti cursor, lalu memudar dan hilang sendiri. Mati secara bawaan, nyalakan dengan `data-trail="true"` atau pilih preset.

| Opsi (JS) | Atribut `data-*` | Default | Keterangan |
|---|---|---|---|
| `trail` | `data-trail` | `false` | Aktifkan trail |
| `trailColors` | `data-trail-colors` | `#ff9a3c,#ff2e63,#7b2ff7` | Titik-titik gradasi, dipisah koma (jumlah bebas, 1 = warna solid). Warna CSS apa pun, mis. `#f00,rgb(0,255,0),hsl(200 90% 60%)`. Di JS boleh berupa array |
| `trailColorMode` | `data-trail-color-mode` | `age` | `age` = warna berubah menurut umur goresan (kepala ke ekor, seperti api roket). `flow` = warna mengalir sepanjang gerakan dan menempel di goresan (seperti kuas pelangi) |
| `trailLength` | `data-trail-length` | `0` | **Panjang kuas** (px). Pendek = ekor singkat, panjang = ekor menjuntai. `0` = tanpa batas (hanya dibatasi `trailDuration`). Gradasi dan runcing menyesuaikan panjang ini; goresan hilang oleh batas mana pun yang tercapai lebih dulu |
| `trailSize` | `data-trail-size` | `14` | Tebal maksimum (px) |
| `trailDuration` | `data-trail-duration` | `900` | Lama goresan sampai hilang (ms) |
| `trailTaper` | `data-trail-taper` | `0.8` | Seberapa runcing di ujung, 0 (tetap tebal) sampai 1 (lancip) |
| `trailFade` | `data-trail-fade` | `1` | Kecepatan memudar. Di bawah 1 = bertahan solid lebih lama, di atas 1 = cepat pudar |
| `trailOpacity` | `data-trail-opacity` | `0.9` | Opacity maksimum trail |
| `trailGlow` | `data-trail-glow` | `0.4` | Cahaya lembut di sekitar goresan, 0 sampai 1 |
| `trailPressure` | `data-trail-pressure` | `0.3` | Efek tekanan stylus: gerak cepat = lebih tipis, pelan = lebih tebal. 0 = mati |
| `trailFlowSpeed` | `data-trail-flow-speed` | `1` | Kecepatan pergantian warna (hanya mode `flow`) |
| `trailBlend` | `data-trail-blend` | `normal` | `additive` = warna saling menambah terang, kesan neon. Berlaku juga untuk partikel |

## Percikan partikel

Partikel kecil terlepas dari cursor sebanding jarak gerak, melesat ke belakang arah gerak (seperti percikan api roket) lalu mengecil dan memudar. Berjalan terpisah dari trail, jadi bisa dipakai sendiri.

| Opsi (JS) | Atribut `data-*` | Default | Keterangan |
|---|---|---|---|
| `sparks` | `data-sparks` | `false` | Aktifkan percikan |
| `sparkShape` | `data-spark-shape` | `dot` | `dot` titik, `spark` garis api, `star` bintang, `mix` campuran |
| `sparkColors` | `data-spark-colors` | kosong | Warna percikan (daftar dipisah koma). Kosong = ikut gradasi `trailColors` |
| `sparkRate` | `data-spark-rate` | `8` | Jumlah partikel per 100px gerakan |
| `sparkSize` | `data-spark-size` | `3` | Ukuran (px) |
| `sparkLife` | `data-spark-life` | `700` | Umur partikel (ms) |
| `sparkSpeed` | `data-spark-speed` | `3` | Kecepatan lontar |
| `sparkSpread` | `data-spark-spread` | `70` | Sebaran sudut (0 sampai 180 derajat). `180` = ke segala arah |
| `sparkGravity` | `data-spark-gravity` | `0.3` | Positif = jatuh, negatif = melayang naik, `0` = tanpa gravitasi |

## Efek klik

Saklar utama: `ripple` (`data-ripple="false"` mematikan semua efek klik). Efek dipilih lewat `clickEffect`, boleh digabung dengan koma, mis. `data-click-effect="ripple,burst"`.

| Efek | Tampilan |
|---|---|
| `ripple` | Cincin yang melebar dan memudar (bawaan) |
| `double` | Dua cincin berurutan |
| `pulse` | Lingkaran penuh yang melebar dan memudar |
| `burst` | Semburan garis dan titik ke segala arah |
| `confetti` | Konfeti warna-warni melambung lalu jatuh |
| `sparkle` | Beberapa kilau bintang yang muncul lalu hilang |
| `press` | Lingkaran cursor mengecil selama tombol mouse ditekan |
| `none` | Tanpa efek |

| Opsi (JS) | Atribut `data-*` | Default | Keterangan |
|---|---|---|---|
| `clickEffect` | `data-click-effect` | `ripple` | Daftar efek, dipisah koma |
| `clickColors` | `data-click-colors` | kosong | Palet warna partikel (`burst`, `confetti`, `sparkle`). Kosong = `rippleColor`/`color` (confetti memakai palet pelangi) |
| `clickCount` | `data-click-count` | `16` | Jumlah partikel |
| `pressScale` | `data-press-scale` | `0.6` | Skala lingkaran saat efek `press` |

`rippleSize`, `rippleDuration`, `rippleOpacity` berlaku untuk semua efek klik (ukuran sebar, lama, dan kepekatan). `rippleColor` dan `rippleWidth` untuk cincin.

## Sentuhan dan tombol on/off

| Opsi (JS) | Atribut `data-*` | Default | Keterangan |
|---|---|---|---|
| `touch` | `data-touch` | `true` | Jari di layar sentuh ikut diberi efek (trail, percikan, efek klik saat tap). `false` = hanya mouse |
| `touchDot` | `data-touch-dot` | `true` | Tampilkan lingkaran di titik sentuh. `false` = hanya trail dan efek |
| `touchHaptic` | `data-touch-haptic` | `false` | Getar singkat saat tap (Android) |
| `toggle` | `data-toggle` | `false` | Tampilkan tombol on/off melayang |
| `togglePosition` | `data-toggle-position` | `bottom-right` | `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `toggleLabel` | `data-toggle-label` | `Efek kursor` | Teks pada tombol |
| `remember` | `data-remember` | `false` | Simpan status on/off di `localStorage` |

Efek klik pada sentuhan muncul saat **tap** (jari tidak bergeser), jadi menggeser halaman tidak memicu ledakan efek. Event `fixscursor:change` dikirim ke `window` setiap status on/off berubah (`event.detail.enabled`).

## Reduce motion

| Opsi (JS) | Atribut `data-*` | Default | Keterangan |
|---|---|---|---|
| `reducedMotion` | `data-reduced-motion` | `respect` | `respect` = hormati pengaturan sistem. `ignore` = efek tetap tampil walau sistem meminta animasi dikurangi |

Bila sistem meminta reduce motion (di Windows: Settings, Accessibility, Visual effects, Animation effects dimatikan), mode `respect` mematikan trail dan partikel, dan efek cincin menjadi fade statis tanpa gerak. Kalau efek terasa "tidak muncul", cek pengaturan ini atau pasang `data-reduced-motion="ignore"`.

## Preset

`default`, `rocket`, `ink`, `neon`, `aurora`, `stardust`, `glass`.

```html
<script src="https://fixsarts.github.io/cursor/cursor.js" data-preset="neon"></script>
```

Preset bisa diubah sebagian, opsi yang ditulis eksplisit menang:
```html
<script src="https://fixsarts.github.io/cursor/cursor.js"
  data-preset="rocket" data-trail-colors="#00f0ff,#7a5cff,#ff2bd6" data-trail-duration="1400"></script>
```

## Contoh

```html
<script src="https://fixsarts.github.io/cursor/cursor.js"
  data-color="#3330ff" data-size="18" data-ripple-size="120" data-hide-native-cursor="true"></script>
```

Lewat variabel global (sebelum script dimuat):
```html
<script>window.FixsCursorConfig = { color: "#0a84ff", size: 14 };</script>
<script src="https://fixsarts.github.io/cursor/cursor.js"></script>
```

## JavaScript API

| Method | Fungsi |
|---|---|
| `FixsCursor.init(opts?)` | Mulai (otomatis dipanggil kecuali `data-auto="false"`) |
| `FixsCursor.configure(opts)` | Ubah opsi langsung, tanpa memuat ulang |
| `FixsCursor.enable()` / `.disable()` / `.toggle()` | Nyalakan / matikan / balikkan |
| `FixsCursor.enabled` | `true` bila sedang menyala |
| `FixsCursor.touchSupported` | `true` bila perangkat punya layar sentuh |
| `FixsCursor.preset(name, opts?)` | Terapkan preset, `opts` opsional untuk menimpa sebagian |
| `FixsCursor.clearTrail()` | Hapus goresan dan partikel yang masih terlihat |
| `FixsCursor.click(x, y, opts?)` | Jalankan efek klik manual di koordinat layar (px). `opts` bisa menimpa mis. `{ clickEffect: "burst" }`. `ripple()` adalah alias lama |
| `FixsCursor.effects` | Daftar nama efek klik |
| `FixsCursor.destroy()` | Hapus semua elemen dan listener |
| `FixsCursor.options` | Salinan opsi yang sedang aktif |
| `FixsCursor.defaults` | Salinan nilai bawaan semua opsi |
| `FixsCursor.presets` | Daftar nama preset |
| `FixsCursor.version` | Versi library |

## Contoh JavaScript

```js
// Trail gradasi 4 warna, mengalir seperti kuas
FixsCursor.configure({
  trail: true, trailColorMode: "flow",
  trailColors: ["#ff5f6d", "#ffc371", "#47e5bc", "#5b8def"],
  trailSize: 16, trailDuration: 1200, trailGlow: 0.35
});

// Trail pendek dengan percikan api dan efek klik semburan
FixsCursor.configure({
  trail: true, trailLength: 120, sparks: true, sparkShape: "spark",
  clickEffect: "ripple,burst", clickColors: "#ffd23f,#ff7a00,#e01e37"
});

// Cursor kaca transparan
FixsCursor.configure({ size: 32, opacity: 0.25, blur: 6 });
```

## Perilaku otomatis
- Di layar sentuh, efek mengikuti jari (lihat bagian Sentuhan). Atur `data-touch="false"` untuk mematikannya.
- `prefers-reduced-motion`: lihat bagian Reduce motion di atas.
- Di input teks, textarea, dan `contenteditable` lingkaran disembunyikan dan cursor bawaan dipakai.
- Elemen `disabled` atau `aria-disabled="true"` tidak memicu efek hover.
- Trail putus (tidak menyambung) saat cursor keluar jendela atau melewati kolom teks, dan berhenti merender sepenuhnya saat semua goresan sudah hilang.
- Dimuat dua kali tidak menimbulkan error atau cursor ganda.
