import prisma from "../Prisma_client.js";
import { v2 as cloudinary } from "cloudinary";

function extractPublicId(url) {
  try {
    const parts = url.split("/");
    const publicIdWithExt = parts.slice(-2).join("/"); // e.g., "gigs/filename.jpg"
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension
    return publicId;
  } catch {
    return null;
  }
}

export const addGig = async (req, res, next) => {
    try {
      if (req.files) {
        // const fileKeys = Object.keys(req.files);
        // const fileNames = [];
        // fileKeys.forEach((file) => {
        //   const date = Date.now();
        //   renameSync(
        //     req.files[file].path,
        //     "uploads/" + date + req.files[file].originalname
        //   );
        //   fileNames.push(date + req.files[file].originalname);
        // });
        const fileNames = req.files.map(file => file.path);
        if (req.query) {
          const {
            title,
            description,
            category,
            features,
            price,
            time,
            shortDesc,
          } = req.query;
  
          await prisma.gigs.create({
            data: {
              title,
              description,
              deliveryTime: parseInt(time),
              category,
              features,
              price: parseInt(price),
              shortDesc,
              createdBy: { connect: { id: req.userId } },
              images: fileNames,
            },
          });
  
          return res.status(201).send("Successfully created the gig.");
        }
      }
      return res.status(400).send("All properties should be required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };

  export const getUserAuthGigs = async (req, res, next) => {
    try {
      if (req.userId) {
        // const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({
          where: { id: req.userId },
          include: { gigs: true },
        });
        return res.status(200).json({ gigs: user?.gigs ?? [] });
      }
      return res.status(400).send("UserId should be required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  
  export const getGigData = async (req, res, next) => {
    try {
      if (req.params.gigid) {
        // const prisma = new PrismaClient();
        const gig=await prisma.gigs.findUnique({
          where:{id:parseInt(req.params.gigid)},
          include: {
            reviews: {
              include: {
                reviewer: true,
              },
            },
            createdBy: true,
          },
        })
        return res.status(200).json({ gig});
      }
      return res.status(400).send("GigId should be required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };

  export const editGig = async (req, res, next) => {
      // console.log(req.params.gigid);
      // console.log(req.params.gigId);
    try {
      if (req.files) {
        // const fileKeys = Object.keys(req.files);
        // const fileNames = [];
        // fileKeys.forEach((file) => {
        //   const date = Date.now();
        //   renameSync(
        //     req.files[file].path,
        //     "uploads/" + date + req.files[file].originalname
        //   );
        //   fileNames.push(date + req.files[file].originalname);
        // });
        const fileNames =req.files.map(file => file.path);
        if (req.query) {
          const {
            title,
            description,
            category,
            features,
            price,
            // revisions,
            time,
            shortDesc,
          } = req.query;
          // const prisma = new PrismaClient();
          const oldData = await prisma.gigs.findUnique({
            where: { id: parseInt(req.params.gigid) },
          });
          await prisma.gigs.update({
            where: { id: parseInt(req.params.gigid) },
            data: {
              title,
              description,
              deliveryTime: parseInt(time),
              category,
              features,
              price: parseInt(price),
              shortDesc,
              // revisions: parseInt(revisions),
              createdBy: { connect: { id: parseInt(req.userId) } },
              images: fileNames,
            },
          });
          // oldData?.images.forEach((image) => {
          //   if (existsSync(`uploads/${image}`)) unlinkSync(`uploads/${image}`);
          // });
            if (oldData?.images?.length > 0) {
        oldData.images.forEach(imageUrl => {
          // Extract public_id from the Cloudinary URL
          const publicId = extractPublicId(imageUrl);
          if (publicId) {
            cloudinary.uploader.destroy(publicId, (error, result) => {
              if (error) console.error("Failed to delete image from Cloudinary:", error);
            });
          }
        });
      }
  
          return res.status(201).send("Successfully Eited the gig.");
        }
      }
      return res.status(400).send("All properties should be required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };

  export const searchGigs = async (req, res, next) => {
    try {
      if (req.query.searchTerm || req.query.category) {
        // const prisma = new PrismaClient();
        // console.log(req.query.searchTerm," ")
        // console.log(req.query.category," ")
        const gigs = await prisma.gigs.findMany(
          createSearchQuery(req.query.searchTerm, req.query.category)
        );
        return res.status(200).json({ gigs });
      }
      return res.status(400).send("Search Term or Category is required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
  
  const createSearchQuery = (searchTerm, category) => {
    const query = {
      where: {
        OR: [],
      },
      include: {
        reviews: {
          include: {
            reviewer: true,
          },
        },
        createdBy: true,
      },
    };
    if (searchTerm) {
      query.where.OR.push({
        title: { contains: searchTerm, mode: "insensitive" },
      });
    }
    if (category) {
      query.where.OR.push({
        category: { contains: category, mode: "insensitive" },
      });
    }
    return query;
  };

  const checkOrder = async (userId, gigId) => {
    try {
      // const prisma = new PrismaClient();
      const hasUserOrderedGig = await prisma.orders.findFirst({
        where: {
          buyerId: parseInt(userId),
          gigId: parseInt(gigId),
          status: "Completed",
        },
      });
      return hasUserOrderedGig;
    } catch (err) {
      console.log(err);
    }
  };

  export const checkGigOrder = async (req, res, next) => {
    try {
      if (req.userId && req.params.gigId) {
        const hasUserOrderedGig = await checkOrder(req.userId, req.params.gigId);
        return res
          .status(200)
          .json({ hasUserOrderedGig: (hasUserOrderedGig) ? true : false });
      }
      return res.status(400).send("userId and gigId is required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };

  export const addReview = async (req, res, next) => {
    console.log(req.body.reviewText)
    try {
      if (req.userId && req.params.gigId) {
        if (await checkOrder(req.userId, req.params.gigId)) {
          // console.log("req.body.reviewText")
          if (req.body.reviewText && req.body.rating) {
            // const prisma = new PrismaClient();
            const newReview = await prisma.reviews.create({
              data: {
                rating: req.body.rating,
                reviewText: req.body.reviewText,
                reviewer: { connect: { id: parseInt(req?.userId) } },
                gig: { connect: { id: parseInt(req.params.gigId) } },
              },
              include: {
                reviewer: true,
              },
            });
            return res.status(201).json({ newReview });
          }
          return res.status(400).send("ReviewText and Rating are required.");
        }
        return res
          .status(400)
          .send("You need to purchase the gig in order to add review.");
      }
      return res.status(400).send("userId and gigId is required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };

  export const adminData = async (req, res, next) => {
    // console.log(req)
    try {
      if (req.userId) {
        // console.log(req.userId)
        const user = await prisma.gigs.findMany({
          select: {
            id:true,
            title: true,
            category: true,
        },});
        // console.log(user.gigs)
        return res.status(200).json({ gigs: user ?? [] });
      }
      return res.status(400).send("UserId of admin should be required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };

  export const deletegig = async (req, res, next) => {
    try {
      if (req.userId) {
        const oldData = await prisma.gigs.findUnique({
            where: { id: parseInt(req.query.gigId) },
          });
        if (oldData?.images?.length > 0) {
        oldData.images.forEach(imageUrl => {
          const publicId = extractPublicId(imageUrl);
          if (publicId) {
            cloudinary.uploader.destroy(publicId, (error, result) => {
              if (error) console.error("Failed to delete image from Cloudinary:", error);
            });
          }
        });
      }
        await prisma.gigs.delete({
          where:{
            id:parseInt(req.query.gigId),
          }
        },);
        return adminData
      }
      return res.status(400).send("UserId should be required.");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
  };
