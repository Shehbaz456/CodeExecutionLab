import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addProblemToPlaylist, createPlaylist, deletePlaylist, getAllListDetails, getPlayListDetails, removeProblemFromPlaylist } from "../controllers/playlist.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createPlaylist);
router.get("/", getAllListDetails);
router.get("/:playlistId", getPlayListDetails);
router.post("/:playlistId/add-problem", addProblemToPlaylist);
router.delete("/:playlistId", deletePlaylist);
router.delete("/:playlistId/remove-problem", removeProblemFromPlaylist);

export default router;