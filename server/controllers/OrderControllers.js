import prisma from "../Prisma_client.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import { send_mail, accept_mail } from "./MailControllers.js";


dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createOrder = async (req, res, next) => {
    try {
      if(req?.userId){
        if (req?.body?.gigid) {
        const { gigid } = req.body;
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
        const already_ordered=await prisma.orders.findFirst({
          where: { gigId: parseInt(gigid),
                    buyerId:req?.userId,
                    status:{
                        not:"Completed"
                    }
                 },
        });
        if(already_ordered) {return res.status(401).send("You already have a pending request from the gig");}
        await prisma.orders.create({
          data: {
            paymentIntent: paymentIntent.id,
            price: gig?.price,
            buyer: { connect: { id: req?.userId } },
            gig: { connect: { id: gig?.id } },
          },
        });
        const userId=gig.userId;
        const {email}=await prisma.user.findUnique({
          where:{id:userId},
          select:{email:true},
        })
        await send_mail(email);
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
        const orders = await prisma.orders.findMany({
          where: { buyerId: req.userId,},
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

  export const getSellerRequests = async (req, res, next) => {
    try {
      if (req.userId) {
        const orders = await prisma.orders.findMany({
          where: {
            gig: {
              createdBy: {
                id: parseInt(req.userId),
              },
            },
            status: {
                not:"Completed",
            }
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
    try {
      if (req.body.orderId) {
        await prisma.orders.update({
          where: { id: parseInt(req.body.orderId) },
          data: { status: "Request Accepted" },
        });
          const {buyerId}=await prisma.orders.findUnique({
              where: { id: parseInt(req.body.orderId) },
              select:{buyerId:true},
          });
          console.log(buyerId);
        const {email}=await prisma.user.findUnique({
          where:{id:buyerId},
          select:{email:true},
        })
        await accept_mail(email);
        return res.status(200).json("Success");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  export const all_orders = async (req, res, next) => {
    try {
      if (req.userId) {
        const orders = await prisma.orders.findMany();
        return res.status(200).json({ orders });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  export const delete_orders = async (req, res, next) => {
    try {
      if (req.userId) {
        await prisma.orders.delete({
          where:{
            id:parseInt(req.query.orderId),
          }
        },);
          return res.status(200).json("Success");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  export const complete = async (req, res, next) => {
    try {
      if (req.body.orderId) {
        await prisma.orders.update({
          where: { id: parseInt(req.body.orderId) },
          data: { status: "Completed" },
        });
          return res.status(200).json("Success");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  export const decline = async (req, res, next) => {
    try {
      if (req.query.orderId) {
        await prisma.orders.delete({
          where: { id: parseInt(req.query.orderId) },
        });
          return res.status(200).json("Success");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
