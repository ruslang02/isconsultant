import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  Grid,
  Header as SHeader,
  Icon,
  Image,
  Message,
  Modal,
  Segment,
  Statistic,
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
import { GetUserDto } from "@common/dto/get-user.dto";
import Head from "next/head";

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
      <Head>
        <title>ISConsultant</title>
      </Head>
      <Container
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <section
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(15px)",
            borderRadius: "10px",
            padding: "2rem",
            maxWidth: "500px",
          }}
        >
          <h2>{t("pages.index.title")}</h2>
          <p style={{ fontSize: "13pt" }}>{t("pages.index.subtitle")}</p>
          <Button primary fluid size="big" onClick={() => setOpen(true)}>
            {t("pages.index.arrange_event")}
          </Button>
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
      </Grid>
    </Segment>
  );
}

function Lawyers() {
  const [list, setList] = useState<GetUserDto[]>([]);
  const [open, setOpen] = useState(false);
  const [lawyer, setLawyer] = useState("");
  useEffect(() => {
    (async () => {
      const { data } = await api.get<GetUserDto[]>("/users/top");
      setList(data);
    })();
  }, []);

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
        {list.map((l) => (
          <Card
            image={l.avatar}
            header={l.first_name + " " + l.last_name}
            meta={`Rating: ${l.rating}`}
            style={{ margin: 0 }}
            as="a"
            onClick={() => router.push(`/profile/${l.id}`)}
            description={
              <div style={{ marginTop: "10px" }}>
                <Button
                  primary
                  fluid
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLawyer(l.id);
                    setOpen(true);
                  }}
                >
                  Request a meeting
                </Button>
              </div>
            }
          />
        ))}
      </div>
      <EventArrange
        open={open}
        onClose={() => setOpen(false)}
        lawyerId={lawyer}
      />
    </Container>
  );
}

export function Footer() {
  return (
    <>
      <br />
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid lightgray",
          padding: "2rem",
          textAlign: "center",
          background: "#eee",
        }}
      >
        <Container style={{ display: "flex", marginBottom: "2rem" }}>
          <div>
            <Statistic size="small">
              <Statistic.Value>
                <Icon name="video" /> Modern
              </Statistic.Value>
              <Statistic.Label>
                We use modern WebRTC solutions <br />
                to make your calls fast, flexible and secure.
              </Statistic.Label>
            </Statistic>
          </div>
          <div style={{ flexGrow: 1 }}></div>
          <div>
            <Statistic size="small">
              <Statistic.Value>
                <Icon name="users" /> Quality
              </Statistic.Value>
              <Statistic.Label>
                We are a professional team <br />
                which knows its job.
              </Statistic.Label>
            </Statistic>
          </div>
          <div style={{ flexGrow: 1 }}></div>
          <div>
            <Statistic size="small">
              <Statistic.Value>
                <Icon name="file" /> Safety
              </Statistic.Value>
              <Statistic.Label>
                We guarantee our customers
                <br />
                that their data is well organized.
              </Statistic.Label>
            </Statistic>
          </div>
        </Container>
        <p style={{ fontSize: "16px" }}>&copy; 2020-2021. ISConsultant.</p>
      </div>
    </>
  )
}

export default function Home() {
  const router = useRouter();
  const { verify } = router.query;
  const [, setMessage] = useContext(MessageContext);

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
      <Promo />
      <PromoAdvantages />
      <Lawyers />
    </section>
  );
}
