import { EventEmitter } from "events";
import { useEffect, useState } from "react";
import { LoginUserSuccessDto } from "@common/dto/login-user-success.dto";

type AuthInfo = Partial<LoginUserSuccessDto>;

class AuthEventTarget extends EventEmitter {
    authChanged() {
        this.emit("authChanged");
    }
}

const target = new AuthEventTarget();

export const getAuth = () => {
    try {
        return JSON.parse(localStorage.getItem("auth") || "{}") as AuthInfo;
    } catch (e) {
        return undefined;
    }
};

export function useAuth() {
    const [auth, setAuth] = useState<AuthInfo>(getAuth());
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        if (auth === undefined || auth?.access_token === getAuth()?.access_token) {
            return;
        }

        try {
            localStorage.setItem("auth", JSON.stringify(auth));
        } catch (e) {
            // localStorage.setItem("auth", null);
        }
        target.authChanged();
    }, [auth]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleAuthChanged = () => {
            try {
                setAuth(getAuth());
            } catch (e) {
                // setAuth(null);
            }
        };
        handleAuthChanged();
        target.on("authChanged", handleAuthChanged);
        return () => target.off("authChanged", handleAuthChanged);
    }, []);

    return [auth, setAuth] as const;
}