import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "uploads");
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : null;

initializeApp({ credential: serviceAccount ? cert(serviceAccount) : applicationDefault() });

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN }));

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
  fileFilter: (req, file, cb) => {
    const allowedTypes = new Set([
      "image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]);
    cb(null, allowedTypes.has(file.mimetype));
  },
});

async function requireFirebaseUser(req, res, next) {
  const token = req.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: "Authentification requise" });
  try {
    req.user = await getAuth().verifyIdToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Jeton d'authentification invalide" });
  }
}

app.post("/upload", requireFirebaseUser, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

  const isImage = req.file.mimetype.startsWith("image/");
  res.json({
    name: req.file.originalname,
    size: req.file.size,
    kind: isImage ? "image" : "file",
    url: `${req.protocol}://${req.get("host")}/files/${req.file.filename}`,
  });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Le fichier dépasse la limite de 15 Mo" });
  }
  next(error);
});

app.get("/", (req, res) => res.send("ETC Club — backend fichiers OK"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend fichiers en écoute sur le port ${PORT}`));
