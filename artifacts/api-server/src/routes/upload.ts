import { Router, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

const router = Router();

const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

function uploadToCloudinary(buffer: Buffer, mimetype: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const format = mimetype.split("/")[1] || "jpg";
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "royal-jersey-bd",
        resource_type: "image",
        format,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

function saveLocalAndGetUrl(req: Request, file: Express.Multer.File): string {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filename = uniqueSuffix + path.extname(file.originalname);
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}/api/uploads/${filename}`;
}

router.post("/upload", upload.single("image"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    let url: string;
    if (hasCloudinary) {
      url = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    } else {
      url = saveLocalAndGetUrl(req, req.file);
    }
    return res.json({ url });
  } catch (err: any) {
    return res.status(500).json({ error: "Upload failed: " + (err?.message || "Unknown error") });
  }
});

export default router;
