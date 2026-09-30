import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
dotenv.config();
import multer from "multer";

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

const STORAGE_PARAMS = {
  folder: "images",
  allowed_formats: ["jpg", "png", "jpeg"],
  rescource_type: "image",
  quality: "auto:good",
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    ...STORAGE_PARAMS,
  }),
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_, file, cb) => {
    const isValid = /^image\/(jpe?g|png)$/.test(file.mimetype);
    if (!isValid) {
      return;
    }

    cb(null, true);
  },
});
