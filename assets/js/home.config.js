// ===========================================================================
// KONFIGURASI HOME JOOMAX: semua link dan isi diatur dari sini.
// href "#" = link sementara. Ganti dengan link asli kalau halamannya sudah jadi.
// icon: calendar | clipboard | file | table | frame | book | image | resize | grid
// thumb / img: kosongkan = placeholder otomatis. Isi dengan path gambar, mis. "assets/img/tool-frame.jpg"
// ===========================================================================
window.JOOMAX_HOME = {
  quick: [
    { title: "Jadwal Kerja", desc: "Lihat jadwal kerja tim.", icon: "calendar", href: "https://docs.google.com/spreadsheets/d/1OEg0_ey3srgomeU1Q1JEdI0h3PW93zb-mxHVxdZiuuY/edit?pli=1&gid=982571310#gid=982571310" 
      thumb: "https://raw.githubusercontent.com/designjoomax/home/main/assets/thumb/jadwalkerja.jpg"
    },

    { title: "Jadwal Piket", desc: "Cek giliran piket harian.", icon: "clipboard", href: "https://docs.google.com/spreadsheets/d/1mXOwBjsoVrU3rJr9XWO6LnKoIOMe2PHVvUV5hc0y5Po/edit?gid=472399028#gid=472399028" },
    { title: "Pengajuan Izin", desc: "Ajukan izin dan cuti.", icon: "file", href: "https://forms.gle/SETnE5LfT6avQ5Q39" 
    thumb: "https://raw.githubusercontent.com/designjoomax/home/main/assets/thumb/jadwalkerja.jpg"
    },

    { title: "Spreadsheet", desc: "Buka data kerja bersama.", icon: "table", href: "https://docs.google.com/spreadsheets/d/1OEg0_ey3srgomeU1Q1JEdI0h3PW93zb-mxHVxdZiuuY/edit?usp=sharing" },
    { title: "Image to Frame", desc: "Pasang frame ke foto.", icon: "frame", href: "https://designjoomax.github.io/imagetoframe/" },
    { title: "Resource Center", desc: "Others.", icon: "book", href: "#" }
  ],
  announcements: [
    { title: "Jadwal piket bulan November", date: "2026-10-28", category: "Operasional",
      desc: "Jadwal piket terbaru sudah dibagikan untuk seluruh tim.",
      body: ["Jadwal piket November 2026 sudah tersedia. Silakan cek giliran masing-masing."] },
    { title: "Pembaruan sistem pengajuan izin", date: "2026-10-22", category: "Sistem",
      desc: "Formulir pengajuan izin kini lebih singkat dan mudah diisi.",
      body: ["Formulir pengajuan izin telah disederhanakan.", "Jika menemukan kendala, Hubungi joomax@id."] },
    { title: "Dokumentasi kegiatan kantor", date: "2026-10-15", category: "Kegiatan",
      desc: "Foto kegiatan terbaru sudah ditambahkan ke galeri.",
      body: ["Dokumentasi kegiatan bulan ini sudah masuk ke galeri.", "Buka halaman Gallery untuk melihat semuanya."] }
  ],
  tools: [
    { name: "Image to Frame", desc: "Pasang frame Joomax ke banyak foto sekaligus.", href: "https://designjoomax.github.io/imagetoframe/", thumb: "https://raw.githubusercontent.com/designjoomax/home/main/assets/thumb/imagetoframe.jpg" },
    { name: "Marketplace Image Generator", desc: "Buat gambar produk untuk marketplace.", href: "https://designjoomax.github.io/generator/", thumb: "https://raw.githubusercontent.com/designjoomax/home/main/assets/thumb/pengembang.jpg" },
    { name: "Image Resizer", desc: "Ubah ukuran gambar dengan cepat.", href: "https://designjoomax.github.io/tools/", thumb: "https://raw.githubusercontent.com/designjoomax/home/main/assets/thumb/pengembang.jpg" }
  ],
  gallery: {
    href: "https://designjoomax.github.io/gallery/", // halaman Gallery
    items: [
      { title: "Liburland", date: "2026-10-12", img: "" },
      { title: "Ulang Tahun", date: "2026-10-05", img: "" },
      { title: "Buka Bersama", date: "2026-09-27", img: "" },
      { title: "Hari kemerdekaan", date: "2026-08-17", img: "" },
      { title: "Rapat tahunan", date: "2026-08-02", img: "" }
    ]
  }
};
