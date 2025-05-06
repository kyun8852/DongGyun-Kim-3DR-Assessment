import express from "express";
const router = express.Router();
import { addTicketTransaction } from "../controllers/ticketController.js";

router.post("/", addTicketTransaction);

export default router;
