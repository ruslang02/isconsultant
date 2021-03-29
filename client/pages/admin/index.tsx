import { PatchUserDto } from "@common/dto/patch-user.dto";
import { Header } from "components/Header";
import { Page } from "components/Page";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Container,
  Icon,
  Image,
  Input,
  Segment,
} from "semantic-ui-react";
import styles from "styles/Page.module.css";
import { api } from "utils/api";
import { MessageContext } from "utils/MessageContext";
import { useAuth } from "utils/useAuth";

const Empty = () => {
  const [auth, setAuth] = useAuth();
  const router = useRouter();
  const [log, setLog] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ log: string }>("/admin/log");
        setLog(data.log.split("\n"));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <Page>
      <h2>
        Admin Panel
        <br />
        <small style={{ color: "grey" }}>Manage your service</small>
      </h2>
      <Card
        fluid
        onClick={() => router.push("/admin/reports")}
        header="Reports"
        description="View reports directed towards your lawyers"
      />
      <Card
        fluid
        onClick={() => router.push("/admin/users")}
        header="Users"
        description="View all registered users"
      />
      <Card
        fluid
        onClick={() => router.push("/calendar/requests")}
        header="Meeting requests"
        description="View all meeting requests from clients"
      />
      <Card
        fluid
        onClick={() => router.push("/calendar")}
        header="Meetings"
        description="View all registered meetings"
      />
      {auth?.user?.type === "admin" && (
        <>
          <h3>Actions</h3>
          <Button secondary onClick={() => api.post("/admin/restart")}>Restart server</Button>
          <Button color="red" onClick={() => api.post("/admin/purge")}>Purge database</Button>
          <h3>Server log</h3>
          <code
            style={{
              backgroundColor: "black",
              padding: "5px",
              width: "100%",
              borderRadius: "5px",
              overflow: "auto",
              height: "300px",
              maxWidth: "900px",
              display: "block",
              color: "white",
            }}
          >
            {log?.map((_) => (
              <div>{_}</div>
            ))}
          </code>
        </>
      )}
    </Page>
  );
};

export default Empty;
