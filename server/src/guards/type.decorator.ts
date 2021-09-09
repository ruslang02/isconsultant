import { UserType } from "@common/models/user.entity";
import { SetMetadata } from "@nestjs/common";

export const Types = (...types: UserType[]) => SetMetadata("types", types);
