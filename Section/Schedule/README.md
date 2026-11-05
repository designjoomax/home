# Joomax Schedule Section

Section jadwal **realtime** untuk web Joomax: jadwal pakaian dan piket yang otomatis mengikuti tanggal hari ini, bisa dilihat per minggu (Senin–Sabtu), dengan data dari Google Sheet atau diisi manual.

## Isi folder

| File | Fungsi |
|---|---|
| `schedule.js` | Script utama (yang di-embed di web) |
| `schedule.css` | Tampilan section (boleh diedit) |
| `index.html` | Contoh pemakaian paling sederhana |
| `demo.html` + `demo.css` + `demo.js` | **Demo konfigurasi**: atur warna, teks, jadwal lewat UI, lalu salin kodenya |
| `README.md` | Dokumentasi ini |

## Cara paling mudah

1. Buka `demo.html` (satu folder dengan `schedule.js` dan `schedule.css`).
2. Atur judul, warna, data, dan daftar jadwal sampai sesuai. Preview langsung berubah.
3. Klik **Salin kode** di kotak "Kode untuk ditempel", lalu tempel di halaman web mana pun.

## Pasang di web

```html
<div id="joomax-schedule"></div>
<script src="https://cdn.jsdelivr.net/gh/designjoomax/home@main/Section/Schedule/schedule.js"></script>
<script>
  JoomaxSchedule.init('#joomax-schedule', {
    title: 'Schedule'
  });
</script>
```

- Pakai link **jsDelivr** seperti di atas. Link `github.com` / `raw.githubusercontent.com` tidak bisa dipakai sebagai script.
- `schedule.css` dimuat otomatis dari folder yang sama dengan `schedule.js`. Untuk CSS di tempat lain, isi `cssUrl` di config.
- Kalau sudah update file di GitHub tapi tampilan belum berubah, itu cache jsDelivr. Ganti `@main` jadi `@<commit-hash>` untuk memaksa versi terbaru.
- Section memakai Shadow DOM, jadi CSS web utama tidak bentrok dengan section ini.

Alternatif tanpa menulis JS: `<div data-joomax-schedule data-config='{"title":"Jadwal"}'></div>` (config berupa JSON).

## Format data (Google Sheet)

Baris pertama adalah nama kolom. Satu baris = satu hari.

| Hari | Pakaian | Piket Sampah | Piket Toilet Lt. 2 | Piket Toilet Lt. 3 |
|---|---|---|---|---|
| Senin | PDH JOOMAX | Nabil | Wahidah | Zihan |
| Selasa | Bebas Sopan | Fikri | Alifa | Ayu |

1. Di Google Sheet: **File → Share → Publish to web** → pilih sheet → format **CSV** → Publish.
2. Salin link-nya ke `data.sheetUrl`.
3. Nama kolom harus **sama persis** dengan `column` di setiap jadwal.
4. Penulisan hari tidak peka huruf besar/kecil dan tanda baca (`Jum'at` = `Jumat`).

## Konfigurasi

Semua opsi bersifat opsional; yang tidak ditulis memakai default.

### Umum

| Opsi | Default | Keterangan |
|---|---|---|
| `title` | `'Schedule'` | Judul section |
| `showDate` | `true` | Tampilkan / sembunyikan tanggal |
| `dateFormat` | `'{DD}, {MMMM} {YYYY}'` | Token: `{DD}` `{D}` `{MM}` `{MMM}` `{MMMM}` `{YYYY}` `{dddd}` |
| `showNav` | `true` | Tombol minggu sebelumnya / selanjutnya |
| `maxWeeksBack` / `maxWeeksAhead` | `0` / `8` | Batas navigasi mundur / maju (minggu) |
| `showDayDate` | `true` | Tanggal kecil di bawah nama hari |
| `dayTabs` | `'auto'` | Tab pilih hari: `'auto'` (muncul jika tidak ada tabel), `true`, `false` |
| `cssUrl` | `''` | Link `schedule.css` kustom |
| `labels` | | Teks tombol: `prevWeek`, `nextWeek`, `backToToday` |

### Data (`data`)

| Opsi | Default | Keterangan |
|---|---|---|
| `source` | `'sheet'` | `'sheet'` atau `'manual'` |
| `sheetUrl` | link sheet Joomax | Link CSV hasil Publish to web |
| `refreshMinutes` | `15` | Auto refresh data dari sheet |
| `fallbackToManual` | `true` | Pakai `manualRows` jika sheet gagal dimuat |
| `dayColumn` | `'Hari'` | Nama kolom hari |
| `days` | Senin–Sabtu | Urutan hari yang tampil |
| `manualRows` | contoh data | Data tanpa Google Sheet, `[{ Hari: 'Senin', Pakaian: '...' }, ...]` |

### Tema (`theme`)

`font`, `fontUrl`, `text`, `muted`, `cardBg`, `cardBorder`, `highlight`, `radius`, `maxWidth`, `shadow`.

### Daftar jadwal (`sections`)

Tiap item satu jadwal. Ada dua tipe:

**`table`** – tabel seminggu (cocok untuk Pakaian)

```js
{ type: 'table', label: 'Jadwal', title: 'Pakaian', column: 'Pakaian',
  defaultStyle: { bg: '#e5e7eb', color: '#333' },
  rules: [ { match: 'PDH', bg: '#51677d', color: '#fff' } ] } // match = teks mengandung kata ini
```

**`duty`** – kartu petugas di hari yang dipilih (cocok untuk Piket)

```js
{ type: 'duty', label: 'Piket', title: 'Sampah', column: 'Piket Sampah',
  style: { bg: '#51677d', color: '#fff' },
  people: { Helmi: { bg: '#000', color: '#fff' } } } // opsional: warna khusus per orang
```

`bg` boleh gradasi: `'linear-gradient(90deg,#ffd9dc,#ffa9ad)'`.

### Menambah jadwal baru

1. Tambah kolom baru di Google Sheet (atau di `manualRows`), misalnya `Piket Musala`.
2. Tambah satu item di `sections` dengan `column: 'Piket Musala'`.
3. Atau lewat `demo.html`: tombol **+ Kartu piket** / **+ Tabel mingguan**.

## Cara kerja tampilan

- Hari ini dipilih otomatis. Klik nama hari di tabel untuk melihat petugas hari lain.
- Tombol ‹ › pindah minggu (Senin–Sabtu); **Hari ini** untuk kembali.
- Dibuka hari Minggu → yang tampil minggu depan.
- Berganti otomatis lewat tengah malam tanpa refresh.
- Data dari sheet disimpan di cache browser sebagai cadangan jika koneksi gagal.

## Masalah umum

| Masalah | Solusi |
|---|---|
| Data tidak muncul / selalu data manual | Pastikan sheet sudah **Publish to web** format CSV dan link-nya benar |
| Kartu piket kosong (`-`) | Nama kolom di `column` tidak sama dengan header sheet |
| Tampilan tidak berubah setelah update | Cache jsDelivr; pakai `@commit-hash` |
| Tampilan polos tanpa gaya | `schedule.css` tidak satu folder dengan `schedule.js`; isi `cssUrl` |

## Struktur repo

```
Section/
└── Schedule/
    ├── README.md
    ├── index.html
    ├── schedule.js
    ├── schedule.css
    ├── demo.html
    ├── demo.css
    └── demo.js
```
