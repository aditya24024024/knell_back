import prisma from "../Prisma_client.js";

export const getSellerData = async (req, res, next) => {
  try {
    if (req.userId) {
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
      const stat = await prisma.orders.count({
        where: {
          gig: {
            createdBy: {
              id: req.userId,
            },
          },
          status:{
            not:"Completed",
          }
      }});
      return res.status(200).json({
        dashboardData: {
          orders,
          gigs,
          unreadMessages,
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
