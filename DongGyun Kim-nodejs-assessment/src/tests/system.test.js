import mongoose from "mongoose";
import request from "supertest";
import express from "express";
import connectDB from "../models/db.js";
import Event from "../models/event.js";
import Ticket from "../models/ticket.js";
import { addEvent } from "../controllers/eventController.js";
import { addTicketTransaction } from "../controllers/ticketController.js";
import { getStats } from "../controllers/statsController.js"; //
import { apiTestData } from "./systemTestData.js";

const { events, tickets, pastEvent, pastTicket, currentEvent, currentTicket } =
  apiTestData;

const app = express();
app.use(express.json());
app.post("/events", addEvent);
app.post("/tickets", addTicketTransaction);
app.get("/stats", getStats);

// Error handler middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message });
});

const TEST_DB_URL = process.env.DB_URL || "mongodb://localhost:27017/ticketing";

/**
 * Helper functions for common test operations
 */
const createTestEvent = async (eventData) => {
  const response = await request(app).post("/events").send(eventData);
  return response;
};

const createTestTicket = async (ticketData) => {
  const response = await request(app).post("/tickets").send(ticketData);
  return response;
};

const setupPastEventWithTickets = async () => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // Create past event
  const pastEventObj = new Event({
    ...pastEvent,
    date: threeMonthsAgo,
  });
  await pastEventObj.save();

  // Create past ticket transaction
  const pastTicketObj = new Ticket({
    ...pastTicket,
    event: pastEventObj._id,
    transactionDate: threeMonthsAgo,
  });
  await pastTicketObj.save();

  return { pastEventObj, pastTicketObj, threeMonthsAgo };
};

const setupCurrentEventWithTickets = async () => {
  const currentDate = new Date();

  // Create current event
  const currentEventObj = new Event({
    ...currentEvent,
    date: currentDate,
  });
  await currentEventObj.save();

  // Create current ticket transaction
  const currentTicketObj = new Ticket({
    ...currentTicket,
    event: currentEventObj._id,
    transactionDate: currentDate,
  });
  await currentTicketObj.save();

  return { currentEventObj, currentTicketObj, currentDate };
};

