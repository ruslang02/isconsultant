import { useContext } from 'react';
import { Button, Container, Icon, Image } from 'semantic-ui-react';
import { UserContext } from '../utils/UserContext';
import { PHONE_NUMBER } from '../utils/Constants';
import styles from './Header.module.css';

function AccountMenu() {
  const user = useContext(UserContext);

  return user ? (
    <Image src={user.avatar} />
  ) : (
      <div>
        <Button primary>Регистрация</Button>
        <Button secondary>Войти</Button>
      </div>
    )
}

function CallPanel() {
  return (
    <section className={styles.CallPanel}>
      <Icon inverted circular name='call' color='green' size='big' />
      <div className={styles.CallPanel_text}>
        <div>Позвоните нам!</div>
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
