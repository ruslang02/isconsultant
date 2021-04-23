import { GetUserDto } from "@common/dto/get-user.dto";
import { Header } from "components/Header";
import { Page } from "components/Page";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Container,
  Form,
  Icon,
  Image,
  Modal,
  Segment,
} from "semantic-ui-react";
import styles from "styles/Page.module.css";
import { api } from "utils/api";
import { MessageContext } from "utils/MessageContext";
import { useAuth } from "utils/useAuth";

const Empty = () => {
  const [user, setUser] = useState<GetUserDto | undefined>();
  const router = useRouter();
  const [auth] = useAuth();
  const [, setMessage] = useContext(MessageContext);
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  console.log(router);
  const { id } = router.query;

  useEffect(() => {
    (async () => {
      const { data } = await api.get<GetUserDto>(`/users/${id}`);
      setUser(data);
    })();
  }, [id]);

  async function handleSubmit() {
    try {
      await api.put(`/reports`, { author: auth?.user?.id, receiver: id, description });
      setMessage("Report was sent to the moderator.");
      setOpen(false);
    } catch (e) {
      console.error(e);
      setMessage("There was an error sending the report.");
    }
  }

  return (
    <Page hasMenu={false}>
      <Segment>
        <div
          style={{
            float: "left",
            margin: "0 2rem 0 0",
            textAlign: "center",
            height: "500px",
          }}
        >
          <Image size="small" src={user?.avatar} avatar />
        </div>
        <div>
          <h2>
            {user?.last_name} {user?.first_name} {user?.middle_name}
          </h2>
          <p>{user?.type}</p>
          <p>
            <b>E-mail: </b>
            {user?.email || <i>not set</i>}
          </p>
          <p>
            <b>Phone number: </b>
            {user?.phone || <i>not set</i>}
          </p>
          <p>
            <b>Rating: </b>
            {user?.rating || <i>not set</i>}
          </p>
          <p>
            <b>Created at: </b>
            {user?.created_timestamp ? (
              new Date(user.created_timestamp).toLocaleDateString()
            ) : (
              <i>not set</i>
            )}
          </p>
        </div>
        {user.id !== auth?.user?.id && <div style={{ textAlign: "right", margin: "1rem" }}>
          <a href="#" onClick={() => setOpen(true)} style={{ color: "red" }}>
            <Icon name="envelope" /> Send feedback
          </a>
        </div>}
      </Segment>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Modal.Header>Report a lawyer</Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit}>
            <Form.Field>
              <label>Author:</label>
              <div>
                <Image
                  src={auth?.user?.avatar}
                  size="tiny"
                  style={{ width: "36px" }}
                  avatar
                />{" "}
                <b>
                  {auth?.user?.first_name} {auth?.user?.last_name}
                </b>
              </div>
            </Form.Field>
            <Form.Field>
              <label>Receiver:</label>
              <div>
                <Image
                  src={user?.avatar}
                  size="tiny"
                  style={{ width: "36px" }}
                  avatar
                />{" "}
                <b>
                  {user?.first_name} {user?.last_name}
                </b>
              </div>
            </Form.Field>
            <Form.Field>
              <Form.TextArea
                label="Description"
                onChange={(_e, data) => setDescription(data.value.toString())}
                value={description}
              />
            </Form.Field>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "1.5rem",
              }}
            >
              <Button onClick={() => setOpen(false)} type="button">
                Cancel
              </Button>
              <Button primary type="submit" style={{ marginLeft: ".5rem" }}>
                Send
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    </Page>
  );
};

export default Empty;
