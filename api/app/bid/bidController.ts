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

export async function createBid(req: Request, res: Response) {
  const user = await checkUser(req, res);

  const { id, amount, additional_message } = await req.body;

  try {
    const request = await prisma.request.findFirst({
      where: {
        id,
      }
    });

    if (!request) {
      return res.status(400).json({
        message: "Request not found",
      })
    }

    const bid = await prisma.bid.create({
      data: {
        amount: parseInt(amount),
        additional_message,
        request: {
          connect: {
            id
          }
        },
        driver: {
          connect: {
            id: user.id
          }
        }
      }
    });

    return res.status(200).json({
      message: "Bid created successfully",
      data: bid
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Bad Request",
    });
  }
}

export async function getBids(req: Request, res: Response) {
  const user = await checkUser(req, res);

  if (user.role === "USER") {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { id } = await req.body;

  try {
    const request = await prisma.request.findFirst({
      where: {
        id,
      }
    });

    if (!request) {
      return res.status(400).json({
        message: "Request not found",
      })
    }

    const bids = await prisma.bid.findMany({
      where: {
        request_id: id,
      }
    });

    return res.status(200).json({
      message: "Bids fetched successfully",
      data: bids
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Bad Request",
    });
  }
}

export async function acceptBid(req: Request, res: Response) {
  const user = await checkUser(req, res);

  if (user.role === "DRIVER") {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { id } = await req.body;

  try {
    const bid = await prisma.bid.findFirst({
      where: {
        id,
      }
    });

    if (!bid) {
      return res.status(400).json({
        message: "Bid not found",
      })
    }

    const request = await prisma.request.findFirst({
      where: {
        id: bid.request_id,
      }
    });

    if (!request) {
      return res.status(400).json({
        message: "Request not found",
      })
    }

    await prisma.request.update({
      where: {
        id: request.id,
      },
      data: {
        status: "ACCEPTED",
      }
    });

    const updatedBid = await prisma.bid.deleteMany({
      where: {
        id: {
          not: {
            equals: id,
          }
        }
      }
    });

    return res.status(200).json({
      message: "Bid accepted successfully",
      data: updatedBid
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Bad Request",
    });
  }
}
