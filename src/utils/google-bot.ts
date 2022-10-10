import { Storage } from "@google-cloud/storage";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import HttpException from "../middleware/exceptions/http-exception";
import Post from "../models/post-interface";

const {
  NODE_ENV,
  PROJECT_ID,
  KEY_FILE_NAME,
  GOOGLE_BUCKET_NAME,
  POSTS_FOLDER,
  POSTS_FILE_NAME,
} = process.env;

class GoogleBot {
  private readonly storage;
  private readonly imageBucket;
  public multer;

  constructor() {
    this.storage = new Storage({
      projectId: PROJECT_ID,
      keyFilename: KEY_FILE_NAME,
    });
    this.multer = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // no larger than 10mb, you can change as needed.
      },
      fileFilter: (_req, file, cb) => {
        this.checkFileType(file, cb);
      },
    });
    this.imageBucket = this.storage.bucket(GOOGLE_BUCKET_NAME);
  }

  public getPosts = async () => {
    const data = await this.storage
      .bucket(GOOGLE_BUCKET_NAME)
      .file(`${NODE_ENV}/${POSTS_FILE_NAME}`)
      .download();

    return JSON.parse(data.toString());
  };

  public updatePosts = async (data: Post[]) => {
    const file = this.imageBucket.file(`${NODE_ENV}/${POSTS_FILE_NAME}`);

    const content = JSON.stringify(data);

    await file.save(content, {
      metadata: { cacheControl: "no-store" },
    });
  };

  private checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
    // Allowed ext
    const filetypes = new RegExp(/webp|jpeg|jpg|png/);
    // Check ext
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
      cb(null, true);
    } else {
      cb(new HttpException(400, `Dozwolone rozszerzenia: webp jpeg jpg png`));
    }
  }

  public saveNewUserImage = async (file: Express.Multer.File) => {
    try {
      const convertedImage = await sharp(file.buffer)
        .resize(1920, 1080, { fit: "fill" })
        .webp({ quality: 90 })
        .toBuffer();

      const uniqueName = uuidv4() + ".webp";
      const imageFile = this.imageBucket.file(
        `${NODE_ENV}/${POSTS_FOLDER}/${uniqueName}`
      );
      await imageFile.save(convertedImage);

      return uniqueName;
    } catch (e) {
      console.log(e);
      throw new HttpException(500, "Błąd podczas zapisu zdjęcia");
    }
  };

  public deleteUserImage = async (imageID: string) => {
    try {
      const file = this.imageBucket.file(
        `${NODE_ENV}/${POSTS_FOLDER}/${imageID}`
      );
      await file.delete();
    } catch (e) {
      console.log(e);
      throw new HttpException(500, "Błąd podczas usuwania zdjęcia");
    }
  };
}
export default GoogleBot;
