
import express from "express";
import {
  askResearchAssistant,
} from "../controllers/aiResearchController.js";

const router = express.Router();

// POST /api/ai-research
router.post("/", askResearchAssistant);

export default router;
