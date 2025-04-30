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

router.post("/create-problem", authMiddleware, checkAdmin, createProblem);

router.get("/get-all-problems", authMiddleware, getAllProblems);

router.get("/get-problem/:id", authMiddleware, getProblemById);

router.put("/update-problem/:id", authMiddleware, checkAdmin, updateProblem);

router.delete("/delete-problem/:id", authMiddleware, checkAdmin, deleteProblem);

router.get("/get-solved-problems", authMiddleware, getAllProblemsSolvedByUser);

export default router;
