/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import Controller from "../interfaces/controller-interface";
import authMiddleware from "../middleware/auth-middleware";
import Post from "../models/post-interface";
import catchError from "../utils/catch-error";
import GoogleBot from "../utils/google-bot";

class PostController implements Controller {
    public router = Router();
    public path = "/posts";
    private readonly googleBot = new GoogleBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/get`, catchError(this.getPosts));
        this.router.post(
            `/new-trip`,
            authMiddleware,
            this.googleBot.multer.single("image"),
            catchError(this.newTrip)
        );
        this.router.post(`/new-information`, authMiddleware, catchError(this.newInformation));
        this.router.get(`/delete-trip/:id`, authMiddleware, catchError(this.deleteTrip));
        this.router.get(
            `/delete-information/:id`,
            authMiddleware,
            catchError(this.deleteInformation)
        );
    }

    private getPosts = async (req: Request, res: Response) => {
        const allPosts = await this.googleBot.getPosts();
        res.send({ message: "Udało się pobrać posty", posts: allPosts });
    };

    private newInformation = async (req: Request, res: Response) => {
        const { title, startDate, content } = req.body;

        const allPosts = await this.googleBot.getPosts();

        let i = 0;
        for (const oldPost of allPosts) {
            if (new Date(oldPost.startDate) > new Date(startDate)) {
                i++;
            } else {
                break;
            }
        }

        allPosts.splice(i, 0, {
            id: uuidv4(),
            isTrip: false,
            title,
            startDate,
            content,
        });

        await this.googleBot.updatePosts(allPosts);

        res.send({
            message: "Udało się dodać informacje",
        });
    };

    private newTrip = async (req: Request, res: Response) => {
        const { title, startDate, endDate, content } = req.body;
        const imageID = await this.googleBot.saveNewUserImage(req.file);

        const allPosts = await this.googleBot.getPosts();

        let i = 0;
        for (const oldPost of allPosts) {
            if (new Date(oldPost.startDate) > new Date(startDate)) {
                i++;
            } else {
                break;
            }
        }

        allPosts.splice(i, 0, {
            id: uuidv4(),
            isTrip: true,
            title,
            startDate,
            endDate,
            imageID,
            content,
        });

        await this.googleBot.updatePosts(allPosts);

        res.send({
            message: "Udało się dodać wycieczkę",
        });
    };

    private deleteInformation = async (req: Request, res: Response) => {
        const { id } = req.params;

        const allPosts = await this.googleBot.getPosts();

        for (let i = 0; i < allPosts.length; i++) {
            if (allPosts[i].id === id) {
                allPosts.splice(i, 1);
                break;
            }
        }

        await this.googleBot.updatePosts(allPosts);

        res.send({
            message: "Udało się usunąć informacje",
        });
    };

    private deleteTrip = async (req: Request, res: Response) => {
        const { id } = req.params;

        const allPosts = await this.googleBot.getPosts();

        const trip: Post = allPosts.find((x: Post) => x.id === id);

        await this.googleBot.deleteUserImage(trip.imageID);

        for (let i = 0; i < allPosts.length; i++) {
            if (allPosts[i].id === id) {
                allPosts.splice(i, 1);
                break;
            }
        }

        await this.googleBot.updatePosts(allPosts);

        res.send({
            message: "Udało się usunąć wycieczkę",
        });
    };
}
export default PostController;
