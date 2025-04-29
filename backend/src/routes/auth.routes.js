import express from "express";
import { registerUser,loginUser,logoutUser } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/register",upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]) , registerUser)

router.post("/login",loginUser);  

// Protected Routes
router.get("/logout",authMiddleware,logoutUser);  


export default router;