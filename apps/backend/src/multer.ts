import multer from "multer";

import type { RequestHandler } from "express";

const storage = multer.memoryStorage();

export const singleUpload: RequestHandler =
  multer({ storage }).single("resume");

