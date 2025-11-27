import Order from "./../../models/Auth/orderModel.js";
import User from "../../models/Auth/userModel.js";
import mongoose from "mongoose";
import Transaction from "../../models/Auth/transactionsModel.js"; // import your transaction model


import Category from "../../models/Auth/categoriesModel.js"; // your Category model


export const createOrder = async (req, res) => {
  try {
    const {
      chefId,
      date,
      time,
      address,
      note,
      amountPaid,
      email,
      phoneNumber,
      numberOfPeople,
      numberOfDays,
      category, // this is the category ID
    } = req.body;

    const customerId = req.user?.id;

    // Required fields
    const requiredFields = { chefId, date, time, address, email, phoneNumber, numberOfPeople, numberOfDays, category, amountPaid };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate chef existence
    const chef = await User.findById(chefId);
    if (!chef || chef.role !== "chef") {
      return res.status(404).json({ message: "Chef not found or invalid" });
    }

    // Get actual category name
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Calculate totalPrice
    const totalPrice = numberOfPeople * numberOfDays * 300;

    // Create order
    const order = await Order.create({
      customer: customerId,
      chef: chefId,
      date,
      time,
      address,
      note,
      email,
      phoneNumber,
      numberOfPeople,
      numberOfDays,
      category: categoryDoc.name, // save category name
      amountPaid,
      totalPrice,
      status: "pending",
    });

    // Save transaction
    const transaction = await Transaction.create({
      user: customerId,
      transactionId: `#TX${Date.now()}`,
      title: `${chef.fullName} - ${categoryDoc.name}`, // use category name
      amount: amountPaid,
      status: "Completed",
      date: new Date(),
      order: order._id,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ["pending", "accepted", "in-progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(orderId).populate("chef customer", "fullName email role");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.chef._id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    // Update order status
    order.status = status;
    await order.save();

    // If status is "completed", calculate deductions and add to chef balance
    if (status === "completed") {
      const originalAmount = parseFloat(order.amountPaid);
      
      // Deduct 1.98% + 30%
      const afterPercentageDeduction = originalAmount * (1 - 0.0198);
      const afterFixed30PercentDeduction = afterPercentageDeduction * (1 - 0.30);

      // Update chef balance
      await addAmountInternal(order.chef._id, afterFixed30PercentDeduction);
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal helper to add amount safely for Decimal128 (without Express req/res)
const addAmountInternal = async (chefId, amount) => {
  if (!amount || typeof amount !== "number") return;

  const chef = await User.findById(chefId);
  if (!chef || chef.role !== "chef") return;

  const currentBalance = parseFloat(chef.availableBalance?.toString()) || 0;
  const newBalance = currentBalance + amount;

  chef.availableBalance = mongoose.Types.Decimal128.fromString(newBalance.toString());
  await chef.save();
};


// ✅ Get all orders for logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // If the user is a customer, get orders they booked
    // If the user is a chef, get orders assigned to them
    const query =
      req.user.role === "chef"
        ? { chef: userId }
        : { customer: userId };

    const orders = await Order.find(query)
      .populate("customer", "fullName email")
      .populate("chef", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("customer", "fullName email")
      .populate("chef", "fullName email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure only the customer or chef related to the order can view it
    if (
      order.customer._id.toString() !== req.user.id &&
      order.chef._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }




};


// ✅ Get detailed order by ID
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("customer", "fullName email role")
      .populate("chef", "fullName email role description categories")
      .exec();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Only the related customer or chef can view this order
    if (
      order.customer._id.toString() !== req.user.id &&
      order.chef._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({
      message: "Order details fetched successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};