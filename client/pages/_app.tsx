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
    if (!isPublic(router.pathname)) {
      if (!auth?.access_token) {
        if (typeof window !== "undefined")
          router.replace("/login?redirect=" + router.pathname).then(() => {
            setAllowed(true);
          });
      } else {
        (async() => {
          const { data, status } = await api.get<GetUserDto>("/users/@me");
          if (status > 300) {
            setAllowed(false);
            await router.push("/login?redirect=" + router.pathname);
            setAllowed(true);
          } else {
            setAuth((auth) => ({...auth, user: {...auth.user, ...data}}));
            setAllowed(true);
          }
        })();
      }
    } else {
      setAllowed(true);
    }
  }, [auth]);

  return (
    <MessageContext.Provider value={[message, setMessage]}>
      <Button
        style={{ position: "fixed", bottom: 0, left: 0, zIndex: 100 }}
        onClick={() =>
          i18n.changeLanguage(i18n.language === "en" ? "ru" : "en")
        }
      >
        {i18n.language === "en" ? "RU" : "EN"}
      </Button>
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
