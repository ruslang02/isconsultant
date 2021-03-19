import { PromoHeader } from "components/PromoHeader";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  Grid,
  Header as SHeader,
  Image,
  Message,
  Modal,
  Segment,
  TextArea,
} from "semantic-ui-react";
import { Header } from "../components/Header";
import { useTranslation } from "react-i18next";
import router, { useRouter } from "next/router";
import { useAuth } from "utils/useAuth";
import { api } from "utils/api";
import { ArrangeEventDto } from "@common/dto/arrange-event.dto";
import { CreateUserDto } from "@common/dto/create-user.dto";
import { AxiosError } from "@common/node_modules/axios";
import { MessageContext } from "utils/MessageContext";
import { ErrorDto } from "@common/dto/error.dto";
import { EventArrange } from "components/EventArrange";

function Promo() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");

  return (
    <Form
      style={{
        height: "600px",
        background:
          "#000 url(https://motionarray.imgix.net/preview-400914-6SoVGPExfQJ2chbx-large.jpg?w=1400&q=60&fit=max&auto=format) center no-repeat",
        backgroundSize: "cover",
      }}
    >
      <Container style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "flex-end" }}>
          <section
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(15px)",
              borderRadius: "10px",
              padding: "2rem",
              maxWidth: "500px"
            }}
          >
            <h2>{t("pages.index.title")}</h2>
            <p style={{ fontSize: "13pt" }}>{t("pages.index.subtitle")}</p>
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
            <EventArrange
              open={open}
              onClose={() => setOpen(false)}
              description={description}
            />
          </section>
      </Container>
    </Form>
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
  const router = useRouter();
  const { verify } = router.query;
  const { setValue: setMessage } = useContext(MessageContext);

  useEffect(() => {
    if (verify == "success") {
      setMessage("Your account was verified.");
    } else if (verify) {
      setMessage("There was an error verifying your account.");
    }
  }, [verify]);

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
