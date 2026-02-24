// libs import
import express from "express";

// controllers import
import {
  createQuestion,
  getQuestionsByEvent,
} from "../controllers/question.controller.js";

// initialize router
const router = express.Router();

// create a question
router.post("/", createQuestion);

// get all questions for an event
router.get("/:eventId", getQuestionsByEvent);

export default router;
