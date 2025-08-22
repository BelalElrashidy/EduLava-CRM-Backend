import express from "express";
import { createLead } from "./lead.controller.js";

const router = express.Router();

// POST /api/lead
router.post("/", createLead);

export default router;
