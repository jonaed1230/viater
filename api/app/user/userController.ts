import { Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import axios from "axios";

import { wrapUId, unwrapUId } from "../lib/common";

const prisma = new PrismaClient();

const checkUser = async (req: Request, res: Response): Promise<User | any> => {
  const { uId } = req.cookies;
  if (!uId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const userId = unwrapUId(uId);

  const id = userId.id;

  if (!id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  return user;
}

export async function signIn(req: Request, res: Response) {
  const { mobile_number, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        mobile_number,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "User not verified",
      });
    }

    const isPasswordMatched = bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "Password not matched",
      });
    }

    // @ts-ignore
    delete user.password;

    res.cookie("uId", wrapUId(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    
    return res.status(200).json({
      message: "Successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
}

export async function signUp(req: Request, res: Response) {
  const { full_name, mobile_number, password, role, license_number } = await req.body;
  const existedUser = await prisma.user.findUnique({
    where: {
      mobile_number,
    },
  });

  if (existedUser) {
    return res.status(400).json({
      message: "User already existed",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const verification_code = Math.random().toString().substr(2, 6);

    const user = await prisma.user.create({
      data: {
        full_name,
        mobile_number,
        password: hashedPassword,
        role,
        verification_code,
        verification_code_expiry: new Date(+Date.now() + 1000 * 60 * 60), // 1 hour from now
      },
    });

    if (role === "DRIVER") {
      await prisma.driverExtra.create({
        data: {
          driving_pattern: 1,
          driving_experience: 0,
          average_speed: 60.0,
          license_number,
          user: {
            connect: {
              id: user.id,
            },
          }
        }
      });
    }

    await axios.get(
      `http://bulksmsbd.net/api/smsapi?api_key=${process.env.BSB_API_KEY}&type=text&number=88${mobile_number}&senderid=8809617611745&message=Hi%20${full_name},%20Your%20VIATER%20verification%20code%20is%20${verification_code}%20(Do%20not%20share%20this%20code%20with%20anyone)`
    );
    // @ts-ignore
    delete user.password;
    return res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
}

export async function verify(req: Request, res: Response) {
  const { mobile_number, verification_code } = await req.body;

  const user = await prisma.user.findUnique({
    where: {
      mobile_number,
    },
  });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  if (user.verification_code !== verification_code) {
    return res.status(400).json({
      message: "Verification code not matched",
    });
  }

  if (user.verification_code_expiry! < new Date()) {
    return res.status(400).json({
      message: "Verification code expired",
    });
  }

  const verifiedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      verified: true,
      verification_code: null,
      verification_code_expiry: null,
    },
  });

  // @ts-ignore
  delete verifiedUser.password;

  return res.status(200).json({
    message: "User verified successfully",
    data: verifiedUser,
  });
}

export async function resendVerificationCode(req: Request, res: Response) {
  const { mobile_number } = await req.body;

  const user = await prisma.user.findUnique({
    where: {
      mobile_number,
    },
  });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  const verification_code = Math.random().toString().substr(2, 6);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      verification_code,
      verification_code_expiry: new Date(+Date.now() + 1000 * 60 * 60), // 1 hour from now
    },
  });

  await axios.get(
    `http://bulksmsbd.net/api/smsapi?api_key=${process.env.BSB_API_KEY}&type=text&number=88${mobile_number}&senderid=8809617611745&message=Hi%20${updatedUser.full_name},%20Your%20VIATER%20verification%20code%20is%20${verification_code}%20(Do%20not%20share%20this%20code%20with%20anyone)`
  );

  return res.status(200).json({
    message: "Verification code sent successfully",
  });
}

export async function signOut(req: Request, res: Response) {
  await res.clearCookie("uId");
  return res.status(200).json({
    message: "User signed out successfully",
  });
}

export async function getMe(req: Request, res: Response) {
  const { uId } = req.cookies;
  if (!uId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const userId = unwrapUId(uId);

  const id = userId.id;

  if (!id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // @ts-ignore
  delete user.password;

  return res.status(200).json({
    message: "User found",
    data: user,
  });
}

export async function forgotPassword(req: Request, res: Response) {
  const { mobile_number } = await req.body;

  const user = await prisma.user.findUnique({
    where: {
      mobile_number,
    },
  });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });

  }

  const verification_code = Math.random().toString().substr(2, 6);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      reset_password_code: verification_code,
      reset_password_code_expiry: new Date(+Date.now() + 1000 * 60 * 60), // 1 hour from now
    },
  });

  await axios.get(
    `http://bulksmsbd.net/api/smsapi?api_key=${process.env.BSB_API_KEY}&type=text&number=88${mobile_number}&senderid=8809617611745&message=Hi%20${updatedUser.full_name},%20Your%20VIATER%20reset%20password%20code%20is%20${verification_code}%20(Do%20not%20share%20this%20code%20with%20anyone)`
  );

  return res.status(200).json({
    message: "Reset password code sent successfully",
  });
}


export async function resetPassword(req: Request, res: Response) {
  const { mobile_number, reset_password_code, password } = await req.body;

  const user = await prisma.user.findUnique({
    where: {
      mobile_number,
    },
  });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  if (user.reset_password_code !== reset_password_code) {
    return res.status(400).json({
      message: "Reset password code not matched",
    });
  }

  if (user.reset_password_code_expiry! < new Date()) {
    return res.status(400).json({
      message: "Reset password code expired",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      reset_password_code: null,
      reset_password_code_expiry: null,
    },
  });

  // @ts-ignore
  delete updatedUser.password;

  return res.status(200).json({
    message: "Password reset successfully"
  });
}


export async function updateUser(req: Request, res: Response) {
  const user = await checkUser(req, res);

  const { full_name, mobile_number, password, license_number, email } = await req.body;

  try {
    const newData = {
      full_name: full_name || user.full_name,
      mobile_number: mobile_number || user.mobile_number,
      password: password ? await bcrypt.hash(password, 10) : user.password,
      license_number: license_number || user.license_number,
      email: email || user.email,
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: newData,
    });

    // @ts-ignore
    delete updatedUser.password;

    return res.status(200).json({
      message: "User updated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
}
