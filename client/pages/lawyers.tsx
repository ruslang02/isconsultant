import { GetUserInfoDto } from "@common/dto/get-user-info.dto";
import { Page } from "components/Page";
import React, { useEffect, useState } from "react";
import { Button, Item } from "semantic-ui-react";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";

const LawyersPage = () => {
  const [lawyers, setLawyers] = useState<GetUserInfoDto[]>([]);
  const [auth] = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await api.get<GetUserInfoDto[]>("/users");

      setLawyers(data);
    })();
  }, []);

  return (
    <Page>
      <h2>
        Lawyers Directory
        <br />
        <small style={{ color: "grey" }}>
          View all lawyers in ISConsultant.
        </small>
      </h2>
      <Item.Group>
        {lawyers?.map(u => (
          <Item>
            <Item.Image
              avatar
              size="tiny"
              src={u.avatar}
            />
            <Item.Content>
              <Item.Header as="a">{u.first_name} {u.last_name}</Item.Header>
              <Item.Description>Rating: {u.rating}<br />Joined at: {new Date(u.created_timestamp).toLocaleDateString()}
              </Item.Description>
              <Button floated="right" content="Request a meeting" primary />
            </Item.Content>
          </Item>
        ))}
      </Item.Group>
    </Page>
  );
};

export default LawyersPage;
