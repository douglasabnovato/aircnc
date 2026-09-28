/* Upload da imagem do spot: só JPEG/PNG/WebP até 2 MB, nome aleatório (sem usar o nome enviado) */
const multer = require("multer");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const TYPES = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const MAX_BYTES = 2 * 1024 * 1024;

/* Cria o middleware de upload gravando em uploadDir */
function createUpload(uploadDir) {
  fs.mkdirSync(uploadDir, { recursive: true });
  return multer({
    storage: multer.diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => cb(null, `${Date.now()}-${randomUUID().slice(0, 8)}${TYPES[file.mimetype]}`),
    }),
    limits: { fileSize: MAX_BYTES, files: 1, fields: 10 },
    fileFilter: (req, file, cb) => {
      if (TYPES[file.mimetype]) return cb(null, true);
      const err = new Error("Envie uma imagem JPEG, PNG ou WebP.");
      err.status = 400;
      return cb(err);
    },
  }).single("thumbnail");
}

/* Remove um arquivo enviado quando o cadastro é recusado */
function discard(file) {
  if (file?.path) fs.promises.unlink(file.path).catch(() => undefined);
}

module.exports = { createUpload, discard, MAX_BYTES, basename: (f) => path.basename(f) };
/* Fim de upload.js */
