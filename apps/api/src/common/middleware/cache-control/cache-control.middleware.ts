import { NextFunction, Request, Response } from "express";

export function CacheControlMiddleware(
  _: Request,
  res: Response,
  next: NextFunction
) {
  res.setHeader('Cache-Control', 'no-store')
  next()
}