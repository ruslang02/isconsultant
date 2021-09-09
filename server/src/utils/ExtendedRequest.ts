import { User } from "@common/models/user.entity";
import { Request } from "express";

export type ExtendedRequest = Request & {
    user: User
};
