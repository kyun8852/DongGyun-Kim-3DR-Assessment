import mongoose from "mongoose";
import { Schema } from "mongoose";
const ticketSchema = new mongoose.Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  nTickets: {
    type: Number,
    required: true,
    min: 1,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Ticket", ticketSchema);
