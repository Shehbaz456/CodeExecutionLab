import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const executeCode = asyncHandler(async (req, res) => {
  
    const { source_code, language_id, stdin, expected_outputs, problemId } =
      req.body;

    const userId = req.user?.id;

    // Validate input and output arrays
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      throw new ApiError(400, "Invalid or missing test cases");
    }
  
    // Prepare each test case for Judge0 batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));
  
    // Submit code to Judge0
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((res) => res.token);
  
    // Poll Judge0 for results
    const results = await pollBatchResults(tokens);

    console.log('Result-------------')
    console.log(results);

    res.status(200).json({
        message:"Code Executed!"
    })

});