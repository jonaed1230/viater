import { Router } from 'express';
import userRouter from './user/router';
import orderRouter from './order/router';
import bidRouter from './bid/router';
import tripRouter from './trip/router';

const router = Router();
router.get('/', (req, res) => {
  res.send('Welcome to viater API route');
});
router.use('/user', userRouter);
router.use('/order', orderRouter);
router.use('/bid', bidRouter);
router.use('/trip', tripRouter);

export default router;
