/* Pengaturan Jadwal Kerja. Dibuat oleh demo.html (tombol "Unduh pengaturan (.js)").
   Simpan di folder js/ (js/jadwal-kerja.config.js) dan timpa file lama setiap ada perubahan.
   Hanya berisi pengaturan yang berbeda dari bawaan. Untuk mengedit lagi: demo.html > Buka config. */
window.JADWAL_KERJA_CONFIG = {
  "badge": {
    "people": [
      {
        "name": "Fikri Saputra",
        "enabled": true,
        "labels": [
          "verified",
          {
            "id": "verified",
            "label": "Developer",
            "icon": "assets/icon/code.png"
          }
        ]
      }
    ]
  },
  "verify": {
    "plans": [
      {
        "id": "basic",
        "name": "Basic",
        "normalPrice": "Rp15.000",
        "price": "Rp5.000",
        "period": "/ 3 Bulan",
        "desc": "Pilihan tepat untuk memulai.",
        "thumb": "ocean",
        "thumbImage": "assets/thumb/Basic.png",
        "color": "#1b8fe6",
        "icon": "",
        "popular": false,
        "button": "Pilih Basic",
        "url": "",
        "features": [
          {
            "text": "Verified Badge",
            "icon": "badge"
          },
          {
            "text": "Tampilan di Jadwal Kerja",
            "icon": "layout"
          }
        ]
      },
      {
        "id": "premium",
        "name": "Premium",
        "normalPrice": "Rp30.000",
        "price": "Rp15.000",
        "period": "/ 3 Bulan",
        "desc": "Tampil lebih standout dan berbeda.",
        "thumb": "sunset",
        "thumbImage": "assets/thumb/Premium.png",
        "color": "#e8470c",
        "icon": "",
        "popular": false,
        "button": "Pilih Premium",
        "url": "",
        "features": [
          {
            "text": "Verified Badge",
            "icon": "badge"
          },
          {
            "text": "Animated Gradient Name",
            "note": "Efek warna gradient bergerak pada nama",
            "icon": "wave"
          },
          {
            "text": "Tampilan di Jadwal Kerja",
            "icon": "layout"
          }
        ]
      },
      {
        "id": "platinum",
        "name": "Platinum",
        "normalPrice": "Rp50.000",
        "price": "Rp25.000",
        "period": "/ 1 Tahun",
        "desc": "Eksklusivitas maksimal untuk profil kamu.",
        "thumb": "royal",
        "thumbImage": "assets/thumb/Platinum.png",
        "color": "#6d4aff",
        "icon": "",
        "popular": false,
        "button": "Pilih Platinum",
        "url": "",
        "features": [
          {
            "text": "Verified Badge",
            "icon": "badge"
          },
          {
            "text": "Custom Design Badge",
            "icon": "palette"
          },
          {
            "text": "Animated Gradient Name",
            "note": "Efek warna gradient bergerak pada nama",
            "icon": "wave"
          },
          {
            "text": "Tampilan di Jadwal Kerja",
            "icon": "layout"
          }
        ]
      }
    ]
  }
};
