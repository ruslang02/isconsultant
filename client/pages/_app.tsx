import React, { useEffect, useState } from "react";
import "semantic-ui-css/semantic.min.css";
import "../styles/globals.css";
import "utils/i18n";
import { useTranslation } from "react-i18next";
import { Button, Message } from "semantic-ui-react";
import { useRouter } from "next/router";
import { useAuth } from "utils/useAuth";
import { MessageContext } from "utils/MessageContext";
import { UserCacheContext } from "utils/UserCacheContext";
import { GetUserDto } from "@common/dto/get-user.dto";
import { api } from "utils/api";

const isPublic = (path: string) =>
  path === "/" ||
  path === "/login" ||
  path === "/register" ||
  path.startsWith("/verify") ||
  path.startsWith("/video");

function MyApp({
  Component,
  pageProps,
}: {
  Component: new () => JSX.ElementClass;
  pageProps: Record<string, string>;
}) {
  const { i18n } = useTranslation();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [auth, setAuth] = useAuth();
  const [users, setUsers] = useState<GetUserDto[]>([]);
  const [allowed, setAllowed] = useState(
    typeof window === "undefined" || isPublic(router.pathname)
  );

  useEffect(() => {
    if (
      !router.pathname.includes("video") &&
      auth &&
      auth.user &&
      auth.user.verified === false
    ) {
      setAuth({});
      location.reload();
      return;
    }
    if (!isPublic(router.pathname)) {
      if (!auth?.access_token) {
        if (typeof window !== "undefined")
          router.replace("/login?redirect=" + router.pathname).then(() => {
            setAllowed(true);
            document.querySelector("#__next").classList.add("loaded");
          });
      } else {
        document.querySelector("#__next").classList.add("loaded");
      }
    } else {
      setAllowed(true);
      document.querySelector("#__next").classList.add("loaded");
    }
  }, [auth]);

  useEffect(() => {
    (async () => {
      const { data, status } = await api.get<GetUserDto>("/users/@me");
      if (status > 300) {
        setAllowed(false);
        setAuth({});
        if (!isPublic(router.pathname)) {
          location.assign("/login?redirect=" + router.pathname);
        } else if (auth?.access_token) {
          location.reload();
        }
      } else {
        setAuth((auth) => ({ ...auth, user: { ...auth.user, ...data } }));
        setAllowed(true);
      }
    })();
  }, []);

  return (
    <MessageContext.Provider value={[message, setMessage]}>
      <UserCacheContext.Provider value={[users, setUsers]}>
        {allowed && <Component {...pageProps} />}
      </UserCacheContext.Provider>
      <div
        style={{
          position: "fixed",
          bottom: "5%",
          left: "5%",
          zIndex: 99000,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.25)",
          cursor: "pointer",
        }}
        onClick={() => setMessage("")}
      >
        <Message hidden={!message}>
          <span dangerouslySetInnerHTML={{ __html: message }}></span>
        </Message>
      </div>
    </MessageContext.Provider>
  );
}

export default MyApp;
