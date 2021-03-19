import { useRouter } from "next/router";
import React from "react";
import { Menu } from "semantic-ui-react";
import { useAuth } from "utils/useAuth";

export const SideMenu: React.FC = () => {
  const router = useRouter();
  const [auth] = useAuth();

  return (
    <Menu secondary vertical style={{ margin: 0 }}>
      <Menu.Item
        name='Profile'
        active={router.pathname.includes('/profile/@me')}
        link
        onClick={() => router.push('/profile/@me')}
      />
      { auth?.user?.type !== "client" && <Menu.Item
        name='Meetings'
        active={router.pathname.includes('/calendar')}
        link
        onClick={() => router.push('/calendar')}
      />}
      { auth?.user?.type === "client" && <Menu.Item
        name='Meetings'
        active={router.pathname.includes('/meetings')}
        link
        onClick={() => router.push('/meetings')}
      />}
      <Menu.Item
        name='Lawyers Directory'
        active={router.pathname.includes('/lawyers')}
        link
        onClick={() => router.push('/lawyers')}
      />
    </Menu>
  )
}