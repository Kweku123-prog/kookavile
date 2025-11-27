import Product from "../../models/Auth/productModel.js";


export const createProduct = async (req, res) => {
  try {
    const { name, description, price ,image} = req.body;
    const sellerId = req.user?.id;

    // Collect required fields
    const required = { name, description, price ,image};
    const missing = Object.entries(required)
      .filter(([key, value]) => !value && value !== 0)
      .map(([key]) => key);

    if (missing.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
    }


    // Create product
    const product = await Product.create({
      seller: sellerId,
      name,
      description,
      price,
      image,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const products = await Product.find({ seller: sellerId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products by Seller Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate(
      "seller",
      "fullName email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    // Fetch all products, optionally sort by newest first
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({ message: error.message });
  }
};
