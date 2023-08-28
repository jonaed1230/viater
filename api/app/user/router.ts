import { Router } from 'express';
import { signIn, signUp,  verify, resendVerificationCode, signOut, getMe, updateUser, forgotPassword, resetPassword } from './userController';

const router = Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/logout", signOut);
router.get("/me", getMe);
router.post("/verify", verify);
router.post("/reverify", resendVerificationCode);
router.post("/update-profile", updateUser);
router.post("/request-reset", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;