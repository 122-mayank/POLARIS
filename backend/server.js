import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import expeditionRoutes from "./routes/expeditionRoutes.js";
import researchRoutes from "./routes/researchRoutes.js";
import aiResearchRoutes from "./routes/aiResearchRoutes.js";
import 'dotenv/config';

await connectDB();

const app = express();

app.use(express.json());

app.use(cors({
  origin: "https://polaris-frontend.onrender.com"
}));


app.use("/api/expeditions",expeditionRoutes);

app.use("/api/research", researchRoutes);

app.use("/api/ai-research", aiResearchRoutes);

app.get("/",(req, res)=>{
   res.send("Polaris project would start")
});

const PORT = process.env.PORT;
app.listen(PORT , ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});

