import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { executeCode } from "../controllers/executeCode.controller.js";

const router = express.Router();

router.post("/" , authMiddleware , executeCode)

export default router;