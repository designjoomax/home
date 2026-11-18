# Joomax Jadwal Kerja Section

Section jadwal kerja **realtime** untuk web Joomax: tampil per karyawan, per minggu (bisa maju/mundur sepanjang bulan), dengan shift berupa bar berwarna yang otomatis digabung jika berurutan. Data dari Google Sheet atau diisi manual.

## Struktur folder

```
Jadwal Kerja/
├── README.md
├── index.html                  contoh pemakaian paling sederhana
├── demo.html                   demo konfigurasi (atur lewat UI, lalu unduh file pengaturannya)
├── css/
│   ├── jadwal-kerja.css        tampilan section (boleh diedit)
│   └── demo.css                tampilan halaman demo
├── js/
│   ├── jadwal-kerja.js         script utama (yang di-embed di web)
│   ├── jadwal-kerja.config.js  pengaturan hasil unduhan dari demo.html (timpa file ini)
│   └── demo.js                 logika halaman demo
├── data/
│   └── products.json           katalog harga untuk Fixs.Arts Checkout
└── assets/
    ├── icon/                   ikon label (Verified, Non Verified, dll; bisa diganti)
    └── thumb/                  gambar thumb paket (Basic, Premium, Platinum)
```

`jadwal-kerja.js` mencari `css/jadwal-kerja.css` dan `assets/` secara otomatis dari lokasinya sendiri, jadi tidak perlu diatur selama struktur folder dipertahankan.

## Cara paling mudah

1. Buka `demo.html` (di folder utama, sejajar dengan `css/`, `js/`, dan `assets/`).
2. Atur lewat tab **Teks, Tampilan, Nama, Label, Paket, Shift, Data**, atau nyalakan **Edit via klik di preview**: klik judul, nama, bar shift, label, atau jabatan di preview untuk langsung membuka pengaturannya. Matikan saklar itu untuk mencoba popup dan tombol seperti pengunjung. Preview bisa dicek di lebar Penuh / Tablet / HP.
3. Klik **Unduh pengaturan (.js)** (atau **Unduh keduanya (.zip)** untuk pengaturan + `data/products.json`), lalu timpa file lama: `js/jadwal-kerja.config.js`. `index.html` tidak perlu diubah karena sudah memuat file itu. Mau mengedit lagi? Klik **Buka config** dan pilih `jadwal-kerja.config.js`.
   - Label tiap karyawan (tab **Label**): geser **⋮⋮** untuk mengubah urutan (atau tombol panah atas/bawah saat ⋮⋮ difokus), saklar untuk menampilkan / menyembunyikan. Label yang disembunyikan tetap dihitung sebagai verified; di config ditulis `enabled: false`.

## Pasang di web

```html
<!-- Jadwal Kerja -->
<div id="jadwal-kerja"></div>
<script src="https://cdn.jsdelivr.net/gh/designjoomax/home@main/Section/Jadwal%20Kerja/js/jadwal-kerja.js"></script>
<script src="https://cdn.jsdelivr.net/gh/designjoomax/home@main/Section/Jadwal%20Kerja/js/jadwal-kerja.config.js"></script>
<script>
  JadwalKerja.init('#jadwal-kerja', window.JADWAL_KERJA_CONFIG || {});
</script>
```

- Pakai link **jsDelivr**. Link `github.com` / `raw.githubusercontent.com` tidak bisa dipakai sebagai script.
- Nama folder `Jadwal Kerja` mengandung spasi, jadi di URL ditulis `Jadwal%20Kerja`.
- CSS dan ikon dimuat otomatis dari folder yang sama (`css/` dan `assets/`). Lokasi CSS bisa diganti lewat `cssUrl`.
- Cache jsDelivr: setelah update file di GitHub, ganti `@main` jadi `@<commit-hash>` untuk memaksa versi terbaru.
- Section memakai Shadow DOM, jadi CSS web utama tidak bentrok.
- Alternatif tanpa JS: `<div data-jadwal-kerja data-config='{"texts":{"label":"Jadwal"}}'></div>`.

## Format data (tab "Jadwal Kerja" di Google Sheet)

Script membaca tata letak matriks berikut (sesuai sheet Joomax):

