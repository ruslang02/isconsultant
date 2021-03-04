import { Header } from "components/Header";
import { Page } from "components/Page";
import React from "react";
import { Container, Image, Segment } from "semantic-ui-react";
import styles from "styles/Page.module.css";
import { useAuth } from "utils/useAuth";

const Empty = () => {
  const [auth] = useAuth();
  return (
    <Page>
      <Segment>
        <Image size="small" src={auth?.user?.avatar} avatar />

      </Segment>
    </Page>
  );
};

export default Empty;