import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kookavile", // optional: folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const parser = multer({ storage });

export default parser;
