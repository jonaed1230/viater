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


export const createTrip = async (req: Request, res: Response) => {

  const { id, distance, start_time, end_time, average_traffic_status  } = await req.body;

  const user = await checkUser(req, res);

  

  try {
    const bid = await prisma.bid.findFirst({
      where: {
        id
      },
      include: {
        request: {
          include: {
            user: true
          }
        },
        driver: true
      }
    })


    if (!bid) {
      return res.status(400).json({
        message: "Bid not found",
      })
    }


    if (bid.driver.id !== user.id) {
      return res.status(400).json({
        message: "Unauthorized",
      })
    }

    const request = bid.request;

    const trip = await prisma.trip.create({
      data: {
        distance: parseFloat(distance),
        start_time,
        end_time,
        average_traffic_status: parseInt(average_traffic_status),
        request: {
          connect: {
            id: request.id
          }
        },
        bid: {
          connect: {
            id: bid.id
          }
        },
        driver: {
          connect: {
            id: bid.driver.id
          }
        },
        user: {
          connect: {
            id: request.user.id
          }
        },      
      }
    })

    return res.status(200).json({
      message: "Trip created successfully",
      data: trip
    });
    
  }
  catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong",
    });
  }

}