import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true, unique: true },
  capacity: { type: Number, required: true, min: 1 },
  costPerTicket: { type: Number, required: true, min: 0 },
  ticketsSold: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Event", eventSchema);
