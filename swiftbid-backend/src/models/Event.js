import mongoose from "mongoose";

const { Schema, model } = mongoose;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    joinCode: {
      type: String,
      required: [true, "Join code is required"],
      unique: true,
      trim: true,
      uppercase: true, 
      minlength: [4, "Join code must be at least 4 characters"],
      maxlength: [12, "Join code cannot exceed 12 characters"],
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  },
);

eventSchema.post("save", function (error, doc, next) {
  if (error?.code === 11000) {
    next(new Error("Join code must be unique"));
  } else {
    next(error);
  }
});

const Event = model("Event", eventSchema);

export default Event;
