import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  adminId: string;
}

export interface AuthRequest extends Request {
  adminId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as JwtPayload;
    req.adminId = decoded.adminId;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
