import { db } from "../libs/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
    getJudge0LanguageId,
    pollBatchResults,
    submitBatch,
} from "../libs/judge0.lib.js";

export const createProblem = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
    } = req.body;

    if (
        !title ||
        !description ||
        !difficulty ||
        !testcases?.length ||
        !referenceSolutions ||
        Object.keys(referenceSolutions).length === 0
    ) {
        throw new ApiError(400, "Missing required fields to create problem");
    }

    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
        const languageId = getJudge0LanguageId(language);

        if (!languageId) {
            throw new ApiError(400, `Language ${language} is not supported`);
        }

        const submissions = testcases.map(({ input, output }) => ({
            source_code: solutionCode,
            language_id: languageId,
            stdin: input,
            expected_output: output,
        }));

        let submissionResults, tokens, results;

        try {
            submissionResults = await submitBatch(submissions);
            tokens = submissionResults.map((res) => res.token);
            results = await pollBatchResults(tokens);
        } catch (err) {
            throw new ApiError(
                500,
                `Judge0 processing failed for ${language}: ${err.message}`
            );
        }

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            console.log("Result-----", result);
            // console.log( `Testcase ${i + 1} and Language ${language} ----- result ${JSON.stringify(result.status.description)}` );
            if (result.status.id !== 3) {
                throw new ApiError(400,`Testcase ${i + 1} failed for language ${language}`);
            }
        }
    }

    const newProblem = await db.problem.create({
        data: {
            title,
            description,
            difficulty,
            tags,
            examples,
            constraints,
            testcases,
            codeSnippets,
            referenceSolutions,
            userId: req.user.id,
        },
    });

    return res.status(201).json(new ApiResponse(201, newProblem, "Problem created successfully"));
});

export const getAllProblems = asyncHandler((req, res) => {});

export const getProblemById = asyncHandler((req, res) => {});

export const updateProblem = asyncHandler((req, res) => {});

export const deleteProblem = asyncHandler((req, res) => {});

export const getAllProblemsSolvedByUser = asyncHandler((req, res) => {});
