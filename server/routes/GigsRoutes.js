import multer from "multer";
import { verifyToken, verifyAdmin} from "../middlewares/AuthMiddleware.js";
import { addGig, addReview, checkGigOrder, editGig, getGigData, getUserAuthGigs, searchGigs, adminData, deletegig } from "../controllers/GigsControllers.js";
import { Router } from "express";
import { storage } from "../cloudinaryConfig.js";

export const gigsRoutes=Router()
const upload = multer({ storage });

gigsRoutes.post("/add", verifyToken, upload.array("images"), addGig);
gigsRoutes.get("/get-user-gigs", verifyToken, getUserAuthGigs);
gigsRoutes.get("/get-gig-data/:gigid", getGigData);
// gigsRoutes.get("/set-gig-data", getGigData);
gigsRoutes.put("/edit-gig/:gigid", verifyToken,upload.array("images"),editGig);
gigsRoutes.get("/search-gigs",searchGigs)
gigsRoutes.get("/check-gig-order/:gigId",verifyToken,checkGigOrder)
gigsRoutes.post("/add-review/:gigId",verifyToken,addReview)
gigsRoutes.get("/get-all-gig-data/", verifyAdmin ,adminData);
gigsRoutes.get("/delete-gig/", verifyAdmin ,deletegig);
// gigRoutes.post("/add-review/:gigId",verifyToken,addReview);