| No | Nama | Jabatan | *tanggal (hanya untuk membaca bulan & tahun)* | | | … | Keterangan | |
|---|---|---|---|---|---|---|---|---|
| | | | 1 | 2 | 3 | … 31 | | |
| 1 | Arnita | Leader Admin | ✈︎ | ☀︎ | ☀︎ | … | ✈︎ | OFF |
| 2 | Ahmad … | Leader Marketplace | ✈︎ | ☾ | ☾ | … | ☀︎ | Shift Pagi |

- **Baris angka 1–31** = tanggal. Script mencari baris ini otomatis.
- **Satu baris = satu karyawan** (kolom `Nama`, `Jabatan`).
- **Isi sel** = simbol shift. Arti simbol dicocokkan dengan `shifts` di config (`symbol`, `aliases`, atau `label`). Simbol yang belum terdaftar tetap tampil (abu-abu) dengan nama dari kolom **Keterangan**.
- **Bulan & tahun** dibaca dari sel tanggal di baris header (contoh `Sabtu, 07 November 2026`). Jika sel itu berisi `=TODAY()`, bulan akan ikut berganti saat bulan berganti; kalau data bulan lama belum diganti, paksa dengan `data.period: { month: 11, year: 2026 }`.
- Tanggal kosong (mis. tanggal 31 di bulan 30 hari) tidak ditampilkan.

Cara publish: **File → Share → Publish to web** → pilih tab **Jadwal Kerja** → format **CSV** → salin link ke `data.sheetUrl`.

## Konfigurasi

Semua opsi opsional; yang tidak ditulis memakai bawaan.

### Teks (`texts`)

`label`, `title` (token `{MMMM}` `{MMM}` `{YYYY}`), `searchPlaceholder`, `noPerson`, `noData`, `loading`, `todayButton`, `prevWeek`, `nextWeek`, `emptyDay`, `dayNames` (mulai Minggu), `monthNames`.

### Tampilan

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `weekStart` | `1` | Minggu mulai: `1` Senin, `0` Minggu |
| `dateFormat` | `'{DD} {MMM}'` | Tanggal di bawah nama hari. Token: `{DD} {D} {MM} {MMM} {MMMM} {YYYY} {dddd}` |
| `showSearch` / `showRole` | `true` | Kotak "Cari Nama" / tampilkan jabatan |
| `rolePosition` | `'below'` | Posisi jabatan: `'below'` di bawah nama, `'beside'` di samping nama |
| `showTodayButton` | `true` | Tombol "Hari ini" saat bukan di minggu ini |
| `highlightToday` | `true` | Tandai tanggal hari ini |
| `mergeSameShift` | `true` | Shift sama berurutan digabung jadi 1 bar |
| `uppercase` | `true` | Teks shift huruf besar |
| `compactLabelChars` | `6` | Bar 1 hari: label lebih panjang dari ini dikecilkan agar muat. Label pendek (mis. OFF) tetap ukuran penuh; isi `99` agar tidak pernah dikecilkan |
| `showTime` | `false` | Tampilkan jam (`time` pada shift) di dalam bar |
| `startWeek` | `'today'` | `'today'` buka di minggu ini, `'first'` minggu pertama bulan |
| `defaultPerson` | `''` | Nama karyawan yang tampil pertama |
| `rememberPerson` | `true` | Ingat karyawan terakhir yang dipilih (di browser) |
| `urlParam` | `'nama'` | `halaman?nama=Fikri` langsung menampilkan Fikri |
| `theme` | | `font`, `text`, `muted`, `cardBg`, `border`, `accent`, `radius`, `shadow`, `maxWidth`, `barRadius`, `barHeight`, `barFont` |

### Daftar semua karyawan (View All)

Tombol **View All** membuka daftar semua karyawan dalam satu tabel; **Collapse** menutupnya. Area daftar bisa di-scroll, sedangkan header (navigasi minggu dan tanggal) tetap diam di atas. Kotak pencarian menyaring daftar saat mode ini aktif.

```js
showViewAll: true,
list: {
  startExpanded: false,   // buka langsung dalam mode daftar
  height: '380px',        // tinggi area daftar; lebih dari ini di-scroll
  nameWidth: '240px',     // lebar kolom nama
  showRole: false,        // jabatan di bawah nama
  showBadges: true,       // ikon label di samping nama
  showUnverified: false,  // tampilkan juga ikon non-verified
  badgeSize: '16px',
  clickName: 'select',    // klik nama: 'select' = tampilkan karyawan itu, 'none' = tidak
  barHeight: '34px', barFont: '13px'
}
```

