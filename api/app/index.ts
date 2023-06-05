import { Router } from 'express';
import userRouter from './user/router';

const router = Router();
router.get('/', (req, res) => {
  res.send('Welcome to viater API route');
});
router.use('/user', userRouter);

export default router;
