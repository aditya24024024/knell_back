// import { Prisma , PrismaClient } from "@prisma/client";
import prisma from "../Prisma_client.js";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
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

const maxAge = 3 * 24 * 60 * 60*1000;

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.create({
      data: {
        email,
        password
      },
    });

      const token=createToken(email, user.id);
      
      res.cookie('jwt', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  path: '/',
  maxAge: 3 * 24 * 60 * 60 * 1000
});

      
    return res.status(200).json({
    user: { id: user.id, email: user.email },
    jwt: token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal server error.");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if(email && password ){
      const user = await prisma.user.findUnique({
        where : {email},
      });

      if (!user) {
      return res.status(404).send("User not found.");
      }
      const auth = await compare(password, user.password);
      if (!auth) {
        return res.status(400).send("Invalid password.");
      }

      const token = createToken(email, user.id);

      res.cookie('jwt', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  path: '/',
  maxAge: 3 * 24 * 60 * 60 * 1000
});
    
      return res.status(200).json({
      user: { id: user.id, email: user.email },
      });
    }
    return res.status(400).send("email password requied.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal server error.");
  }
};

export const getUserInfo=async (req,res,next)=>{
  try {
    if (req?.userId) {
      const user = await prisma.user.findUnique({
        where: {
          id: req.userId,
        },
      });
      return res.status(200).json({
        user: {
          id: user?.id,
          email: user?.email,
          image: user?.profileImage,
          username: user?.username,
          fullName: user?.fullName,
          description: user?.description,
          isProfileSet: user?.isProfileInfoSet,
        },
      });
    }
  } catch (err) {
    res.status(500).send("Internal Server Occured");
  }
}

export const setUserInfo = async (req, res, next) => {
  try {
    if (req?.userId) {
      const { username, fullName, description } = req.body;
      if (username && fullName && description) {
        const usernameValid = await prisma.user.findUnique({
          where: { username: username },
        });
        if (usernameValid) {
          return res.status(200).json({ usernameError: true });
        }
        await prisma.user.update({
          where: { id: req.userId },
          data: {
            username,
            fullName,
            description,
            isProfileInfoSet: true,
          },
        });
        return res.status(200).send("Profile data updated successfully.");
      } else {
        return res
          .status(400)
          .send("Username, Full Name and description should be included.");
      }
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(400).json({ usernameError: true });
      }
    } else {
      return res.status(500).send("Internal Server Error");
    }
    throw err;
  }
};

export const setUserImage = async (req, res, next) => {
  try {
    if (req.file) {
      if (req?.userId) {
        const fileName = req.file.path;
        const oldData = await prisma.user.findUnique({
            where: { id: req.userId },
          });
        if (oldData?.profileImage?.length > 0) {
        const imageUrl = oldData.profileImage;
const publicId = extractPublicId(imageUrl);

if (publicId) {
  cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      console.error("Failed to delete image from Cloudinary:", error);
    } else {
      console.log("Deleted from Cloudinary:", result);
    }
  });
}
      }
        await prisma.user.update({
          where: { id: req.userId },
          data: { profileImage: fileName },
        });
        return res.status(200).json({ img: fileName });
      }
      return res.status(400).send("Cookie Error.");
    }
    return res.status(400).send("Image not inclued.");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Occured");
  }
};

export const logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};
