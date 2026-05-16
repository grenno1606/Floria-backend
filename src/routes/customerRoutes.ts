import { Router } from "express";
import {
  subscribeNewsletter,
  submitContact,
} from "../controllers/customerController";

const router = Router();

router.post("/newsletter", subscribeNewsletter);

router.post("/contact", submitContact);

export default router;
