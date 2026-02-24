// libs imports
import mongoose from "mongoose";

// models import
import Question from "../models/Question.js";
import Event from "../models/Event.js";

export const createQuestion = async (req, res) => {
  try {
    const { eventId, text } = req.body;

    // 1️⃣ Fast-fail validation
    if (!eventId || !text) {
      return res.status(400).json({
        success: false,
        message: "eventId and text are required",
      });
    }

    // 2️⃣ Validate ObjectId format (prevents cast errors)
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid eventId format",
      });
    }

    // 3️⃣ Verify event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // 4️⃣ Verify event is active
    if (!event.isActive) {
      return res.status(403).json({
        success: false,
        message: "Cannot submit question. Event is closed.",
      });
    }

    // 5️⃣ Create question
    const question = await Question.create({
      eventId,
      text,
    });

    return res.status(201).json({
      success: true,
      message: "Question submitted successfully",
      data: question,
    });
  } catch (error) {
    // Mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    console.error("Create Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating question",
    });
  }
};

export const getQuestionsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // 1️⃣ Validate presence
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "eventId parameter is required",
      });
    }

    // 2️⃣ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid eventId format",
      });
    }

    // 3️⃣ Query + Sort (leverages compound index)
    const questions = await Question.find({ eventId })
      .sort({ upvotes: -1 }) // Highest votes first
      .lean(); // Returns plain JS objects (performance optimization)

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("Get Questions By Event Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching questions",
    });
  }
};
