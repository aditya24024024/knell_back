import prisma from "../Prisma_client.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/**
 * =========================
 * GET SELLER WALLET
 * =========================
 */
export const getSellerWallet = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).send("Unauthorized");

    let wallet = await prisma.sellerWallet.findUnique({
      where: { sellerId: req.userId },
    });

    // Auto-create wallet if first time
    if (!wallet) {
      wallet = await prisma.sellerWallet.create({
        data: { sellerId: req.userId },
      });
    }

    return res.status(200).json({ wallet });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * =========================
 * ADD / UPDATE BANK DETAILS
 * =========================
 */
export const addBankDetails = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifsc } = req.body;
    if (!req.userId) return res.status(401).send("Unauthorized");

    const seller = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    const contact = await razorpay.contacts.create({
      name: seller.fullName || seller.username,
      email: seller.email,
      type: "vendor",
    });

    const fundAccount = await razorpay.fundAccounts.create({
      contact_id: contact.id,
      account_type: "bank_account",
      bank_account: {
        name: accountHolderName,
        ifsc,
        account_number: accountNumber,
      },
    });

    const wallet = await prisma.sellerWallet.update({
      where: { sellerId: req.userId },
      data: {
        razorpayContactId: contact.id,
        razorpayFundAccountId: fundAccount.id,
      },
    });

    return res.status(200).json({ wallet });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * =========================
 * WITHDRAW MONEY
 * =========================
 */
export const withdrawAmount = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!req.userId) return res.status(401).send("Unauthorized");

    const wallet = await prisma.sellerWallet.findUnique({
      where: { sellerId: req.userId },
    });

    if (!wallet?.razorpayFundAccountId) {
      return res.status(400).send("Bank details not added");
    }

    if (wallet.balance < amount) {
      return res.status(400).send("Insufficient balance");
    }

    await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      fund_account_id: wallet.razorpayFundAccountId,
      amount: amount * 100,
      currency: "INR",
      mode: "IMPS",
      purpose: "payout",
    });

    await prisma.sellerWallet.update({
      where: { sellerId: req.userId },
      data: {
        balance: { decrement: amount },
      },
    });

    return res.status(200).json("Withdrawal successful");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};
