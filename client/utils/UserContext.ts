import { GetUserInfoDto } from "@common/dto/get-user-info.dto";
import { createContext } from "react";

export const UserContext = createContext<GetUserInfoDto | null>(null);
