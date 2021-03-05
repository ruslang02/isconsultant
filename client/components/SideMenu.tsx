import { useRouter } from "next/router";
import React from "react";
import { Menu } from "semantic-ui-react";

export const SideMenu: React.FC = () => {
  const router = useRouter();

  return (
    <Menu secondary vertical style={{ margin: 0 }}>
      <Menu.Item
        name='Profile'
        active={router.pathname.includes('/profile/@me')}
        link
        onClick={() => router.push('/profile/@me')}
      />
      <Menu.Item
        name='Calendar'
        active={router.pathname.includes('/calendar')}
        link
        onClick={() => router.push('/calendar')}
      />
      <Menu.Item
        name='Lawyers Directory'
        active={router.pathname.includes('/lawyers')}
        link
        onClick={() => router.push('/lawyers')}
      />
    </Menu>
  )
}