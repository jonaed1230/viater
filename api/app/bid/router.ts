import { Router } from 'express';
import { createBid, getBids, acceptBid } from './bidController';

const router = Router();

router.post("/create", createBid);
router.post("/accept", acceptBid);
router.get("/get-bids", getBids);

export default router;