Teks tombol diatur di `texts.viewAll` dan `texts.collapse`, warnanya di `theme.viewAllBg` dan `theme.viewAllColor`.

### Warna nama (`nameStyle`)

Nama karyawan bisa berwarna solid atau gradasi, dan gradasi bisa **berjalan** (animasi). Berlaku di tampilan utama dan di daftar.

```js
nameStyle: {
  default: { bg: '', animate: false, speed: '3s' },   // semua karyawan (kosong = warna teks tema)
  people: [
    { name: 'Fikri Saputra', enabled: true, animate: true, speed: '3s',
      bg: 'linear-gradient(90deg,#0b1f6e 0%,#4f83f5 100%)' },   // gradasi
    { name: 'Arnita', enabled: true, bg: '#e8470c' }            // solid
  ]
}
```

`animate` hanya berlaku untuk gradasi. `speed` makin kecil makin cepat. Pengunjung yang mengaktifkan "reduce motion" di perangkatnya tidak melihat animasi.

### Label di samping nama (`badge`)

Ikon kecil di samping nama. Klik ikon untuk memunculkan teks. Karyawan bisa punya **lebih dari satu label** (mis. Verified + Creative Pro), dan yang belum verified otomatis mendapat ikon non-verified plus tombol **Get Verified**.

```js
badge: {
  enabled: true,                       // saklar utama; false = semua label mati
  size: '20px', gap: '8px',
  trigger: 'click',                    // 'click' | 'hover' | 'always' (selalu tampil) | 'none'
  autoHideMs: 3000,
  tipBg: '#111111', tipColor: '#ffffff',
  verifiedType: 'verified',            // jenis label yang dihitung "sudah verified"
  types: [                             // jenis label, bisa ditambah. label = teks saat ikon diklik
    { id: 'verified', icon: 'assets/icon/Verified.png', label: 'Verified' },
    { id: 'pro', icon: 'assets/icon/Pro.png', label: 'Creative Pro' }
  ],
  unverified: {                        // untuk yang belum verified
    enabled: true, icon: 'assets/icon/Non Verified.png', label: 'Belum verified',
    button: { enabled: true, text: 'Get Verified', color: '#1b8fe6', bg: '#ffffff', border: '#1b8fe6' }
  },
  people: [                            // siapa dapat label apa (nama sama dengan di sheet)
    { name: 'Fikri Saputra', enabled: true, labels: ['verified', { id: 'pro', label: 'Pembuat ide Joomax' }] },
    { name: 'Arnita', enabled: false, labels: ['verified'] }    // disiapkan tapi dimatikan
  ]
}
```

- `labels` berisi id jenis, atau `{ id, label, icon }` kalau teks/ikon-nya khusus untuk orang itu.
- Yang tidak ada di `people` (atau `enabled: false`, atau tidak punya label `verifiedType`) dianggap **belum verified**: tampil ikon non-verified dan tombol Get Verified. Matikan dengan `unverified.enabled: false` (semua) atau `unverified.button.enabled: false` (hanya tombol).
- **Ikon kustom** (`icon`) boleh berupa: lokasi file (`assets/icon/Pro.png`), link penuh (`https://.../ikon.png`), data URI, atau **emoji** (`🔥`). Jika file tidak ketemu, otomatis tampil ikon centang bawaan.
- Di `demo.html` tersedia tombol **Upload** untuk memilih gambar dari komputer (otomatis dikecilkan dan disimpan sebagai data di kode). Untuk kode yang lebih ringkas, simpan file-nya ke `assets/icon/` lalu isi lokasinya (ada link "Unduh" untuk file hasil upload).
- Klik di luar ikon atau tekan Esc untuk menutup balon teks.

### Popup paket / Get Verified (`verify`)

Tombol **Get Verified** membuka popup kartu harga (pricing cards): thumb di atas, harga normal dicoret kecil di atas harga promo, benefit dengan ikon, dan tombol pilih. Paket yang diberi `popular: true` disorot (bingkai berwarna, label, dan sedikit membesar di desktop). Responsif: tiga kolom di desktop, satu kolom di HP. Harga dan isi paket di bawah adalah **contoh dari lu**; ganti sesuai kebutuhan.

