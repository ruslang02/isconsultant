import { LoginUserSuccessDto } from "@common/dto/login-user-success.dto";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Image,
  Message,
} from "semantic-ui-react";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";

const Login: React.FC = () => {
  const redirect = globalThis.location
    ? new URL(location.href).searchParams.get("redirect")
    : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [auth, setAuth] = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const { data } = await api.post<
        LoginUserSuccessDto | { message: string }
      >("/auth/login", JSON.stringify({ email, password }), {
        headers: {
          "Content-type": "application/json",
        },
      });

      if ("message" in data) {
        setError(
          data.message === "Unauthorized"
            ? "Email or password incorrect."
            : data.message
        );
      } else {
        setError("");
        if (!data.user.avatar) {
          data.user.avatar =
            "https://react.semantic-ui.com/images/avatar/large/matt.jpg";
        }
        setAuth(data);
        router.replace(redirect || "/profile/@me");
      }
    } catch (e) {
      setError(e.message);
      console.error(e);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Head>
        <title>Log in - ISConsultant</title>
      </Head>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "400px",
        }}
      >
        <Link href="/">
          <a style={{ margin: "20px auto" }}>
            <Image src="/assets/logo.png" height="24" />
          </a>
        </Link>
        <Message
          attached
          header="Sign in to ISConsultant"
          content="Fill out the form below to sign-up for a new account"
        />
        <Form className="attached segment" onSubmit={handleSubmit}>
          <Form.Field>
            <label>E-mail:</label>
            <input
              placeholder="example@example.org"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              value={email}
            />
          </Form.Field>
          <Form.Field>
            <label>Password</label>
            <input
              placeholder=""
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </Form.Field>
          <br />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button type="button" onClick={() => router.push("/register")}>
              Register
            </Button>
            <Button primary type="submit">
              Sign in
            </Button>
          </div>
        </Form>
        {error && (
          <Message attached="bottom" error>
            {error}
          </Message>
        )}
      </div>
    </div>
  );
};

export default Login;
