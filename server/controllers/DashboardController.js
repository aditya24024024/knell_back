// import { PrismaClient } from "@prisma/client";
import prisma from "../Prisma_client.js";

export const getSellerData = async (req, res, next) => {
  try {
    if (req.userId) {
      // const prisma = new PrismaClient();
      const gigs = await prisma.gigs.count({ where: { userId: req.userId } });
      const {
        _count: { id: orders },
      } = await prisma.orders.aggregate({
        where: {
          status: "Completed",
          gig: {
            createdBy: {
              id: req.userId,
            },
          },
        },
        _count: {
          id: true,
        },
      });
      const unreadMessages = await prisma.message.count({
        where: {
          recipientId: req.userId,
          isRead: false,
        },
      });

      // const today = new Date();
      // const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      // const thisYear = new Date(today.getFullYear(), 0, 1);

      // const {
      //   _sum: { price: revenue },
      // } = await prisma.orders.aggregate({
      //   where: {
      //     gig: {
      //       createdBy: {
      //         id: req.userId,
      //       },
      //     },
      //     status: "completed",
      //     createdAt: {
      //       gte: thisYear,
      //     },
      //   },
      //   _sum: {
      //     price: true,
      //   },
      // });

      // const {
      //   _sum: { price: dailyRevenue },
      // } = await prisma.orders.aggregate({
      //   where: {
      //     gig: {
      //       createdBy: {
      //         id: req.userId,
      //       },
      //     },
      //     status: "completed",
      //     createdAt: {
      //       gte: new Date(new Date().setHours(0, 0, 0, 0)),
      //     },
      //   },
      //   _sum: {
      //     price: true,
      //   },
      // });

      // const {
      //   _sum: { price: monthlyRevenue },
      // } = await prisma.orders.aggregate({
      //   where: {
      //     gig: {
      //       createdBy: {
      //         id: req.userId,
      //       },
      //     },
      //     status: "completed",
      //     createdAt: {
      //       gte: thisMonth,
      //     },
      //   },
      //   _sum: {
      //     price: true,
      //   },
      // });
      
      const stat = await prisma.orders.count({
        where: {
          gig: {
            createdBy: {
              id: req.userId,
            },
          },
          status: "Request Sent",
      }});
      // console.log(orders)
      return res.status(200).json({
        dashboardData: {
          orders,
          gigs,
          unreadMessages,
          // dailyRevenue,
          // monthlyRevenue,
          // revenue,
          stat,
        },
      });
    }
    return res.status(400).send("User id is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};