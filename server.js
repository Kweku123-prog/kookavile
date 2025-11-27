import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import categoriesRouter from "./routes/categoriesRoutes.js";
import orderRoute from "./routes/orderRoutes.js";
import productRoute from "./routes/productRoutes.js";              
import transactionRoutes from "./routes/transactionRoutes.js";
dotenv.config();
connectDB();




const app = express();

app.use(express.json());

// Routes
app.use("/api/categories", categoriesRouter);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoute);
app.use("/api/products", productRoute);
app.use("/api/transactions", transactionRoutes);
app.use(cors({
  origin: "*", // allow all
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.get("/test", (req, res) => res.send("Server is working ✅"));

const PORT = process.env.PORT || 5300;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

