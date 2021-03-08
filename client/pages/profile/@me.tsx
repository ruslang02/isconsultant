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
        <h3>{auth?.user?.last_name} {auth?.user?.first_name} {auth?.user?.middle_name}</h3>
        <p>{auth?.user?.type}</p>
        <p><b>E-mail: </b><i>not set</i></p>
        <p><b>Phone number: </b><i>not set</i></p>
      </Segment>
    </Page>
  );
};

export default Empty;