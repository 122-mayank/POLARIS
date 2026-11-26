import express from "express";

import {
  createExpedition,
  getAllExpeditions,
  getExpeditionById,
  updateExpedition,
  deleteExpedition
} from "../controllers/expeditionController.js";

const router = express.Router();


// CREATE
router.post("/", createExpedition);

// GET ALL
router.get("/", getAllExpeditions);

// GET ONE
router.get("/:id", getExpeditionById);

// UPDATE
router.put("/:id", updateExpedition);

// DELETE
router.delete("/:id", deleteExpedition);


export default router;