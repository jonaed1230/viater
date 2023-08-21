import { Router } from 'express';
import { createBid, getBids } from './bidController';

const router = Router();

router.post("/create", createBid);
router.get("/get-bids", getBids);

export default router;