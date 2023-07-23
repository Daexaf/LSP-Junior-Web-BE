// Import library dan model yang dibutuhkan
const multer = require("multer");
const { Artikel, admin, komentar } = require("./models");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
const path = require("path");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isAdmin = (req, res, next) => {
  // Di sini, Anda perlu mengimplementasikan logika untuk memeriksa peran pengguna.
  // Misalnya, Anda dapat menggunakan data yang disimpan dalam token JWT atau data yang ada dalam sesi atau database untuk memverifikasi peran pengguna.

  // Contoh sederhana untuk memeriksa apakah peran admin ada dalam data lokal storage
  const role = localStorage.getItem("role");
  if (role === "admin") {
    // Jika pengguna memiliki peran admin, lanjutkan ke middleware berikutnya atau ke route yang dimaksud.
    next();
  } else {
    // Jika pengguna bukan admin, kirimkan respon dengan status 403 (Forbidden).
    res
      .status(403)
      .json({ message: "Anda tidak memiliki akses sebagai admin" });
  }
};

// Konfigurasi multer untuk meng-handle upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Endpoints

// Endpoint untuk menambahkan artikel baru
app.post("/input", upload.single("gambar"), async (req, res) => {
  try {
    const { judul, content } = req.body;
    const gambar = req.file.path;

    // Cari admin berdasarkan username
    const adminData = await admin.findOne({
      where: { username: "admin1" },
      raw: true,
    });

    // Buat artikel baru dengan data yang diterima dari request
    const artikelData = await Artikel.create({
      judul,
      content,
      gambar,
      id_admin: adminData.id,
    });

    res.status(201).json({ message: "Artikel berhasil dibuat", artikelData });
  } catch (error) {
    console.error("Terjadi kesalahan dalam membuat artikel:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan dalam membuat artikel" });
  }
});

// Endpoint untuk mendapatkan detail artikel berdasarkan ID
app.get("/artikel/:id", async (req, res) => {
  try {
    const artikelData = await Artikel.findByPk(req.params.id);
    res
      .status(200)
      .json({ message: "Artikel berhasil ditemukan", artikelData });
  } catch (error) {
    console.error("Terjadi kesalahan dalam membuat artikel:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan dalam membuat artikel" });
  }
});

// Endpoint untuk mendapatkan semua artikel
app.get("/artikel", async (req, res) => {
  try {
    const artikelData = await Artikel.findAll();
    res
      .status(200)
      .json({ message: "Artikel berhasil ditampilkan", artikelData });
  } catch (error) {
    console.error("Terjadi kesalahan dalam membuat artikel:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan dalam membuat artikel" });
  }
});

// Endpoint untuk memperbarui artikel berdasarkan ID
app.put("/artikel/:id", upload.single("gambar"), async (req, res) => {
  try {
    const { id } = req.params;
    const artikel = await Artikel.findByPk(id);
    if (!artikel) {
      return res.status(404).json({ message: "Artikel tidak ditemukan" });
    }

    // Perbarui data judul dan content artikel
    const { judul, content } = req.body;
    artikel.judul = judul;
    artikel.content = content;

    // Perbarui gambar artikel jika ada unggahan gambar baru
    if (req.file) {
      artikel.gambar = req.file.path;
    }

    // Simpan perubahan artikel ke dalam database
    await artikel.save();

    res.status(200).json({
      message: "Artikel berhasil diperbarui",
      artikel: artikel,
    });
  } catch (error) {
    console.error("Terjadi kesalahan saat memperbarui artikel:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memperbarui artikel" });
  }
});

// Endpoint untuk mendapatkan semua data admin
app.get("/admins", async (req, res) => {
  try {
    const adminData = await admin.findAll();
    res.status(200).json({ message: "Admin berhasil ditampilkan", adminData });
  } catch (error) {
    console.error("Terjadi kesalahan dalam menampilkan admin:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan dalam menampilkan admin" });
  }
});

// Menyediakan akses ke folder uploads untuk menyajikan gambar
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// Endpoint untuk menambahkan komentar baru
app.post("/komentars", async (req, res) => {
  try {
    const { id_artikel, nama, email, comment } = req.body;
    const komentarData = await komentar.create({
      id_artikel,
      nama,
      email,
      comment,
    });

    res
      .status(201)
      .json({ message: "Komentar berhasil ditambahkan", komentarData });
  } catch (error) {
    console.error("Terjadi kesalahan dalam menambahkan komentar:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan dalam menambahkan komentar" });
  }
});

// Endpoint untuk mendapatkan semua komentar berdasarkan ID artikel
app.get("/komentars/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const komentarData = await komentar.findAll({
      where: { id_artikel: id },
    });

    res
      .status(200)
      .json({ message: "Komentar berhasil ditemukan", komentarData });
  } catch (error) {
    console.error("Terjadi kesalahan dalam mengambil komentar:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan dalam mengambil komentar" });
  }
});

app.delete("/komentars/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const komentarData = await komentar.destroy({ where: { id } });

    if (komentarData) {
      return res.status(200).json({ message: "Komentar berhasil dihapus" });
    } else {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }
  } catch (error) {
    console.error("Terjadi kesalahan dalam menghapus komentar:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan dalam menghapus komentar" });
  }
});

app.delete("/artikel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const artikel = await Artikel.findByPk(id);
    if (!artikel) {
      return res.status(404).json({ message: "Artikel tidak ditemukan" });
    }

    // Hapus artikel dari database
    await artikel.destroy();

    res.status(200).json({ message: "Artikel berhasil dihapus" });
  } catch (error) {
    console.error("Terjadi kesalahan saat menghapus artikel:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menghapus artikel" });
  }
});

// Menjalankan server pada port yang ditentukan
app.listen(port, () => {
  console.log(`Listening in port http://localhost:${port}`);
});
