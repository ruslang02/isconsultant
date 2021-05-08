import { CreateUserDto } from "@common/dto/create-user.dto";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Form, Button, Segment, Message, Icon, Image } from "semantic-ui-react";
import { api } from "utils/api";

export default () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    const { data, status } = await api.post<{ message: string }>(
      "/auth/register",
      {
        email,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        password,
      } as CreateUserDto
    );
    if (status < 300) {
      setSuccess(true);
    } else {
      setError(data.message);
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
        <title>Register - ISConsultant</title>
      </Head>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "400px",
        }}
      >
        <Link href="/">
          <a style={{ margin: "20px auto" }}>
            <Image src="/assets/logo.png" height="24" />
          </a>
        </Link>
        {!success && (
          <>
            <Message
              header="Create an account at ISConsultant"
              content="You will be able to arrange a meeting afterwards."
            />
            <Segment>
              <Form onSubmit={handleSubmit}>
                <Form.Field>
                  <label>
                    First name<span style={{ color: "red" }}>*</span>:
                  </label>
                  <input
                    placeholder="John"
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    value={firstName}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Middle name:</label>
                  <input
                    onChange={(e) => setMiddleName(e.target.value)}
                    value={middleName}
                  />
                </Form.Field>
                <Form.Field>
                  <label>
                    Last name<span style={{ color: "red" }}>*</span>:
                  </label>
                  <input
                    placeholder="Smith"
                    onChange={(e) => setLastName(e.target.value)}
                    value={lastName}
                  />
                </Form.Field>
                <Form.Field>
                  <label>
                    E-mail<span style={{ color: "red" }}>*</span>:
                  </label>
                  <input
                    placeholder="example@example.org"
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    value={email}
                  />
                </Form.Field>
                <Form.Field>
                  <label>
                    Password<span style={{ color: "red" }}>*</span>:
                  </label>
                  <input
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                  <small>Not less than 6 symbols</small>
                </Form.Field>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Button compact onClick={() => router.push("/login")}>
                    <Icon name="arrow left" />
                    Back to Sign in
                  </Button>
                  <Button primary type="submit">
                    Create account
                  </Button>
                </div>
              </Form>
            </Segment>
            {error && <Message color="red" content={error} />}
          </>
        )}
        {success && (
          <>
            <Message
              color="green"
              floating
              content={
                <>
                  {
                    "We have successfully created your account. You also need to "
                  }
                  <b>{"verify"}</b>
                  {" your account from the email we sent you."}
                </>
              }
            />
            <Button
              primary
              style={{ marginTop: "1rem" }}
              onClick={() => router.push("/login")}
            >
              <Icon name="arrow left" />
              To Sign in
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
