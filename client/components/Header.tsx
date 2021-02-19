import { useContext } from 'react';
import { useTranslation } from "react-i18next";
import { Button, Container, Icon, Image } from 'semantic-ui-react';
import { UserContext } from '../utils/UserContext';
import { PHONE_NUMBER } from '../utils/Constants';
import styles from 'styles/Header.module.css';


function AccountMenu() {
  const user = useContext(UserContext);
  const { t } = useTranslation();

  return user ? (
    <Image src={user.avatar} />
  ) : (
      <div>
        <Button primary>{t('header.register')}</Button>
        <Button secondary>{t('header.login')}</Button>
      </div>
    )
}

function CallPanel() {
  const { t } = useTranslation();
  return (
    <section className={styles.CallPanel}>
      <Icon inverted circular name='call' color='green' size='big' />
      <div className={styles.CallPanel_text}>
        <div>{t('header.call_us')}</div>
        <b>{PHONE_NUMBER}</b>
      </div>
    </section>
  )
}

export function Header() {
  return (
    <header className={styles.Header}>
      <Container>
        <div className={styles.Header_container}>
          <Image src="/assets/logo.png" height="24" />
          <CallPanel />
          <AccountMenu />
        </div>
      </Container>
    </header>
  )
}
