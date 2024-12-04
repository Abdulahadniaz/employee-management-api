import { AuthenticationError } from "apollo-server-express";
import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { ExpressContext } from 'apollo-server-express';

const prisma = new PrismaClient();

export const authenticate = async (req: ExpressContext['req']) => {
  const token = req.headers.authorization?.split(" ")[1] || "";

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await prisma.employee.findUnique({
      where: { id: decoded.id },
    });
    return user;
  } catch (err) {
    throw new AuthenticationError("Invalid or expired token");
  }
};
