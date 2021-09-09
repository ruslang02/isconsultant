import { diskStorage } from "multer";
import { snowflake } from "./snowflake.service";

export const myStorage = diskStorage({
    destination: process.env.STORAGE_LOCATION,
    filename: (_r, _f, cb) => {
        cb(null, snowflake.make());
    }
});