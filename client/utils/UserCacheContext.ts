import { GetUserDto } from "@common/dto/get-user.dto";
import { createContext } from "react";

export const UserCacheContext = createContext<[GetUserDto[], (users: GetUserDto[]) => void]>([[], () => { }]);