```js
verify: {
  enabled: true,
  title: 'Pilih Paket Verified', subtitle: 'Untuk {name}', popularText: 'Populer', closeText: 'Tutup',
  showNormalPrice: true,               // harga normal (dicoret) di atas harga promo, on/off
  showThumb: true,                     // thumb di atas kartu, on/off
  uppercaseName: true,                 // nama paket HURUF BESAR
  featureIcon: 'check',                // ikon bawaan benefit
  afterSelect: 'message',              // 'message' = pesan terima kasih, 'close' = langsung tutup
  selectedText: 'Terima kasih! Paket {plan} dipilih untuk {name}.',
  plans: [
    { id: 'premium', name: 'Premium', color: '#e8470c', popular: true,
      normalPrice: 'Rp30.000',         // harga normal (dicoret); kosongkan untuk menyembunyikan
      price: 'Rp15.000', period: '/ 3 Bulan',
      desc: 'Tampil lebih standout dan berbeda.',
      thumb: 'sunset',                 // template: plan | ocean | sunset | royal | mint | aurora | mono
      thumbImage: '',                  // gambar sendiri (link / data URI); menimpa template
      icon: '',                        // ikon di tengah thumb template (kosong = ikon Verified)
      features: [
        { text: 'Verified Badge', icon: 'badge' },
        { text: 'Animated Gradient Name', note: 'Efek warna gradient bergerak pada nama', icon: 'wave' },
        'Tampilan di Jadwal Kerja'     // teks saja juga boleh (memakai featureIcon)
      ],
      button: 'Pilih Premium',
      url: 'https://wa.me/62xxxx?text=Paket%20{plan}%20untuk%20{name}' }   // opsional; {name} {plan} {id}
  ]
}
```

- **Ikon benefit** (`features[].icon`): nama ikon bawaan (`check` `check-circle` `dot` `arrow` `badge` `star` `sparkle` `shield` `crown` `bolt` `heart` `gem` `palette` `calendar` `layout` `wave` `user` `eye` `gift` `tag` `lock`), emoji, atau link gambar. Di `demo.html`, klik tombol ikon di samping benefit untuk memilih dari kisi ikon.
- **Thumb**: pilih template modern, atau upload gambar sendiri di `demo.html` (otomatis dikecilkan jadi maks. 720px). Untuk kode yang ringkas, simpan gambar ke `assets/` lalu isi `thumbImage` dengan lokasinya.
- `normalPrice` kosong di salah satu paket tetap menyisakan baris kosong supaya harga promo antar-kartu sejajar. Matikan semua lewat `showNormalPrice: false`.

#### Fixs.Arts Checkout

Tombol paket di popup sudah berupa link checkout: `<a data-fa-product="verified-badge" data-fa-package="basic">Pilih Basic</a>` (tanpa `href`, tanpa ID website atau harga di link). Cara pakai:

1. Pasang script checkout sekali per halaman, sebelum `</body>` (sudah ada di `index.html`):
   `<script src="https://fixsarts.github.io/checkout/fa-checkout.js" defer></script>`
   Tag script itu memakai `data-fa-base="/home/Section/Jadwal%20Kerja"` supaya katalog dibaca dari folder ini; ubah sesuai lokasi folder lu. Ini butuh `fa-checkout.js` versi yang mendukung path bertingkat.
2. Simpan `data/products.json` di dalam folder `Jadwal Kerja` (`Jadwal Kerja/data/products.json`), sesuai `data-fa-base`. Isinya dibuat otomatis di tab **Paket** pada `demo.html` (kartu "Fixs.Arts Checkout"): ID paket = `id` paket, harga = angka dari `price`, nama paket = nama + periode.
3. Config: `verify.checkout: { enabled: true, product: 'verified-badge' }`. ID produk dan ID paket hanya boleh huruf kecil, angka, dan "-" (maks. 40 karakter). Per paket bisa diganti dengan `product` / `package`.

Catatan: popup berada di dalam Shadow DOM, sedangkan `fa-checkout.js` hanya membaca klik di halaman biasa. Karena itu klik pada tombol paket diteruskan otomatis ke script checkout (script checkout tidak perlu diubah). Jika script checkout **tidak** dimuat di halaman, tombol memakai alur lama (`url` paket, atau pesan terima kasih). Event `jadwalkerja:verify` tetap dikirim. Isi `price` di `products.json` adalah harga promo (harga yang dibayar).

**Saat paket dipilih**: event `jadwalkerja:verify` dikirim, `url` (jika ada) dibuka di tab baru, lalu tampil pesan terima kasih (atau popup menutup).

**Memanggil dari script lain** (tanpa harus ada section jadwal di halaman itu):

