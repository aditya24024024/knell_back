// import { PrismaClient } from "@prisma/client";
import prisma from "../Prisma_client.js";
import Stripe from "stripe";

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


export const createOrder = async (req, res, next) => {
    try {
      if(req?.userId){
        if (req?.body?.gigid) {
        const { gigid } = req.body;
        // const prisma = new PrismaClient();
        const gig = await prisma.gigs.findUnique({
          where: { id: parseInt(gigid) },
        });
        const paymentIntent = await stripe.paymentIntents.create({
          amount: gig?.price * 100,
          currency: "usd",
          automatic_payment_methods: {
            enabled: true,
          },
        });
        await prisma.orders.create({
          data: {
            paymentIntent: paymentIntent.id,
            price: gig?.price,
            buyer: { connect: { id: req?.userId } },
            gig: { connect: { id: gig?.id } },
          },
        });
        res.status(200).send({
          clientSecret: paymentIntent.client_secret,
          orderid: prisma.orders.id,
        });
      } else {
        res.status(400).send("Gig id is required.");
      }}
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  
  
  export const getBuyerOrders = async (req, res, next) => {
    try {
      if (req.userId) {
        // const prisma = new PrismaClient();
        const orders = await prisma.orders.findMany({
          where: { buyerId: req.userId,},
          include: { gig: true },
        });
        return res.status(200).json({ orders });
      }
      return res.status(400).send("User id is required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  
  export const getSellerOrders = async (req, res, next) => {
    try {
      if (req.userId) {
        // const prisma = new PrismaClient();
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
      }
      return res.status(400).send("User id is required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  export const confirmOrder = async (req, res, next) => {
    // console.log(req.body.orderId);
    try {
      if (req.body.orderId) {
        // const prisma = new PrismaClient();
        await prisma.orders.update({
          where: { id: parseInt(req.body.orderId) },
          data: { status: "Request Accepted" },
        });
        return getSellerOrders;
      }
    } catch (err) {
      // console.log(req.query.orderId);
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  export const complete = async (req, res, next) => {
    // console.log(req.body.orderId);
    try {
      if (req.body.orderId) {
        // const prisma = new PrismaClient();
        await prisma.orders.update({
          where: { id: parseInt(req.body.orderId) },
          data: { status: "Completed" },
        });
        return getSellerOrders;
      }
    } catch (err) {
      // console.log(req.query.orderId);
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  export const decline = async (req, res, next) => {
    // console.log(req.query.orderId)
    try {
      if (req.query.orderId) {
        // const prisma = new PrismaClient();
        await prisma.orders.delete({
          where: { id: parseInt(req.query.orderId) },
        });
        return getSellerOrders
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
    // console.log("starting")
  };