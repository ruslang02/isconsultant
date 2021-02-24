import React, { useState } from "react";
import "semantic-ui-css/semantic.min.css";
import { AuthContext } from "utils/AuthContext";
import "../styles/globals.css";
import "utils/i18n";
import { useTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";
import { useRouter } from "next/router";

function MyApp({
  Component,
  pageProps,
}: {
  Component: new () => JSX.ElementClass;
  pageProps: Record<string, string>;
}) {
  const [auth, setAuth] = useState<{ access_token: string } | null>(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("auth") || "null")
      : null
  );

  const { i18n } = useTranslation();
  const router = useRouter();

  if (typeof window !== "undefined") {
    localStorage.setItem("auth", JSON.stringify(auth));

    if (!auth) {
      switch (location.pathname) {
        case "/":
        case "/login":
        case "/register":
          break;
        default:
          router.replace("/login?redirect=" + location.pathname);
      }
    }
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <Button
        style={{ position: "fixed", bottom: 0, left: 0, zIndex: 100 }}
        onClick={() =>
          i18n.changeLanguage(i18n.language === "en" ? "ru" : "en")
        }
      >
        {i18n.language === "en" ? "RU" : "EN"}
      </Button>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}

export default MyApp;
