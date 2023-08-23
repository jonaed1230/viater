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

export async function createOrder(req: Request, res: Response) {
  const user = await checkUser(req, res);

  const { from_lat, from_lng, to_lat, to_lng, budget, additional_requirements, departure_time } = await req.body;

  try {
    const order = await prisma.request.create({
      data: {
        from_lat,
        from_lng,
        to_lat,
        to_lng,
        budget: parseInt(budget),
        additional_requirements,
        departure_time,
        user: {
          connect: {
            id: user.id
          }
        }
      }
    });

    return res.status(200).json({
      message: "Ride request created successfully",
      data: order
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error creating ride request",
      error
    });
  }

}

export async function updateOrder(req: Request, res: Response) {
  const user = await checkUser(req, res);
  const { id, from_lat, from_lng, to_lat, to_lng, budget, additional_requirements, departure_time } = await req.body;

  try {
    const order = await prisma.request.findFirst({
      where: {
        id,
      }
    });

    if (!order) {
      return res.status(400).json({
        message: "Ride request not found"
      });
    }

    if (order.user_id !== user.id) {
      return res.status(400).json({
        message: "Unauthorized"
      });
    }

    const updatedOrder = await prisma.request.update({
      where: {
        id,
      },
      data: {
        from_lat,
        from_lng,
        to_lat,
        to_lng,
        budget: parseInt(budget),
        additional_requirements,
        departure_time,
      }
    });

    return res.status(200).json({
      message: "Ride request updated successfully",
      data: updatedOrder
    });

  } catch (error) {
    return res.status(400).json({
      message: "Error updating ride request",
      error
    });
  }  
}

export async function deleteOrder(req: Request, res: Response) {
  const user = await checkUser(req, res);
  const { id } = await req.body;

  try {
    const order = await prisma.request.findFirst({
      where: {
        id,
      }
    });

    if (!order) {
      return res.status(400).json({
        message: "Ride request not found"
      });
    }

    if (order.user_id !== user.id) {
      return res.status(400).json({
        message: "Unauthorized"
      });
    }

    const deletedOrder = await prisma.request.delete({
      where: {
        id,
      }
    });

    return res.status(200).json({
      message: "Ride request deleted successfully",
      data: deletedOrder
    });

  } catch (error) {
    return res.status(400).json({
      message: "Error deleting ride request",
      error
    });
  }
}

export async function getOrder(req: Request, res: Response) {
  const user = await checkUser(req, res);
  const { id } = await req.body;

  try {
    const order = await prisma.request.findFirst({
      where: {
        id,
      }
    });

    if (!order) {
      return res.status(400).json({
        message: "Ride request not found"
      });
    }

    return res.status(200).json({
      message: "Ride request found",
      data: order
    });

  } catch (error) {
    return res.status(400).json({
      message: "Error finding ride request",
      error
    });
  }
}

export async function getOrders(req: Request, res: Response) {
  const user = await checkUser(req, res);

  try {
    const orders = await prisma.request.findMany({
      where: {
        user_id: user.id,
        status: "PENDING",
      }
    });

    return res.status(200).json({
      message: "Ride requests found",
      data: orders
    });

  } catch (error) {
    return res.status(400).json({
      message: "Error finding ride requests",
      error
    });
  }  
}
