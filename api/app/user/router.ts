import { Router } from 'express';
import { signIn, signUp,  verify, resendVerificationCode, signOut, getMe } from './userController';

const router = Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/logout", signOut);
router.get("/me", getMe);
router.post("/verify", verify);
router.post("/reverify", resendVerificationCode);

export default router;