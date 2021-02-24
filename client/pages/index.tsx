import { PromoHeader } from "components/PromoHeader";
import React, { useContext, useState } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  Grid,
  Header as SHeader,
  Image,
  Modal,
  Segment,
  TextArea,
} from "semantic-ui-react";
import { Header } from "../components/Header";
import { useTranslation } from "react-i18next";
import { AuthContext } from "utils/AuthContext";

function Promo() {
  const { t } = useTranslation();
  return (
    <Form
      style={{
        height: "600px",
        background:
          "#000 url(https://motionarray.imgix.net/preview-400914-6SoVGPExfQJ2chbx-large.jpg?w=1400&q=60&fit=max&auto=format) center no-repeat",
        backgroundSize: "cover",
      }}
    >
      <Container style={{ display: "flex", height: "100%" }}>
        <div style={{ width: "50%", flexShrink: 0 }}></div>
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <section
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(15px)",
              borderRadius: "10px",
              padding: "2rem",
            }}
          >
            <h2>{t("pages.index.title")}</h2>
            <p style={{ fontSize: "13pt" }}>{t("pages.index.subtitle")}</p>
            <EventArrange />
          </section>
        </div>
      </Container>
    </Form>
  );
}

function EventArrange() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { auth } = useContext(AuthContext);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {};

  return (
    <>
      <TextArea
        style={{ resize: "none" }}
        onChange={(e) => setDescription(e.target.value)}
        value={description}
      ></TextArea>
      <div style={{ textAlign: "right", marginTop: "1rem" }}>
        <Button primary onClick={() => setOpen(true)}>
          {t("pages.index.arrange_event")}
        </Button>
      </div>
      <Modal size={"small"} open={open} onClose={() => setOpen(false)}>
        <Modal.Header>Arrange a meeting</Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit}>
            <Form.Field>
              <label>First name:</label>
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
              <label>Last name:</label>
              <input
                placeholder="Smith"
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
              />
            </Form.Field>
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
              <label>Password:</label>
              <input
                placeholder=""
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </Form.Field>
            <Form.Field>
              <label>Description:</label>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                value={description}
              ></textarea>
            </Form.Field>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button type="button">Cancel</Button>
              <Button primary type="submit">
                Send
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    </>
  );
}

function PromoAdvantages() {
  const { t } = useTranslation();
  return (
    <Segment id="advantages" style={{ padding: "8em 0em" }} vertical>
      <Grid container stackable verticalAlign="middle">
        <Grid.Row>
          <Grid.Column width={8}>
            <SHeader as="h3" style={{ fontSize: "2em" }}>
              {t("pages.index.promo_title1")}
            </SHeader>
            <p style={{ fontSize: "1.33em" }}>
              {t("pages.index.promo_content1")}
            </p>
            <SHeader as="h3" style={{ fontSize: "2em" }}>
              {t("pages.index.promo_title2")}
            </SHeader>
            <p style={{ fontSize: "1.33em" }}>
              {t("pages.index.promo_content2")}
            </p>
          </Grid.Column>
          <Grid.Column floated="right" width={6}>
            <Image size="medium" src="/assets/lawyer.png" />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column textAlign="center">
            <Button size="huge">{t("pages.index.arrange_event")}</Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  );
}

function Lawyers() {
  return (
    <Container id="lawyers">
      <h1 style={{ marginTop: "20px" }}>Our lawyers</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "23% 23% 23% 23%",
          gridAutoRows: "auto",
          gap: "30px",
          width: "100%",
        }}
      >
        <Card
          image="https://react.semantic-ui.com/images/avatar/large/elliot.jpg"
          header="Elliot Baker"
          meta="Lawyer"
          style={{ margin: 0 }}
          description="Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat."
        />
        <Card
          image="https://react.semantic-ui.com/images/avatar/large/elliot.jpg"
          header="Elliot Baker"
          meta="Lawyer"
          style={{ margin: 0 }}
          description="Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat."
        />
        <Card
          image="https://react.semantic-ui.com/images/avatar/large/elliot.jpg"
          header="Elliot Baker"
          meta="Lawyer"
          style={{ margin: 0 }}
          description="Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat."
        />
        <Card
          image="https://react.semantic-ui.com/images/avatar/large/elliot.jpg"
          header="Elliot Baker"
          meta="Lawyer"
          style={{ margin: 0 }}
          description="Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat."
        />
      </div>
    </Container>
  );
}

export default function Home() {
  return (
    <section>
      <Header />
      <PromoHeader />
      <Promo />
      <PromoAdvantages />
      <Lawyers />
    </section>
  );
}
