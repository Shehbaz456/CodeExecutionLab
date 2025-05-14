import { db } from "../libs/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


// Create a new playlist
export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?.id;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const existingPlaylist = await db.playlist.findFirst({
    where: {
      name,
      userId,
    },
  });

  if (existingPlaylist) {
    throw new ApiError(409, "A playlist with this name already exists");
  }

  const playList = await db.playlist.create({
    data: {
      name,
      description,
      userId,
    },
  });

  return res.status(201).json(
    new ApiResponse(201, { playList }, "Playlist created successfully")
  );
});


export const getAllListDetails = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const playlists = await db.playlist.findMany({
    where: {
      userId,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });

  return res.status(200).json(
    new ApiResponse(200, { playlists }, "Playlists fetched successfully")
  );
});


export const getPlayListDetails = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user?.id;

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required");
  }

  const playlist = await db.playlist.findUnique({
    where: {
      id: playlistId,
      userId,
    },
    include: {
      problems: {
        include: {
          problem: true, // Optionally use select to limit fields
        },
      },
    },
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { playlist }, "Playlist fetched successfully")
  );
});


export const addProblemToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required");
  }

  if (!Array.isArray(problemIds) || problemIds.length === 0) {
    throw new ApiError(400, "Invalid or missing problemIds");
  }

  const data = problemIds.map((problemId) => ({
    playListId: playlistId,
    problemId,
  }));
  const response = await db.problemInPlaylist.createMany({ data }); 

  res.status(201).json(
    new ApiResponse(201, response, "Problems added to playlist successfully")
  );
});


export const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required");
  }

  const existing = await db.playlist.findUnique({
    where: { id: playlistId },
  });

  if (!existing) {
    throw new ApiError(404, "Playlist not found");
  }

  const deletedPlaylist = await db.playlist.delete({
    where: { id: playlistId },
  });

  res.status(200).json(
    new ApiResponse(200, { deletedPlaylist }, "Playlist deleted successfully")
  );
});


export const removeProblemFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required");
  }

  if (!Array.isArray(problemIds) || problemIds.length === 0) {
    throw new ApiError(400, "Invalid or missing problemIds");
  }

  const deletedProblem = await db.problemsInPlaylist.deleteMany({
    where: {
      playlistId,
      problemId: {
        in: problemIds,
      },
    },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { deletedCount: deletedProblem.count },
      "Problems removed from playlist successfully"
    )
  );
});