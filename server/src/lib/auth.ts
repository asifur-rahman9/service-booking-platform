import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export type Role = "business" | "customer";
export interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const COOKIE = "token";

// The JWT is stored in a cookie so the browser sends it with every request.
export function setAuthCookie(res: Response, user: AuthUser) {
  const token = jwt.sign(user, config.jwtSecret, { expiresIn: "7d" });
  res.cookie(COOKIE, token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

// If there's a valid token, put the user on req.user
export function readUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE];
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as AuthUser;
      req.user = { id: payload.id, role: payload.role };
    } catch {
      // bad or expired token, just treat them as logged out
    }
  }
  next();
}

export function requireAuth(role?: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Please log in" });
    if (role && req.user.role !== role) return res.status(403).json({ error: `Only ${role} accounts can do this` });
    next();
  };
}
