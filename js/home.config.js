// ===========================================================================
// KONFIGURASI HOME JOOMAX: semua link dan isi diatur dari sini.
// Menu header dan footer TIDAK diatur di sini, tapi di repo headerfooter
// (joomax-layout.config.js).
//
// href "#"  = link sementara (diklik tidak ke mana-mana).
// thumb / img kosong = placeholder otomatis.
// Semua path gambar relatif terhadap index.html, mis. "assets/thumb/izin.jpg".
// ===========================================================================
window.JOOMAX_HOME = {

  // ---- Banner slide ----------------------------------------------------------
  // Ganti gambar: taruh file di assets/banner/ lalu ubah "img" di bawah.
  // Ukuran terbaik 1440 x 530 px (format WebP / JPG / PNG). Tambah atau hapus item bebas.
  // href (opsional): banner jadi bisa diklik.
  banner: {
    autoplay: 5000,        // jeda ganti slide (ms). 0 = tidak otomatis
    dots: true,            // titik penanda di bawah banner
    items: [
      { img: "assets/banner/banner3.webp", alt: "Banner Joomax" },
      { img: "assets/banner/banner.webp",  alt: "Banner Joomax" },
      { img: "assets/banner/banner2.webp", alt: "Welcome, 2027" }
    ]
  },

  // ---- Judul utama -----------------------------------------------------------
  hero: {
    title: "Welcome to Joomax",
    subtitle: "Everything You Need, In One Place.",
    placeholder: "Search"
  },

  // ---- Quick Access (geser kiri/kanan kalau lebih dari 2) -------------------------
  // icon: calendar | clipboard | file | table | frame | book | image | resize | grid
  quick: [
    { title: "Jadwal Kerja", desc: "Klik Untuk Melihat - Spreadsheet", icon: "table",
      href: "https://docs.google.com/spreadsheets/d/1OEg0_ey3srgomeU1Q1JEdI0h3PW93zb-mxHVxdZiuuY/edit?pli=1&gid=982571310#gid=982571310",
      thumb: "assets/thumb/jadwalkerja.jpg" },
    { title: "Pengajuan Izin/Sakit", desc: "Klik Untuk Melihat - Google Sheet", icon: "file",
      href: "https://forms.gle/SETnE5LfT6avQ5Q39",
      thumb: "assets/thumb/izin.jpg" }
  ],

  // ---- Featured Tools --------------------------------------------------------
  tools: [
    { name: "Image to Frame", desc: "Pasang frame Joomax ke banyak foto sekaligus.",
      href: "https://designjoomax.github.io/imagetoframe/", thumb: "assets/thumb/imagetoframe.jpg" },
    { name: "Marketplace Image Generator", desc: "Buat gambar produk untuk marketplace.",
      href: "https://designjoomax.github.io/generator/", thumb: "assets/thumb/pengembang.jpg" },
    { name: "Image Resizer", desc: "Ubah ukuran gambar dengan cepat.",
      href: "https://designjoomax.github.io/tools/", thumb: "assets/thumb/pengembang.jpg" }
  ],

  // ---- Latest Memories -------------------------------------------------------
  // id harus sama dengan id album di repo gallery (js/gallery.config.js), supaya
  // klik foto langsung membuka albumnya. img kosong = placeholder.
  // Item pertama tampil besar. Disarankan 5 item.
  gallery: {
    href: "https://designjoomax.github.io/gallery/",
    items: [
      { id: "liburland",        title: "Liburland",        date: "2026-10-12", img: "" },
      { id: "ulang-tahun",      title: "Ulang Tahun",      date: "2026-10-05", img: "" },
      { id: "buka-bersama",     title: "Buka Bersama",     date: "2026-09-27", img: "" },
      { id: "hari-kemerdekaan", title: "Hari kemerdekaan", date: "2026-08-17", img: "" },
      { id: "rapat-tahunan",    title: "Rapat tahunan",    date: "2026-08-02", img: "" }
    ]
  }
};
