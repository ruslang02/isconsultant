import React, { useEffect, useState } from "react";
import "semantic-ui-css/semantic.min.css";
import "../styles/globals.css";
import "utils/i18n";
import { useTranslation } from "react-i18next";
import { Button, Message } from "semantic-ui-react";
import { useRouter } from "next/router";
import { useAuth } from "utils/useAuth";
import { MessageContext } from "utils/MessageContext";

const isPublic = (path: string) => path === "/" || path === "/login" || path === "/register" || path.startsWith("/verify");

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
  const [allowed, setAllowed] = useState(typeof window === "undefined" || isPublic(router.pathname));
  /*
    useEffect(() => {
      if (!auth?.access_token && !isPublic(router.pathname)) {
        if (typeof window !== "undefined") location.replace("/login?redirect=" + location.pathname);
      } else {
        setAllowed(true);
      }
    }, [auth]);
  */
  return (
    <MessageContext.Provider value={{value: message, setValue: setMessage}}>
      <Button
        style={{ position: "fixed", bottom: 0, left: 0, zIndex: 100 }}
        onClick={() =>
          i18n.changeLanguage(i18n.language === "en" ? "ru" : "en")
        }
      >
        {i18n.language === "en" ? "RU" : "EN"}
      </Button>
      <Component {...pageProps} />
      <div
        style={{
          position: "fixed",
          bottom: "5%",
          left: "5%",
          zIndex: 99000,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.25)",
          cursor: "pointer"
        }}
        onClick={() => setMessage("")}
      >
        <Message hidden={!message}><span dangerouslySetInnerHTML={{ __html: message }}></span></Message>
      </div>
    </MessageContext.Provider>
  );
}

export default MyApp;
