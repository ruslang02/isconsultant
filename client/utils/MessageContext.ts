import { createContext } from "react";

export const MessageContext = createContext({ value: "", setValue: (nv: string) => { } });