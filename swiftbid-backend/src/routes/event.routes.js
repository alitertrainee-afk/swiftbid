// libs imports
import express from "express";

// controllers import
import { createEvent } from "../controllers/event.controller.js";

// initialize router
const router = express.Router();

// create an event
router.post("/", createEvent);

export default router;
