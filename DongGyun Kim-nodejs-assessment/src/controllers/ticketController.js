import Event from "../models/event.js";
import Ticket from "../models/ticket.js";
import { createError } from "../utils/customError.js";
import logger from "../utils/logger.js";

const addTicketTransaction = async (req, res, next) => {
  try {
    const { event, nTickets } = req.body;

    // Validate input data
    if (!event || !nTickets || nTickets < 1) {
      throw createError(
        "Invalid input. Event ID and number of tickets (min 1) are required",
        400
      );
    }

    // Retrieve event data
    const eventData = await Event.findById(event);
    if (!eventData) {
      throw createError("Event not found", 404);
    }

    // Check ticket availability
    const newTicketsSold = eventData.ticketsSold + nTickets;
    if (newTicketsSold > eventData.capacity) {
      throw createError("Event sold out or capacity exceeded", 400);
    }

    // Calculate total cost
    const totalCost = eventData.costPerTicket * nTickets;

    // Create and save ticket
    const ticket = new Ticket({
      event,
      nTickets,
      totalCost,
    });
    await ticket.save();

    // Update number of tickets sold for the event
    eventData.ticketsSold = newTicketsSold;
    await eventData.save();

    // Logging and response
    logger.info(
      `Ticket transaction recorded for event: ${event}, ${nTickets} tickets, total cost: ${totalCost}`
    );
    res.status(201).json({
      message: "Ticket transaction recorded successfully",
      ticketId: ticket._id,
      event: eventData.name,
      tickets: nTickets,
      totalCost: totalCost,
      remainingCapacity: eventData.capacity - newTicketsSold,
    });
  } catch (error) {
    next(error);
  }
};

export { addTicketTransaction };
