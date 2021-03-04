import { useRouter } from "next/router";
import React from "react";
import { Menu } from "semantic-ui-react";

export const SideMenu: React.FC = () => {
  const router = useRouter();

  return (
    <Menu secondary vertical style={{ margin: 0 }}>
      <Menu.Item
        name='Profile'
        active={router.pathname === '/profile/@me'}
      // onClick={this.handleItemClick}
      />
      <Menu.Item
        name='Calendar'
        active={router.pathname === '/calendar'}
      // onClick={this.handleItemClick}
      />
    </Menu>
  )
}