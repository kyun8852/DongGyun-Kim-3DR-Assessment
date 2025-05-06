import Event from "../models/event.js";
import Ticket from "../models/ticket.js";
import logger from "../utils/logger.js";

const isSameYearAndMonth = (date, year, month) => {
  const d = new Date(date);
  return d.getFullYear() === year && d.getMonth() + 1 === month;
};

const calculateMonthlyStats = (monthEvents, tickets) => {
  // If there are no events for the month
  if (monthEvents.length === 0) {
    return {
      nEvents: 0,
      revenue: 0,
      averageTicketsSold: 0,
    };
  }

  // Create a list of event IDs
  const eventIds = monthEvents.map((event) => event._id.toString());

  // Filter tickets that belong to these events
  const relevantTickets = tickets.filter((ticket) =>
    eventIds.includes(ticket.event.toString())
  );

  // Calculate revenue (sum of totalCost of tickets)
  const totalRevenue = relevantTickets.reduce(
    (sum, ticket) => sum + ticket.totalCost,
    0
  );

  // Calculate the number of tickets sold per event
  const eventTicketSales = relevantTickets.reduce((acc, ticket) => {
    const eventId = ticket.event.toString();
    acc[eventId] = (acc[eventId] || 0) + ticket.nTickets;
    return acc;
  }, {});

  // Calculate total tickets sold and total capacity
  const totalTicketsSold = Object.values(eventTicketSales).reduce(
    (sum, count) => sum + count,
    0
  );

  const totalCapacity = monthEvents.reduce(
    (sum, event) => sum + event.capacity,
    0
  );

  // Calculate average ticket sales rate (as a percentage)
  const averageTicketsSold =
    totalCapacity > 0
      ? Math.round((totalTicketsSold / totalCapacity) * 100)
      : 0;

  return {
    nEvents: monthEvents.length,
    revenue: totalRevenue,
    averageTicketsSold,
  };
};

// Controller to return ticket sales statistics for the past 12 months

const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    // Calculate the date 12 months ago from the current date
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    oneYearAgo.setDate(1); // Set to the first day of the month

    logger.info(
      `Calculating statistics from ${oneYearAgo.toISOString()} to ${now.toISOString()}`
    );

    // Retrieve events from the past 12 months
    const events = await Event.find({
      date: { $gte: oneYearAgo, $lte: now },
    });

    // Retrieve all tickets
    const tickets = await Ticket.find();

    // Generate all months from the current month to 12 months ago
    const stats = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;

      // Filter events held in the given month
      const monthEvents = events.filter((event) =>
        isSameYearAndMonth(event.date, year, month)
      );

      // Calculate monthly statistics
      const { nEvents, revenue, averageTicketsSold } = calculateMonthlyStats(
        monthEvents,
        tickets
      );

      // Return the result
      return { year, month, revenue, nEvents, averageTicketsSold };
    });

    logger.info("Ticket sales statistics retrieved successfully");
    res.json(stats);
  } catch (error) {
    logger.error(`Error retrieving statistics: ${error.message}`);
    next(error);
  }
};

export { getStats };
