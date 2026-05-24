// server/lib/file-storage.ts — Multer config for document transfers

import multer from "multer";
import path from "path";
import fs from "fs";
import type { Express } from "express";

const uploadDir = path.join(process.cwd(), "uploads", "transfers");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "application/zip",
]);

export const transferUpload = multer({
  dest: uploadDir,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

export function serveTransferFiles(app: Express) {
  const express = require("express");
  app.use("/api/files/transfers", express.static(uploadDir));
}
