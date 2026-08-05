import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { createUser, findUserByEmail, verifyPassword } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';

function generateToken(userId: number): string {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new AppError('Email, password, and name are required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const user = await createUser({ email, password, name });
  const token = generateToken(user.id);

  res.status(201).json({ user, token });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken(user.id);

  const { password_hash, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
}
