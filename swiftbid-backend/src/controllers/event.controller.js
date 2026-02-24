// models import
import Event from "../models/Event.js";

// redis import
import redisClient from "../config/redisClient.js";

// Cache TTL in seconds
const EVENT_CACHE_TTL = 60;

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

export const getEventByJoinCode = async (req, res) => {
  try {
    const { joinCode } = req.params;

    if (!joinCode) {
      return res.status(400).json({
        success: false,
        message: "Join code parameter is required",
      });
    }

    // Normalize input to match schema behavior
    const normalizedCode = joinCode.trim().toUpperCase();

    // 1️⃣ Check Redis cache first
    const cacheKey = `event:${normalizedCode}`;
    const cachedEvent = await redisClient.get(cacheKey);

    if (cachedEvent) {
      // 🎯 Cache Hit — skip MongoDB entirely
      const event = JSON.parse(cachedEvent);

      return res.status(200).json({
        success: true,
        message: "Event found (cached)",
        data: event,
      });
    }

    // 2️⃣ Cache Miss — query MongoDB
    const event = await Event.findOne({ joinCode: normalizedCode });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!event.isActive) {
      return res.status(403).json({
        success: false,
        message: "This event is closed",
      });
    }

    // 3️⃣ Store in Redis with a 60-second TTL
    await redisClient.setEx(cacheKey, EVENT_CACHE_TTL, JSON.stringify(event));

    return res.status(200).json({
      success: true,
      message: "Event found",
      data: event,
    });
  } catch (error) {
    console.error("Get Event By Join Code Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching event",
    });
  }
};
