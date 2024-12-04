import { PrismaClient, Prisma } from "@prisma/client";
import { AuthenticationError, ForbiddenError } from "apollo-server-express";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    employees: async (_, { filter, skip, take, orderBy }, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");

      const where: Prisma.EmployeeWhereInput = {};
      if (filter) {
        if (filter.name) where.name = { contains: filter.name };
        if (filter.class) where.class = filter.class;
        if (filter.minAge) where.age = { gte: filter.minAge };
        if (filter.maxAge) where.age = { lte: filter.maxAge };
      }

      const orderByClause: Prisma.EmployeeOrderByWithRelationInput = {};
      if (orderBy) {
        console.log(orderBy)
        orderByClause[orderBy.field.toLowerCase()] =
          orderBy.direction.toLowerCase();
      }

      const employees = await prisma.employee.findMany({
        where,
        skip,
        take: take || 10,
        orderBy: orderByClause,
      });

      const totalCount = await prisma.employee.count({ where });

      const edges = employees.map((employee) => ({
        node: employee,
        cursor: Buffer.from(employee.id.toString()).toString("base64"),
      }));

      const endCursor =
        edges.length > 0 ? edges[edges.length - 1].cursor : null;

      return {
        edges,
        pageInfo: {
          hasNextPage: skip + (take || 10) < totalCount,
          endCursor,
        },
        totalCount,
      };
    },
    employee: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");
      return prisma.employee.findUnique({ where: { id } });
    },
  },
  Mutation: {
    register: async (_, { input }) => {
      const existingEmployee = await prisma.employee.findUnique({
        where: { email: input.email },
      });
      if (existingEmployee) {
        throw new Error("Email already in use");
      }

      const hashedPassword = await hash(input.password, 10);

      const isFirstUser = (await prisma.employee.count()) === 0;
      const role = isFirstUser ? "ADMIN" : "EMPLOYEE";

      const employee = await prisma.employee.create({
        data: {
          ...input,
          password: hashedPassword,
          role,
        },
      });

      const token = sign(
        { id: employee.id, role: employee.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" },
      );

      return { token, employee };
    },
    login: async (_, { email, password }) => {
      const employee = await prisma.employee.findUnique({ where: { email } });
      if (!employee) {
        throw new AuthenticationError("Invalid email or password");
      }

      const validPassword = await compare(password, employee.password);
      if (!validPassword) {
        throw new AuthenticationError("Invalid email or password");
      }

      const token = sign(
        { id: employee.id, role: employee.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" },
      );

      return { token, employee };
    },
    addEmployee: async (_, { input }, { user }) => {
      if (!user || user.role !== "ADMIN")
        throw new ForbiddenError("Not authorized");
      const hashedPassword = await hash(input.password, 10);
      return prisma.employee.create({
        data: { ...input, password: hashedPassword },
      });
    },
    updateEmployee: async (_, { id, input }, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");
      if (user.role !== "ADMIN" && user.id !== id)
        throw new ForbiddenError("Not authorized");
      if (input.password) {
        input.password = await hash(input.password, 10);
      }
      return prisma.employee.update({ where: { id }, data: input });
    },
  },
};
