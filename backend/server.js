import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const app = express();
app.use(cors()); // en prod, restreins à l'origine de ton frontend : cors({ origin: "https://ton-app.vercel.app" })

// Fichiers uploadés servis statiquement
app.use("/files", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 Mo max par fichier
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

  const isImage = req.file.mimetype.startsWith("image/");
  res.json({
    name: req.file.originalname,
    size: req.file.size,
    kind: isImage ? "image" : "file",
    url: `${req.protocol}://${req.get("host")}/files/${req.file.filename}`,
  });
});

app.get("/", (req, res) => res.send("ETC Club — backend fichiers OK"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend fichiers en écoute sur le port ${PORT}`));
