// libs imports
import express from "express";

// controllers import
import {
  createEvent,
  getEventByJoinCode,
} from "../controllers/event.controller.js";

// initialize router
const router = express.Router();

// create an event
router.post("/", createEvent);

// get an event by join code
router.get("/:joinCode", getEventByJoinCode);

export default router;
