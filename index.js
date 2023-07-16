const multer = require("multer");
const { Artikel, Admin, komentar } = require("./models");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/input", upload.single("gambar"), async (req, res) => {
  try {
    const { judul, content } = req.body;
    const gambar = req.file.path;
    const adminData = await Admin.findOne({
      where: { username: "admin1" },
      raw: true,
    });
    console.log(gambar);
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

app.get("/admins", async (req, res) => {
  try {
    const adminData = await Admin.findAll();
    res.status(200).json({ message: "Admin berhasil ditampilkan", adminData });
  } catch (error) {
    console.error("Terjadi kesalahan dalam menampilkan admin:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan dalam menampilkan admin" });
  }
});

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

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

app.listen(port, () => {
  console.log(`Listening in port http://localhost:${port}`);
});