```html
<script src=".../jadwal-kerja.js"></script>
<script>
  JadwalKerja.openVerify('Nama Karyawan');                       // popup dengan pengaturan bawaan
  JadwalKerja.openVerify('Nama Karyawan', { verify: { plans: [ /* paket kustom */ ] } });

  document.addEventListener('jadwalkerja:verify', e => {          // tangkap pilihan
    console.log(e.detail.plan.id, e.detail.person);
  });
</script>
```

Dari instance yang sudah ada: `const jk = JadwalKerja.init(...); jk.openVerify('Nama');`. Callback juga bisa lewat JS: `verify: { onSelect: d => ... }`.

### Jenis shift (`shifts`)

```js
shifts: [
  { key: 'pagi', symbol: '☀', label: 'Masuk Pagi',       // label = teks yang tampil, bebas diganti
    aliases: ['Shift Pagi', 'Pagi'],                      // nama lain yang dikenali di sheet
    time: '08:00 - 16:00',                                // opsional
    bg: 'linear-gradient(90deg,#ffb90f 0%,#e8470c 100%)', // boleh warna solid atau gradasi
    color: '#ffffff' }
]
```

Mau menambah jenis shift baru (mis. "Lembur")? Tambah satu item, lalu pakai simbolnya di sheet / data manual. Karena `shifts` adalah daftar, tulis **seluruh** daftarnya jika ingin mengubah (demo.html menyiapkannya otomatis).

### Data (`data`)

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `source` | `'sheet'` | `'sheet'` atau `'manual'` |
| `sheetUrl` | link tab Jadwal Kerja | Link CSV hasil Publish to web |
| `refreshMinutes` | `15` | Auto refresh dari sheet |
| `fallbackToManual` | `true` | Pakai data manual jika sheet gagal dimuat |
| `layout` | `Nama` / `Jabatan` / `Keterangan` | Nama kolom di sheet |
| `period` | `{ month: 0, year: 0 }` | Paksa bulan/tahun (0 = otomatis) |
| `manual` | contoh data | Data tanpa Google Sheet |

**Data manual:** `days` berisi satu karakter per tanggal (simbol shift), `.` = kosong.

```js
manual: { month: 11, year: 2026, people: [
  { name: 'Fikri Saputra', role: 'Staff Creative Design', days: '✈☀☀☀☾☾☾✈☾☾☾☾☾☾✈☀☀☀☀☀☀✈☾☾☾☾☾☾✈☀' }
] }
```

Paling gampang: di `demo.html`, ubah sumber data jadi Manual dan edit tabelnya, atau klik **Muat data dari Google Sheet ke tabel** lalu edit.

## Cara kerja tampilan

- Buka di **minggu ini**, tombol ‹ › pindah minggu dalam bulan data (Senin–Minggu). Minggu yang melewati batas bulan menampilkan tanggal bulan lain redup.
- Ketik nama di kotak pencarian untuk ganti karyawan (cocok dengan nama atau jabatan).
- Berganti otomatis lewat tengah malam tanpa refresh. Data sheet disimpan di cache browser sebagai cadangan.

## Masalah umum

| Masalah | Solusi |
|---|---|
| "Data jadwal belum tersedia" | Link `sheetUrl` salah / tab belum Publish to web. Cek link CSV-nya |
| Ikon label tidak muncul | Pastikan folder `assets/icon/` ikut diupload (sejajar dengan `js/` dan `css/`), atau isi `icon` dengan link penuh |
| Shift tampil abu-abu | Simbol belum terdaftar di `shifts` — tambahkan, atau isi `aliases` |
| Bulan salah | Isi `data.period` dengan bulan & tahun data |
| Tampilan polos tanpa gaya | `css/jadwal-kerja.css` tidak ikut diupload / bukan di folder `css/` yang sejajar dengan `js/`; isi `cssUrl` |
| Tampilan tidak berubah setelah update | Cache jsDelivr; pakai `@commit-hash` |

## Struktur repo

```
Section/
└── Jadwal Kerja/        (isi sama dengan "Struktur folder" di atas)
```

Jika sebelumnya file ada di folder utama (`jadwal-kerja.js`, `jadwal-kerja.css`, `demo.js`, `demo.css`), **hapus file lama itu** setelah memindahkannya ke `js/` dan `css/`, dan perbarui link `<script>` di web menjadi `.../Jadwal%20Kerja/js/jadwal-kerja.js`.
