import express from "express";
import multer from "multer";
import cloudinary from "../cloudinary.js";
import fs from "fs";

const router = express.Router();

// Multer setup for temporary storage
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "kookavile", // optional: folder in Cloudinary
    });

    // Remove local file after upload
    fs.unlinkSync(req.file.path);

    // Send Cloudinary URL in response
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
