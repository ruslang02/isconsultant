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
import styles from "styles/App.module.css";
import { c } from "utils/classNames";
import { Footer } from "pages";

const isPublic = (path: string) =>
  path === "/" ||
  path === "/login" ||
  path === "/register" ||
  path.startsWith("/verify") ||
  path.startsWith("/video") ||
  path === "/profile/[id]";

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

    let thankyou = new URL(location.href).searchParams.has("thankyou");
    if (thankyou) {
      setMessage("Thank you for your response!");
    }
  }, []);

  let from: Record<string, string> | undefined;
  let given = [];


  try {
    let search = new URL(location.href).searchParams.get("from");
    if (search) {
      from = JSON.parse(atob(search));
    }
  } catch (e) {
    from = undefined;
  }

  try {
    given = JSON.parse(localStorage.getItem("given_lawyers") ?? "[]") as string[];
    if (given.includes(from.id)) {
      from = undefined;
    }
  } catch (e) {

  }

  const sendRating = (rating: number) => async () => {
    await api.post<GetUserDto>(`/users/${from.id}/rating?offset=${rating}`);
    localStorage.setItem("given_lawyers", JSON.stringify([...given, from.id]));
    location.replace(location.pathname + "?thankyou=1");
  }

  useEffect(() => {
    if (message !== "") {
      setTimeout(() => setMessage(""), 10000);
    }
  }, [message]);
  return (
    <MessageContext.Provider value={[message, setMessage]}>
      <UserCacheContext.Provider value={[users, setUsers]}>
        {allowed && <Component {...pageProps} />}
        {!router.pathname.startsWith("/video") && <Footer />}
      </UserCacheContext.Provider>
      <Message onClick={() => setMessage("")} className={styles.message}>{message}</Message>
      {
        from && (
          <Message className={styles.rate_message}>
            <h3>How was your experience?</h3>
            <p>Please give <b>{from.name}</b> a rating from 1 to 5 in order for us to improve.</p>
            <Button.Group fluid size="big">
              <Button icon color="red" onClick={sendRating(-2)}>1</Button>
              <Button icon color="orange" onClick={sendRating(-1)}>2</Button>
              <Button icon color="yellow" onClick={sendRating(0)}>3</Button>
              <Button icon color="vk" onClick={sendRating(1)}>4</Button>
              <Button icon color="green" onClick={sendRating(2)}>5</Button>
            </Button.Group>
          </Message>
        )
      }
    </MessageContext.Provider>
  );
}

export default MyApp;
