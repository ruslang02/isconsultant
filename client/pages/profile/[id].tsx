import { GetUserDto } from "@common/dto/get-user.dto";
import { UserType } from "@common/models/user.entity";
import { Header } from "components/Header";
import { Page } from "components/Page";
import Head from "next/head";
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
      const { data, status } = await api.get<GetUserDto>(`/users/${id}`);
      setUser(status > 300 ? undefined : data);
    })();
  }, [id]);

  async function handleSubmit() {
    try {
      await api.put(`/reports`, {
        author: auth?.user?.id,
        receiver: id,
        description,
      });
      setMessage("Report was sent to the moderator.");
      setOpen(false);
    } catch (e) {
      console.error(e);
      setMessage("There was an error sending the report.");
    }
  }

  if (!user) {
    return (
      <Page hasMenu={false}>
        <Head>
          <title>User not found - ISConsultant</title>
        </Head>
        <br />
        <h1 style={{ textAlign: "center" }}>User was not found!</h1>
        <p style={{ textAlign: "center" }}>
          Please check the link you've been provided.
        </p>
      </Page>
    );
  }

  return (
    <Page hasMenu={false}>
      <Head>
        <title>
          {user?.first_name} {user?.last_name} - ISConsultant
        </title>
      </Head>
      <Segment.Group>
        <Segment style={{ background: "#efefef" }}>
          <h3>Main information</h3>
        </Segment>
        <Segment style={{ display: "flex" }}>
          <div
            style={{
              float: "left",
              margin: "1rem 2rem",
              textAlign: "center",
            }}
          >
            <Image size="small" src={user?.avatar} avatar style={{
              height: "150px",
              objectFit: "cover"
            }} />
          </div>

          {user?.type === "lawyer" && (
            <Button
              primary
              size="massive"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                margin: "-30px 1rem",
              }}
            >
              Request a meeting
            </Button>
          )}
          <div style={{ padding: "1rem 0" }}>
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
          <div style={{ textAlign: "right", margin: "1rem" }}>
            {auth?.access_token && user?.id !== auth?.user?.id && (
              <a
                href="#"
                onClick={() => setOpen(true)}
                style={{ color: "red" }}
              >
                <Icon name="envelope" /> Report user
              </a>
            )}
          </div>
        </Segment>
      </Segment.Group>
      {user?.educationText && (
        <Segment.Group>
          <Segment style={{ background: "#efefef" }}>
            <h3>Education</h3>
          </Segment>
          <Segment
            dangerouslySetInnerHTML={{ __html: user?.educationText ?? "" }}
          />
        </Segment.Group>
      )}
      {user?.experienceText && (
        <Segment.Group>
          <Segment style={{ background: "#efefef" }}>
            <h3>Job experience</h3>
          </Segment>
          <Segment
            dangerouslySetInnerHTML={{ __html: user?.experienceText ?? "" }}
          />
        </Segment.Group>
      )}
      {user?.specialtyText && (
        <Segment.Group>
          <Segment style={{ background: "#efefef" }}>
            <h3>Specialty</h3>
          </Segment>
          <Segment
            dangerouslySetInnerHTML={{ __html: user?.specialtyText ?? "" }}
          />
        </Segment.Group>
      )}

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
                  style={{ width: "36px", height: "36px" }}
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
                  style={{ width: "36px", height: "36px" }}
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
