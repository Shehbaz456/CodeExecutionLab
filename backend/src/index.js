import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
dotenv.config();
const app = express()
const PORT = process.env.PORT || 8000

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

// home route
app.get("/" , (req , res)=>{
    res.send("Hello Guys welcome to Code Execution Lab🔥");
})

app.use("/api/v1/auth",authRoutes);

app.listen(process.env.PORT,()=>{
    console.log(`Server is Running on port ${PORT}`);  
})


