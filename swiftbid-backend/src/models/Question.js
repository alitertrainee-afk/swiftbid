// libs import
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const questionSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      minlength: [3, "Question must be at least 3 characters"],
      maxlength: [1000, "Question cannot exceed 1000 characters"],
    },

    upvotes: {
      type: Number,
      default: 0,
      min: [0, "Upvotes cannot be negative"],
    },

    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

questionSchema.index({ eventId: 1, upvotes: -1 });

const Question = model("Question", questionSchema);

export default Question;
