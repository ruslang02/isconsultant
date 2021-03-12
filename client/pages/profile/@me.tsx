import { Header } from "components/Header";
import { Page } from "components/Page";
import React from "react";
import { Button, Container, Icon, Image, Segment } from "semantic-ui-react";
import styles from "styles/Page.module.css";
import { useAuth } from "utils/useAuth";

const Empty = () => {
  const [auth] = useAuth();
  return (
    <Page>
      <Segment>
        <div style={{ float: "left", margin: "0 2rem 0 0", textAlign: "center" }}>
          <Image size="small" src={auth?.user?.avatar} avatar />
          <br />
          <br />
          <div><a href="#"><Icon name="edit" /> Change avatar</a></div>
        </div>
        <div>
          <h2>
            {auth?.user?.last_name}
            {" "}
            {auth?.user?.first_name}
            {" "}
            {auth?.user?.middle_name}
          </h2>
          <p>{auth?.user?.type}</p>
          <p>
            <b>E-mail: </b>
            {auth?.user?.email || <i>not set</i>}
          </p>
          <p>
            <b>Phone number: </b>
            {auth?.user?.phone || <i>not set</i>}
          </p>
          <p>
            <b>Rating: </b>
            {auth?.user?.rating || <i>not set</i>}
          </p>
          <p>
            <b>Created at: </b>
            {auth?.user?.created_timestamp ? new Date(auth.user.created_timestamp).toLocaleDateString() : <i>not set</i>}
          </p>
        </div>
        <div style={{ textAlign: "right", margin: "1rem" }}>
          <Button color="blue" icon="edit"
            content="Edit"
            labelPosition="left" />
        </div>
      </Segment>
    </Page>
  );
};

export default Empty;
