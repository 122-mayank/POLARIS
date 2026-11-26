import mongoose from "mongoose";

const expeditionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    year: {
      type: Number,
      required: true
    },

    region: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    researchers: [
      {
        type: String
      }
    ],

    stations: [
      {
        type: String
      }
    ],

    startDate: {
      type: Date
    },

    endDate: {
      type: Date
    },

    status: {
      type: String,
      enum: ["planned", "ongoing", "completed"],
      default: "planned"
    }
  },
  {
    timestamps: true
  }
);

const Expedition = mongoose.model("Expedition", expeditionSchema);

export default Expedition;