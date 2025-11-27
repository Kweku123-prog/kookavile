import Transaction from "../../models/Auth/transactionsModel.js";

export const createTransaction = async (req, res) => {
  try {
    const { transactionId, title, amount, status, date } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newTransaction = new Transaction({
      transactionId,
      title,
      amount,
      status,
      date,
      user: req.user._id, // ✅ automatically assign user ID
    });

    await newTransaction.save();

    res.status(201).json({
      message: "Transaction saved successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ message: "Failed to save transaction", error });
  }
};

export const getUserTransactions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const transactions = await Transaction.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions", error });
  }
};
