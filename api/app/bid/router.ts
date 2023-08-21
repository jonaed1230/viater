import { Router } from 'express';
import { createBid } from './bidController';

const router = Router();

router.post("/create", createBid);

export default router;