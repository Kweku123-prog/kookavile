import express from "express";
import { register, login,getAllChefs,getUserDetails ,addAmount,getUserDetailsByUserId,rateSeller,getSellerRating,getSellerRatingDetails} from "../controllers/auth/authController.js";
import { createOrder } from "../controllers/orders/ordersController.js";   
import { protect } from "../middleware/authMiddleware.js"; 
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getAllChefs",getAllChefs);
router.get("/users/:userId", getUserDetailsByUserId); // GET /api/users/:userId
router.get("/me", protect, getUserDetails); // GET /api/users/me
router.put("/chefs/:userId/add-amount", addAmount);
router.post("/rate/:sellerId", protect, rateSeller);
router.get("/seller/:sellerId/rating/details", getSellerRatingDetails);
router.get("/seller/:sellerId/rating", getSellerRating);
export default router;