describe("Event Controller Tests", () => {
  beforeAll(async () => {
    await connectDB(TEST_DB_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Event.deleteMany({});
    await Ticket.deleteMany({});
  });

  // 1. Event Creation Tests
  describe("POST /events - create event", () => {
    test("should create an event successfully", async () => {
      const response = await createTestEvent(events.valid);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("eventId");

      const savedEvent = await Event.findById(response.body.eventId);
      expect(savedEvent).not.toBeNull();
      expect(savedEvent.name).toBe(events.valid.name);
      expect(savedEvent.capacity).toBe(events.valid.capacity);
      expect(savedEvent.costPerTicket).toBe(events.valid.costPerTicket);
      expect(savedEvent.ticketsSold).toBe(0);
    });

    test("should return 400 when capacity is not a positive integer", async () => {
      // Test with negative capacity
      const negResponse = await createTestEvent(events.invalidCapacity);
      expect(negResponse.status).toBe(400);
      expect(negResponse.body.error).toContain(
        "Capacity must be a positive integer"
      );

      // Test with decimal capacity
      const floatResponse = await createTestEvent(events.floatCapacity);
      expect(floatResponse.status).toBe(400);
      expect(floatResponse.body.error).toContain(
        "Capacity must be a positive integer"
      );
    });

    test("should return 400 when costPerTicket is not a non-negative number", async () => {
      // Test with negative cost
      const negResponse = await createTestEvent(events.invalidCost);
      expect(negResponse.status).toBe(400);
      expect(negResponse.body.error).toContain(
        "Cost per ticket must be a non-negative number"
      );

      // Test with non-numeric cost
      const stringResponse = await createTestEvent(events.stringCost);
      expect(stringResponse.status).toBe(400);
      expect(stringResponse.body.error).toContain(
        "Cost per ticket must be a non-negative number"
      );
    });

    test("should accept zero cost for free events", async () => {
      const response = await createTestEvent(events.freeEvent);
      expect(response.status).toBe(201);
      const savedEvent = await Event.findById(response.body.eventId);
      expect(savedEvent).not.toBeNull();
      expect(savedEvent.costPerTicket).toBe(0);
    });

    test("should return 400 when creating an event on the same date", async () => {
      // Create first event
      await createTestEvent(events.firstEvent);

      // Attempt to create second event on the same date
      const response = await createTestEvent(events.secondEvent);
      expect(response.status).toBe(400);
      expect(response.body.error).toContain("already exists on this date");
    });

    test("should return 400 for invalid date format", async () => {
      const response = await createTestEvent(events.invalidDate);
      expect(response.status).toBe(400);
      expect(response.body.error).toContain(
        "Date must be in DD/MM/YYYY format"
      );
    });

    test("should return 400 when missing required fields", async () => {
      const response = await createTestEvent(events.incomplete);
      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Missing required fields");
    });
  });

  // 2. Ticket Purchase Tests
  describe("POST /tickets - ticket purchase", () => {
    test("should add ticket transaction successfully", async () => {
      // Create an event
      const eventResponse = await createTestEvent(events.concert);
      const eventId = eventResponse.body.eventId;

      // Purchase tickets
      const ticketData = {
        event: eventId,
        nTickets: tickets.standard.nTickets,
      };
      const ticketResponse = await createTestTicket(ticketData);
      expect(ticketResponse.status).toBe(201);
      expect(ticketResponse.body).toHaveProperty("ticketId");

      // Verify transaction data
      const transaction = await Ticket.findById(ticketResponse.body.ticketId);
      expect(transaction).not.toBeNull();
      expect(transaction.nTickets).toBe(tickets.standard.nTickets);
      expect(transaction.totalCost).toBe(
        tickets.standard.nTickets * events.concert.costPerTicket
      );

      // Verify event was updated with tickets sold
      const updatedEvent = await Event.findById(eventId);
      expect(updatedEvent.ticketsSold).toBe(tickets.standard.nTickets);
    });

    test("should return 400 when purchasing tickets beyond capacity", async () => {
      // Create event with limited capacity
      const eventResponse = await createTestEvent(events.smallEvent);
      const eventId = eventResponse.body.eventId;

      // Attempt to purchase more tickets than capacity
      const ticketData = {
        event: eventId,
        nTickets: tickets.exceedCapacity.nTickets,
      };
      const response = await createTestTicket(ticketData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("exceed");
    });

    test("should return 404 when purchasing tickets for non-existent event", async () => {
      // Create ticket request with valid but non-existent event ID
      const nonExistentId = new mongoose.Types.ObjectId();
      const ticketData = {
        event: nonExistentId,
        nTickets: tickets.standard.nTickets,
      };

      const response = await createTestTicket(ticketData);
      expect(response.status).toBe(404);
      expect(response.body.error).toContain("not found");
    });
  });

  // 3. Ticket Statistics Tests
  describe("GET /stats - ticket sales statistics", () => {
    test("should retrieve correct ticket sales statistics", async () => {
      // Setup test data for past and current events
      const { threeMonthsAgo } = await setupPastEventWithTickets();
      const { currentDate } = await setupCurrentEventWithTickets();

      // Fetch statistics
      const response = await request(app).get("/stats");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      // Verify past month statistics
      const pastMonthStats = response.body.find(
        (s) =>
          s.year === threeMonthsAgo.getFullYear() &&
          s.month === threeMonthsAgo.getMonth() + 1
      );
      expect(pastMonthStats).toBeDefined();
      expect(pastMonthStats.revenue).toBe(pastTicket.totalCost);
      expect(pastMonthStats.nEvents).toBe(1);
      expect(pastMonthStats.averageTicketsSold).toBe(
        (pastEvent.ticketsSold / pastEvent.capacity) * 100
      );

      // Verify current month statistics
      const currentMonthStats = response.body.find(
        (s) =>
          s.year === currentDate.getFullYear() &&
          s.month === currentDate.getMonth() + 1
      );
      expect(currentMonthStats).toBeDefined();
      expect(currentMonthStats.revenue).toBe(currentTicket.totalCost);
      expect(currentMonthStats.nEvents).toBe(1);
      expect(currentMonthStats.averageTicketsSold).toBe(
        (currentEvent.ticketsSold / currentEvent.capacity) * 100
      );
    });

    test("should return empty statistics for months with no events", async () => {
      // Get statistics without creating any events
      const response = await request(app).get("/stats");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Verify current month has empty statistics
      const currentDate = new Date();
      const currentMonthStats = response.body.find(
        (s) =>
          s.year === currentDate.getFullYear() &&
          s.month === currentDate.getMonth() + 1
      );
      expect(currentMonthStats).toBeDefined();
      expect(currentMonthStats.revenue).toBe(0);
      expect(currentMonthStats.nEvents).toBe(0);
      expect(currentMonthStats.averageTicketsSold).toBe(0);
    });
  });
});
