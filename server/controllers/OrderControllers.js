import prisma from "../Prisma_client.js";
import dotenv from "dotenv";
dotenv.config();

import Razorpay from "razorpay";
import crypto from "crypto";
import { send_mail, accept_mail } from "./MailControllers.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/**
 * =================================================
 * CREATE ORDER OR VERIFY PAYMENT
 * =================================================
 */
export const createOrder = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).send("Unauthorized");

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      gigid,
    } = req.body;

    /**
     * =========================
     * 1️⃣ PAYMENT VERIFICATION
     * =========================
     */
    if (
      razorpay_payment_id &&
      razorpay_order_id &&
      razorpay_signature
    ) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).send("Invalid payment signature");
      }

      await prisma.orders.updateMany({
        where: { paymentIntent: razorpay_order_id },
        data: { status: "Paid" },
      });

      return res.status(200).json({ message: "Payment verified" });
    }

    /**
     * =========================
     * 2️⃣ ORDER CREATION yoyoyoyo
     * =========================
     */
    if (!gigid) return res.status(400).send("Gig id is required");

    const gig = await prisma.gigs.findUnique({
      where: { id: parseInt(gigid) },
    });

    if (!gig) return res.status(404).send("Gig not found");

    const alreadyOrdered = await prisma.orders.findFirst({
      where: {
        gigId: gig.id,
        buyerId: req.userId,
        status: { not: "Completed" },
      },
    });

    if (alreadyOrdered) {
      return res
        .status(409)
        .send("You already have an active request for this gig");
    }

    // 🔥 Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: gig.price * 100,
      currency: "INR",
      receipt: `gig_${gigid}_${Date.now()}`,
    });

    await prisma.orders.create({
      data: {
        paymentIntent: razorpayOrder.id,
        price: gig.price,
        buyer: { connect: { id: req.userId } },
        gig: { connect: { id: gig.id } },
        status: "Pending",
      },
    });

    // 📧 Notify seller
    const seller = await prisma.user.findUnique({
      where: { id: gig.userId },
      select: { email: true },
    });

    if (seller?.email) {
      await send_mail(seller.email);
    }

    return res.status(200).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * =================================================
 * BUYER ORDERS
 * =================================================
 */
export const getBuyerOrders = async (req, res) => {
  try {
    if (!req.userId) return res.status(400).send("User id is required.");

    const orders = await prisma.orders.findMany({
      where: { buyerId: req.userId },
      include: {
        gig: {
          include: {
            createdBy: {
              select: {
                profileImage: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ orders });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * =================================================
 * SELLER COMPLETED ORDERS
 * =================================================
 */
export const getSellerOrders = async (req, res) => {
  try {
    if (!req.userId) return res.status(400).send("User id is required.");

    const orders = await prisma.orders.findMany({
      where: {
        gig: {
          createdBy: {
            id: parseInt(req.userId),
          },
        },
        status: "Completed",
      },
      include: {
        gig: true,
        buyer: true,
      },
    });

    return res.status(200).json({ orders });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * =================================================
 * SELLER REQUESTS (PENDING / ACCEPTED)
 * =================================================
 */
export const getSellerRequests = async (req, res) => {
  try {
    if (!req.userId) return res.status(400).send("User id is required.");

    const orders = await prisma.orders.findMany({
      where: {
        gig: {
          createdBy: {
            id: parseInt(req.userId),
          },
        },
        status: { not: "Completed" },
      },
      include: {
        gig: true,
        buyer: true,
      },
    });

    return res.status(200).json({ orders });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * =================================================
 * SELLER ACCEPTS ORDER
 * =================================================
 */
export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).send("Order id required");

    await prisma.orders.update({
      where: { id: parseInt(orderId) },
      data: { status: "Request Accepted" },
    });

    const order = await prisma.orders.findUnique({
      where: { id: parseInt(orderId) },
      select: { buyerId: true },
    });

    const buyer = await prisma.user.findUnique({
      where: { id: order.buyerId },
      select: { email: true },
    });

    if (buyer?.email) {
      await accept_mail(buyer.email);
    }

    return res.status(200).json("Success");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * =================================================
 * ADMIN / MISC
 * =================================================
 */
export const all_orders = async (req, res) => {
  try {
    if (!req.userId) return res.status(400).send("User id is required.");

    const orders = await prisma.orders.findMany({
      orderBy: { id: "asc" },
    });

    return res.status(200).json({ orders });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const delete_orders = async (req, res) => {
  try {
    if (!req.userId) return res.status(400).send("User id is required.");

    await prisma.orders.delete({
      where: { id: parseInt(req.query.orderId) },
    });

    return res.status(200).json("Success");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const complete = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).send("Order id required");

    await prisma.orders.update({
      where: { id: parseInt(orderId) },
      data: { status: "Completed" },
    });

    return res.status(200).json("Success");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const decline = async (req, res) => {
  try {
    await prisma.orders.delete({
      where: { id: parseInt(req.query.orderId) },
    });

    return res.status(200).json("Success");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};
