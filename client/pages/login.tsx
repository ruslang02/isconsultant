import { LoginUserSuccessDto } from "@common/dto/login-user-success.dto";
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import { Button, Card, Checkbox, Form } from "semantic-ui-react";
import { api } from "utils/api";
import { AuthContext } from "utils/AuthContext";

const Login: React.FC = () => {
  const redirect = globalThis.location ? new URL(location.href).searchParams.get("redirect") : undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { auth, setAuth } = useContext(AuthContext);
  const router = useRouter();

  const handleSubmit = async() => {
    try {
      const { data } = await api.post<LoginUserSuccessDto>("/auth/login", JSON.stringify(
        { email, password }
      ), {
        headers: {
          'Content-type': 'application/json'
        }
      });

      setAuth(data);
      router.replace(redirect);
    } catch (e) {
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Card>
          <Card.Content>
            <Form onSubmit={handleSubmit}>
              <Form.Field>
                <label>E-mail:</label>
                <input placeholder="example@example.org" onChange={(e) => setEmail(e.target.value)} type="email" value={email} />
              </Form.Field>
              <Form.Field>
                <label>Password</label>
                <input placeholder="" type="password" onChange={(e) => setPassword(e.target.value)} value={password} />
              </Form.Field>
              <Form.Field>
                <Checkbox label="Remember me" />
              </Form.Field>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button type="submit">Sign in</Button>
              </div>
            </Form>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Login;