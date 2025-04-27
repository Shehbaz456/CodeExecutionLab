import express from "express";
import dotenv from "dotenv";

dotenv.config();

import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
// import problemRoutes from "./routes/problem.routes.js";

const app = express()
const PORT = process.env.PORT || 8000


app.use(express.json());
app.use(cookieParser());

app.get("/" , (req , res)=>{
    res.send("Hello Guys welcome to leetlab🔥");
})

app.use("/api/v1/auth" , authRoutes);
// app.use("/api/v1/problems" , problemRoutes)

app.listen(process.env.PORT,()=>{
    console.log(`Server is Running on port ${PORT}`);  
})


