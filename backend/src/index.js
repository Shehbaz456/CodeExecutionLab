import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";


import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import executionRoute from "./routes/executeCode.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req, res) => {
    res.send("Hello Guys welcome to Code Execution Lab🔥");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code" , executionRoute)

console.log("JUDGE0_API_URL:",process.env.JUDGE0_API_URL);
app.listen(process.env.PORT, () => {
    console.log(`Server is Running on port ${PORT}`);
});
