import { Router } from 'express';
import userRouter from './user/router';
import orderRouter from './order/router';

const router = Router();
router.get('/', (req, res) => {
  res.send('Welcome to viater API route');
});
router.use('/user', userRouter);
router.use('/order', orderRouter);

export default router;
