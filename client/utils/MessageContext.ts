import { createContext } from "react";

export const MessageContext = createContext<[string, (nv: string) => void]>(["", () => { }]);