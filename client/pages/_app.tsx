import React, { useEffect, useState } from "react";
import "semantic-ui-css/semantic.min.css";
import "../styles/globals.css";
import "utils/i18n";
import { useTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";
import { useRouter } from "next/router";
import { useAuth } from "utils/useAuth";

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
  const [auth, setAuth] = useAuth();
  const [allowed, setAllowed] = useState(typeof window === "undefined" || isPublic(router.pathname));

  useEffect(() => {
    if (!auth?.access_token && !isPublic(router.pathname)) {
      if (typeof window !== "undefined") location.replace("/login?redirect=" + location.pathname);
    } else {
      setAllowed(true);
    }
  }, [auth]);

  return (
    <>
      <Button
        style={{ position: "fixed", bottom: 0, left: 0, zIndex: 100 }}
        onClick={() =>
          i18n.changeLanguage(i18n.language === "en" ? "ru" : "en")
        }
      >
        {i18n.language === "en" ? "RU" : "EN"}
      </Button>
      {allowed && <Component {...pageProps} />}
    </>
  );
}

export default MyApp;
