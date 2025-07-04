import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
    createProblem,
    deleteProblem,
    getAllProblems,
    getAllProblemsSolvedByUser,
    getProblemById,
    updateProblem,
} from "../controllers/problem.controller.js";

const router = express.Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Admin-only routes
router.post("/create-problem", checkAdmin, createProblem);
router.put("/update-problem/:problemId", checkAdmin, updateProblem);
router.delete("/delete-problem/:problemId", checkAdmin, deleteProblem);

// Public (authenticated) routes
router.get("/get-all-problems", getAllProblems);
router.get("/get-problem/:problemId", getProblemById);
router.get("/get-solved-problems", getAllProblemsSolvedByUser);

export default router;
