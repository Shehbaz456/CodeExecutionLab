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
                throw new ApiError(
                    400,
                    `Testcase ${i + 1} failed for language ${language}`
                );
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

    return res
        .status(201)
        .json(new ApiResponse(201, newProblem, "Problem created successfully"));
});

export const getAllProblems = asyncHandler(async (req, res) => {
    const problems = await db.problem.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            difficulty: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!problems || problems.length === 0) {
        throw new ApiError(404, "No problems found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, problems, "Problems fetched successfully"));
});

export const getProblemById = asyncHandler(async (req, res) => {
    const { problemId } = req.params;

    const problem = await db.problem.findUnique({
        where: { problemId },
    });

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    return res.status(200).json(new ApiResponse(200, problem, "Problem fetched successfully"));
});


export const updateProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const {
        title,description,difficulty,tags,examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
    } = req.body;

    
    const existingProblem = await db.problem.findUnique({
        where: { id: problemId },
    });
    
    if (!existingProblem) {
        throw new ApiError(404, "Problem not found");
    }
    // 2. Use fallback values if fields not provided
    const updatedFields = {
        title: title ?? existingProblem.title,
        description: description ?? existingProblem.description,
        difficulty: difficulty ?? existingProblem.difficulty,
        tags: tags ?? existingProblem.tags,
        examples: examples ?? existingProblem.examples,
        constraints: constraints ?? existingProblem.constraints,
        testcases: testcases ?? existingProblem.testcases,
        codeSnippets: codeSnippets ?? existingProblem.codeSnippets,
        referenceSolutions: referenceSolutions ?? existingProblem.referenceSolutions,
    };

    // 3. Validate required fields
    if (
        !updatedFields.title ||
        !updatedFields.description ||
        !updatedFields.difficulty ||
        !updatedFields.testcases?.length ||
        !updatedFields.referenceSolutions ||
        Object.keys(updatedFields.referenceSolutions).length === 0
    ) {
        throw new ApiError(400, "Missing required fields to update problem");
    }

    // 4. Judge0 Validation if referenceSolutions or testcases changed
    if (referenceSolutions || testcases) {
        for (const [language, solutionCode] of Object.entries(
            updatedFields.referenceSolutions
        )) {
            const languageId = getJudge0LanguageId(language);

            if (!languageId) {
                throw new ApiError(400,`Language ${language} is not supported`);
            }

            const submissions = updatedFields.testcases.map(
                ({ input, output }) => ({
                    source_code: solutionCode,
                    language_id: languageId,
                    stdin: input,
                    expected_output: output,
                })
            );

            try {
                const submissionResults = await submitBatch(submissions);
                const tokens = submissionResults.map((res) => res.token);
                const results = await pollBatchResults(tokens);

                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    if (result.status.id !== 3) {
                        throw new ApiError(400,`Testcase ${i + 1} failed for language ${language}`);
                    }
                }
            } catch (err) {
                throw new ApiError(500,`Judge0 processing failed for ${language}: ${err.message}`);
            }
        }
    }
    
    // 5. Update problem
    const updatedProblem = await db.problem.update({
        where: { id: problemId },
        data: updatedFields,
    });

    return res.status(200).json( new ApiResponse(200, updatedProblem, "Problem updated successfully") );
});

export const deleteProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;

    // Check if problem exists
    const problem = await db.problem.findUnique({ where: { problemId } });
    if (!problem) throw new ApiError(404, "Problem not found");

    await db.problem.delete({
        where: { problemId },
    });

    return res.status(200).json(new ApiResponse(200, null, "Problem deleted successfully"));
});

export const getAllProblemsSolvedByUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User ID is missing");
  }

  const problems = await db.problem.findMany({
    where: {
      solvedBy: {
        some: {
          userId,
        },
      },
    },
    include: {
      solvedBy: {
        where: {
          userId,
        },
      },
    },
  });

  return res.status(200).json(new ApiResponse(200, { problems },"Problems fetched successfully" ));
});