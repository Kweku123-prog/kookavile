import express from "express";
import { createProduct ,getProductsBySeller,getProductById,getAllProducts} from "../controllers/products/productsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createProduct);
// GET /products/seller/:sellerId
router.get("/seller/:sellerId", getProductsBySeller);

// GET /products/:productId
router.get("/:productId", getProductById);
router.get("/", getAllProducts);
export default router;
