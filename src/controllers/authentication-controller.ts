/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import Controller from "../models/controller-interface";
import authMiddleware from "../middleware/auth-middleware";
import WrongCredentialsException from "../middleware/exceptions/wrong-credentials-exception";
import TokenData from "../models/token-data-interface";
import { USERS } from "../tmp/users";
import catchError from "../utils/catch-error";

const { JWT_SECRET, TOKEN_EXPIRE_AFTER } = process.env;

class AuthenticationController implements Controller {
    public router = Router();
    public path = "/auth";

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`/login`, catchError(this.loggingIn));
        this.router.get(`/auto-login`, authMiddleware, catchError(this.autoLogin));
        this.router.post(`/logout`, this.logOut);
    }

    private loggingIn = async (req: Request, res: Response) => {
        const { username, password } = req.body;

        for (const element of USERS) {
            if (element.username == username) {
                if (element.password == password) {
                    const tokenData = this.createAuthenticationToken();
                    res.cookie("Authorization", tokenData.token, {
                        maxAge: tokenData.expiresIn * 1000,
                        path: "/",
                    });
                    res.send({
                        message: "Udało się zalogować",
                    });
                    return;
                } else {
                    throw new WrongCredentialsException();
                }
            }
        }
        throw new WrongCredentialsException();
    };

    private autoLogin = async (req: Request, res: Response) => {
        res.send({
            message: "Autoryzacja przebiegła pomyślnie",
        });
    };

    private createAuthenticationToken(): TokenData {
        const expiresIn = parseInt(TOKEN_EXPIRE_AFTER);
        return {
            expiresIn,
            token: jwt.sign({}, JWT_SECRET, { expiresIn }),
        };
    }

    private logOut = (req: Request, res: Response) => {
        res.setHeader("Set-Cookie", ["Authorization=; Max-Age=0; path=/;"]);
        res.send({ message: "Udało się wylogować" });
    };
}
export default AuthenticationController;
