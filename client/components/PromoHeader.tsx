import React from 'react';
import { Menu } from 'semantic-ui-react';
import { useTranslation } from "react-i18next";

export function PromoHeader() {
  const { t } = useTranslation();
  return (
    <Menu borderless style={{ margin: 0, position: 'sticky', top: '84px', zIndex: 100, borderRadius: 0, justifyContent: 'center' }}>
      <Menu.Item>
          {t('promo_header.advantages')}
      </Menu.Item>

      <Menu.Item>
        {t('promo_header.arrange_event')}
      </Menu.Item>

      <Menu.Item>
        {t('promo_header.lawyers')}
      </Menu.Item>
          
      <Menu.Item>
        {t('header.register')}
      </Menu.Item>
    </Menu>
  )
}