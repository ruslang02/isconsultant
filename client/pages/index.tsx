import { PromoHeader } from "components/PromoHeader";
import React from "react";
import {
    Button,
    Container,
    Form,
    Grid,
    Header as SHeader,
    Image,
    Segment,
    TextArea
} from "semantic-ui-react";
import { Header } from "../components/Header";

function Promo() {
    return (
        <Form style={{ height: "600px", background: '#000 url(https://motionarray.imgix.net/preview-400914-6SoVGPExfQJ2chbx-large.jpg?w=1400&q=60&fit=max&auto=format) center no-repeat', backgroundSize: 'cover' }}>
            <Container style={{ display: "flex", height: "100%" }}>
                <div style={{ width: "50%", flexShrink: 0 }}></div>
                <div
                    style={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center"
                    }}>
                    <section
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(15px)",
                            borderRadius: "10px",
                            padding: "2rem"
                        }}>
                        <h2>Получите юридическую консультацию бесплатно!</h2>
                        <p style={{ fontSize: "13pt" }}>
                            С помощью нашего сервера вы можете получить помощь
                            по вопросам права совершенно бесплатно. Вам поможет
                            команда специалистов нашей компании, имеющих высокую
                            квалификацию в юридической сфере.
                            <br />
                            <br />
                            Заполните форму сейчас и получите консультацию в
                            течение текущего дня.
                        </p>
                        <TextArea style={{ resize: "none" }}></TextArea>
                        <div style={{ textAlign: "right", marginTop: "1rem" }}>
                            <Button primary>Оставить заявку</Button>
                        </div>
                    </section>
                </div>
            </Container>
        </Form>
    );
}

function PromoAdvantages() {
    return (
        <Segment style={{ padding: "8em 0em" }} vertical>
            <Grid container stackable verticalAlign="middle">
                <Grid.Row>
                    <Grid.Column width={8}>
                        <SHeader as="h3" style={{ fontSize: "2em" }}>
                            Высококвалифицированные специалисты
                        </SHeader>
                        <p style={{ fontSize: "1.33em" }}>
                            Все консультанты являются действующими юристами с
                            большим опытом и багажем знаний. Используя наш
                            сервис, вы можете доверять нашим сотрудникам так же,
                            как и при походе к нотариусу или иному центру
                            юридической помощи.
                        </p>
                        <SHeader as="h3" style={{ fontSize: "2em" }}>
                            Современные технологии
                        </SHeader>
                        <p style={{ fontSize: "1.33em" }}>
                            Благодаря технологии WebRTC, вы можете начать Вашу
                            консультацию на любом устройстве: ноутбук, смартфон,
                            планшет - не устанавливая никаких приложений, прямо
                            на нашем веб-сайте.
                        </p>
                    </Grid.Column>
                    <Grid.Column floated="right" width={6}>
                        <Image
                            size="medium"
                            src="/assets/lawyer.png"
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column textAlign="center">
                        <Button size="huge">Оставить заявку</Button>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    );
}

export default function Home() {
    return (
        <section>
            <Header />
            <PromoHeader />
            <Promo />
            <PromoAdvantages />
        </section>
    );
}
