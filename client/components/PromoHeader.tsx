import React from 'react';
import { Menu } from 'semantic-ui-react';

export function PromoHeader() {
  return (
    <Menu borderless style={{ margin: 0, position: 'sticky', top: '84px', zIndex: 100, borderRadius: 0, justifyContent: 'center' }}>
      <Menu.Item>
          Преимущества
      </Menu.Item>

      <Menu.Item>
        Оставить заявку
      </Menu.Item>

      <Menu.Item>
        Наши юристы
      </Menu.Item>
          
      <Menu.Item>
        Регистрация
      </Menu.Item>
    </Menu>
  )
}