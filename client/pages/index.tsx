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
import { useTranslation } from "react-i18next";

function Promo() {
    const { t } = useTranslation();
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
                        <h2>{t('pages.index.title')}</h2>
                        <p style={{ fontSize: "13pt" }}>
                            {t('pages.index.subtitle')}
                        </p>
                        <TextArea style={{ resize: "none" }}></TextArea>
                        <div style={{ textAlign: "right", marginTop: "1rem" }}>
                            <Button primary>{t('pages.index.arrange_event')}</Button>
                        </div>
                    </section>
                </div>
            </Container>
        </Form>
    );
}

function PromoAdvantages() {
    const { t } = useTranslation();
    return (
        <Segment style={{ padding: "8em 0em" }} vertical>
            <Grid container stackable verticalAlign="middle">
                <Grid.Row>
                    <Grid.Column width={8}>
                        <SHeader as="h3" style={{ fontSize: "2em" }}>
                            {t('pages.index.promo_title1')}
                        </SHeader>
                        <p style={{ fontSize: "1.33em" }}>
                            {t('pages.index.promo_content1')}
                        </p>
                        <SHeader as="h3" style={{ fontSize: "2em" }}>
                            {t('pages.index.promo_title2')}
                        </SHeader>
                        <p style={{ fontSize: "1.33em" }}>
                            {t('pages.index.promo_content2')}
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
                        <Button size="huge">{t('pages.index.arrange_event')}</Button>
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
