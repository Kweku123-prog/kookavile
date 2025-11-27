import express from "express";
import Category from "./../models/Auth/categoriesModel.js";

const router = express.Router();

// POST /api/categories -> Add category
router.post("/", async (req, res) => {
  try {
    const { name, description,image } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
else if(!image){
      return res.status(400).json({ message: "Category image is required" });
    }


    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name, description,image });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/categories -> Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
