// models import
import Event from "../models/Event.js";

export const createEvent = async (req, res) => {
  try {
    const { title, joinCode, isActive } = req.body;

    // Basic request-level validation (fast-fail before hitting DB)
    if (!title || !joinCode) {
      return res.status(400).json({
        success: false,
        message: "Title and joinCode are required",
      });
    }

    const event = await Event.create({
      title,
      joinCode,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Join code already exists",
      });
    }

    console.error("Create Event Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating event",
    });
  }
};
