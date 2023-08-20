import { Router } from 'express';
import { createOrder, updateOrder, deleteOrder, getOrder, getOrders } from './orderController';

const router = Router();

router.post("/create", createOrder);
router.post("/update", updateOrder);
router.post("/delete", deleteOrder);
router.get("/get-order", getOrder);
router.get("/get-orders", getOrders);

export default router;