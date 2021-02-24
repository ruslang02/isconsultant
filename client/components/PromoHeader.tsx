import React from "react";
import { Menu } from "semantic-ui-react";
import { useTranslation } from "react-i18next";

export function PromoHeader() {
  const { t } = useTranslation();
  return (
    <Menu
      borderless
      style={{
        margin: 0,
        position: "sticky",
        top: "84px",
        zIndex: 100,
        borderRadius: 0,
        justifyContent: "center",
      }}
    >
      <Menu.Item>
        <a href="#advantages">{t("promo_header.advantages")}</a>
      </Menu.Item>

      <Menu.Item>
        <a href="#arrange">{t("promo_header.arrange_event")}</a>
      </Menu.Item>

      <Menu.Item>
        <a href="#lawyers">{t("promo_header.lawyers")}</a>
      </Menu.Item>

      <Menu.Item>{t("header.register")}</Menu.Item>
    </Menu>
  );
}
