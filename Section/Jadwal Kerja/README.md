# Joomax Jadwal Kerja Section

Section jadwal kerja **realtime** untuk web Joomax: tampil per karyawan, per minggu (bisa maju/mundur sepanjang bulan), dengan shift berupa bar berwarna yang otomatis digabung jika berurutan. Data dari Google Sheet atau diisi manual.

## Isi folder

| File | Fungsi |
|---|---|
| `jadwal-kerja.js` | Script utama (yang di-embed di web) |
| `jadwal-kerja.css` | Tampilan section (boleh diedit) |
| `index.html` | Contoh pemakaian paling sederhana |
| `demo.html` + `demo.css` + `demo.js` | **Demo konfigurasi**: atur teks, warna, shift, dan data lewat UI, lalu salin kodenya |
| `README.md` | Dokumentasi ini |

## Cara paling mudah

1. Buka `demo.html` (satu folder dengan `jadwal-kerja.js` dan `jadwal-kerja.css`).
2. Atur teks, warna, jenis shift, dan data. Preview langsung berubah.
3. Klik **Salin kode** lalu tempel di halaman web mana pun. Kode hanya berisi bagian yang berbeda dari bawaan.

## Pasang di web

```html
<div id="jadwal-kerja"></div>
<script src="https://cdn.jsdelivr.net/gh/designjoomax/home@main/Section/Jadwal%20Kerja/jadwal-kerja.js"></script>
<script>
  JadwalKerja.init('#jadwal-kerja', {});
</script>
```

- Pakai link **jsDelivr**. Link `github.com` / `raw.githubusercontent.com` tidak bisa dipakai sebagai script.
- Nama folder `Jadwal Kerja` mengandung spasi, jadi di URL ditulis `Jadwal%20Kerja`.
- `jadwal-kerja.css` dimuat otomatis dari folder yang sama dengan `jadwal-kerja.js` (atau isi `cssUrl`).
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
| `showSearch` / `showRole` | `true` | Kotak "Cari Nama" / jabatan di samping nama |
| `showTodayButton` | `true` | Tombol "Hari ini" saat bukan di minggu ini |
| `highlightToday` | `true` | Tandai tanggal hari ini |
| `mergeSameShift` | `true` | Shift sama berurutan digabung jadi 1 bar |
| `uppercase` | `true` | Teks shift huruf besar |
| `showTime` | `false` | Tampilkan jam (`time` pada shift) di dalam bar |
| `startWeek` | `'today'` | `'today'` buka di minggu ini, `'first'` minggu pertama bulan |
| `defaultPerson` | `''` | Nama karyawan yang tampil pertama |
| `rememberPerson` | `true` | Ingat karyawan terakhir yang dipilih (di browser) |
| `urlParam` | `'nama'` | `halaman?nama=Fikri` langsung menampilkan Fikri |
| `theme` | | `font`, `text`, `muted`, `cardBg`, `border`, `accent`, `radius`, `shadow`, `maxWidth`, `barRadius`, `barHeight`, `barFont` |

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
| Shift tampil abu-abu | Simbol belum terdaftar di `shifts` — tambahkan, atau isi `aliases` |
| Bulan salah | Isi `data.period` dengan bulan & tahun data |
| Tampilan polos tanpa gaya | `jadwal-kerja.css` tidak satu folder dengan `jadwal-kerja.js`; isi `cssUrl` |
| Tampilan tidak berubah setelah update | Cache jsDelivr; pakai `@commit-hash` |

## Struktur repo

```
Section/
└── Jadwal Kerja/
    ├── README.md
    ├── index.html
    ├── jadwal-kerja.js
    ├── jadwal-kerja.css
    ├── demo.html
    ├── demo.css
    └── demo.js
```
