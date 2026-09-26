import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDb from "./config/db.js";

import 'dotenv/config';

await connectDb();

const app = express();

app.get("/",(req, res)=>{
   res.send("Polaris project would start")
});

const PORT = process.env.PORT;
app.listen(PORT , ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});

