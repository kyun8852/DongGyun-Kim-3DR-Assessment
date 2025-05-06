import { createError } from "../utils/customError.js";
import Event from "../models/event.js";
import isValidDate from "../utils/isValidDate.js";
import convertToISODate from "../utils/convertToISODate.js";

const addEvent = async (req, res, next) => {
  try {
    const { name, date, capacity, costPerTicket } = req.body;
    // Check if all required fields are present
    if (
      !name ||
      !date ||
      capacity === undefined ||
      costPerTicket === undefined
    ) {
      throw createError("Missing required fields", 400);
    }
    // Check if the date is in the correct format and is a valid date
    if (!isValidDate(date)) {
      throw createError(
        "Invalid date format or value. Date must be in DD/MM/YYYY format and be a valid date",
        400
      );
    }
    // Validate capacity - must be a positive integer
    const capacityNum = Number(capacity);
    if (!Number.isInteger(capacityNum) || capacityNum < 0) {
      throw createError("Capacity must be a positive integer", 400);
    }

    // Validate costPerTicket - must be a positive number
    const costNum = Number(costPerTicket);
    if (isNaN(costNum) || costNum < 0) {
      throw createError("Cost per ticket must be a non-negative number", 400);
    }

    const isoDateString = convertToISODate(date);
    const eventDate = new Date(isoDateString);

    const event = new Event({ name, date: eventDate, capacity, costPerTicket });
    await event.save();
    res.status(201).json({ eventId: event._id });
  } catch (error) {
    const errorMap = {
      11000: "An event already exists on this date",
      ValidationError: "Invalid data provided",
      CastError: "Invalid data type provided",
    };

    const errorMessage =
      errorMap[error.code] ||
      errorMap[error.name] ||
      error.message ||
      "An unexpected error occurred";

    error = createError(errorMessage, error.status || 400);
    next(error);
  }
};

export { addEvent };
