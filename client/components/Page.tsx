import React, { ReactNode } from "react";
import { Container } from "semantic-ui-react";
import { Header } from "./Header";
import styles from "styles/Page.module.css";
import { SideMenu } from "./SideMenu";

export const Page: React.FC<{ children?: ReactNode, hasMenu?: boolean }> = ({ children, hasMenu }) => {
  return (
    <section>
      <Header />
      <Container className={styles.page_container}>
        <div className={styles.page}>
          {children}
        </div>
        { hasMenu !== false && <SideMenu /> }
      </Container>
    </section>
  )
}