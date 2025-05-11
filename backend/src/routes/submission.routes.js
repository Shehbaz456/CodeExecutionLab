import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getAllSubmission, getAllTheSubmissionsForProblem, getSubmissionsForProblem } from "../controllers/submission.controller.js";


const router = express.Router()

// Apply authMiddleware to all routes
router.use(authMiddleware);

router.get("/get-all-submissions" , getAllSubmission);
router.get("/get-submission/:problemId" , getSubmissionsForProblem)
router.get("/get-submissions-count/:problemId" , getAllTheSubmissionsForProblem)

export default router;