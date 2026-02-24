// libs import
import express from "express";

// controllers import
import {
  createQuestion,
  getQuestionsByEvent,
  upvoteQuestion,
} from "../controllers/question.controller.js";

// initialize router
const router = express.Router();

// create a question
router.post("/", createQuestion);

// get all questions for an event
router.get("/:eventId", getQuestionsByEvent);

// upvote a question
router.put("/:questionId/upvote", upvoteQuestion);

export default router;
