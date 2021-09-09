import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Button, Container, Icon, Image } from "semantic-ui-react";
import styles from "styles/Header.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "utils/useAuth";
import { PHONE_NUMBER } from "../utils/Constants";
import { UserContext } from "../utils/UserContext";


function AccountMenu() {
    const [auth, setAuth] = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    return typeof window !== "undefined" && auth?.user ? (
        <div className={styles.account}>
            <Image src={auth.user.avatar} avatar />
            <span>{ auth.user.last_name } { auth.user.first_name[0] }.</span>
            <Button icon onClick={() => router.push("/profile/@me")}>
                <Icon name="user" />
            </Button>
            <Button secondary onClick={() => setAuth(() => ({}))}>Sign out</Button>
        </div>
    ) : (
        <span>
            <Button onClick={() => router.push("/register")}>{ t("header.register") }</Button>
            <Button secondary onClick={() => router.push("/login")}>{ t("header.login") }</Button>
        </span>
    );
}

function CallPanel() {
    const { t } = useTranslation();
    return (
        <section className={styles.CallPanel}>
            <Icon inverted circular name='call' color='green' size='big' />
            <div className={styles.CallPanel_text}>
                <div>{ t("header.call_us") }</div>
                <b>{ PHONE_NUMBER }</b>
            </div>
        </section>
    );
}

export function Header({ promo }: { promo?: boolean }) {
    return (
        <header className={styles.Header}>
            <Container>
                <div className={styles.Header_container}>
                    <Link href="/"><a><Image src="/assets/logo.png" height="24" /></a></Link>
                    { promo ? <CallPanel /> : <div style={{ flexGrow: 1 }} /> }
                    <AccountMenu />
                </div>
            </Container>
        </header>
    );
}
