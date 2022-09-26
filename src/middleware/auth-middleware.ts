import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import AuthenticationTokenMissingException from "./exceptions/authentication-token-missing-exception";
import WrongAuthenticationTokenException from "./exceptions/wrong-authentication-token-exception";

const { JWT_SECRET } = process.env;

function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const cookies = request.cookies;
  if (cookies && cookies.Authorization) {
    try {
      const verificationResponse = jwt.verify(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        cookies.Authorization,
        JWT_SECRET
      );

      if (verificationResponse) {
        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (error) {
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}
export default authMiddleware;
