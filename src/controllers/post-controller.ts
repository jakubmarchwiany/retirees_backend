/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import Controller from "../interfaces/controller-interface";
import authMiddleware from "../middleware/auth-middleware";
import Post from "../models/post-interface";
import catchError from "../utils/catch-error";
import GoogleBot from "../utils/google-bot";

const { NODE_ENV } = process.env;

class PostController implements Controller {
  public router = Router();
  public path = "/posts";
  private readonly googleBot = new GoogleBot();
  private allPosts: Post[] = [];

  constructor() {
    this.initializeRoutes();
    this.loadPosts();
  }

  private initializeRoutes() {
    this.router.get(``, catchError(this.getPosts));
    this.router.post(
      `/new-trip`,
      authMiddleware,
      this.googleBot.multer.single("image"),
      catchError(this.newTrip)
    );
    this.router.post(
      `/new-information`,
      authMiddleware,
      catchError(this.newInformation)
    );
    this.router.get(
      `/delete-trip/:id`,
      authMiddleware,
      catchError(this.deleteTrip)
    );
    this.router.get(
      `/delete-information/:id`,
      authMiddleware,
      catchError(this.deleteInformation)
    );
  }

  private getPosts = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page.toString());

    const slicePosts = this.allPosts.slice(page * 5, page * 5 + 5);
    const numberOfPages = Math.ceil(this.allPosts.length / 5);
    res.send({
      message: "Udało się pobrać posty",
      posts: slicePosts,
      numberOfPages: numberOfPages,
    });
  };

  private loadPosts = async () => {
    this.allPosts = await this.googleBot.getPosts();
  };

  private newInformation = async (req: Request, res: Response) => {
    const { title, startDate, content } = req.body;

    let i = 0;
    for (const oldPost of this.allPosts) {
      if (new Date(oldPost.startDate) > new Date(startDate)) {
        i++;
      } else {
        break;
      }
    }

    this.allPosts.splice(i, 0, {
      id: uuidv4(),
      isTrip: false,
      title,
      startDate,
      content,
    });

    await this.googleBot.updatePosts(this.allPosts);

    res.send({
      message: "Udało się dodać informacje",
    });
  };

  private newTrip = async (req: Request, res: Response) => {
    const { title, startDate, endDate, content } = req.body;
    let imageID;
    if (NODE_ENV === "production") {
      imageID = await this.googleBot.saveNewUserImage(req.file);
    } else {
      imageID = "test.png";
    }

    let i = 0;
    for (const oldPost of this.allPosts) {
      if (new Date(oldPost.startDate) > new Date(startDate)) {
        i++;
      } else {
        break;
      }
    }

    this.allPosts.splice(i, 0, {
      id: uuidv4(),
      isTrip: true,
      title,
      startDate,
      endDate,
      imageID,
      content,
    });

    await this.googleBot.updatePosts(this.allPosts);

    res.send({
      message: "Udało się dodać wycieczkę",
    });
  };

  private deleteInformation = async (req: Request, res: Response) => {
    const { id } = req.params;

    for (let i = 0; i < this.allPosts.length; i++) {
      if (this.allPosts[i].id === id) {
        this.allPosts.splice(i, 1);
        break;
      }
    }

    await this.googleBot.updatePosts(this.allPosts);

    res.send({
      message: "Udało się usunąć informacje",
    });
  };

  private deleteTrip = async (req: Request, res: Response) => {
    const { id } = req.params;

    const trip: Post = this.allPosts.find((x) => x.id === id);

    if (NODE_ENV === "production")
      await this.googleBot.deleteUserImage(trip.imageID);

    for (let i = 0; i < this.allPosts.length; i++) {
      if (this.allPosts[i].id === id) {
        this.allPosts.splice(i, 1);
        break;
      }
    }

    await this.googleBot.updatePosts(this.allPosts);

    res.send({
      message: "Udało się usunąć wycieczkę",
    });
  };
}
export default PostController;
