import { Router } from "express";

import { createTrip } from "./tripController";

const router = Router();

router.post("/create", createTrip);

export default router;