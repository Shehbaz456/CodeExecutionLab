import { db } from "../libs/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const getAllSubmission = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized: User ID missing");
    }

    const submissions = await db.submission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }, // show most recent first
    });

    if (!submissions.length) {
        throw new ApiError(404, "No submissions found for this user");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                submissions,
                "Submissions fetched successfully"
            )
        );
});

export const getSubmissionsForProblem = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const problemId = req.params.problemId;

    if (!userId) {
        throw new ApiError(401, "Unauthorized: User not authenticated");
    }
    if (!problemId) {
        throw new ApiError(400, "Problem ID is required");
    }

    const submissions = await db.submission.findMany({
        where: {
            userId,
            problemId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!submissions.length) {
        throw new ApiError(404, "No submissions found for this problem");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                submissions,
                "Submissions fetched successfully for the given problem"
            )
        );
});

export const getAllTheSubmissionsForProblem = asyncHandler(async (req, res) => {
    const problemId = req.params.problemId;

    if (!problemId) {
        throw new ApiError(400, "Problem ID is required");
    }

    const submissionCount = await db.submission.count({
        where: {
            problemId,
        },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,{ count: submissionCount },"Submissions fetched successfully for the given problem"
            )
        );
});
