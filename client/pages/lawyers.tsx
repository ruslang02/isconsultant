import { GetUserInfoDto } from "@common/dto/get-user-info.dto";
import { Page } from "components/Page";
import React, { useEffect, useState } from "react";
import { Pagination, Icon, Item, Button } from "semantic-ui-react";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";

const LawyersPage = () => {
  const [lawyers, setLawyers] = useState<GetUserInfoDto[]>([]);
  const [auth] = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await api.get<GetUserInfoDto[]>("/users", {
        headers: {
          Authorization: "Bearer " + auth.access_token,
        },
      });

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
        { lawyers?.map(u => (
        <Item>
          <Item.Image
            size="tiny"
            src={u.avatar}
          />
          <Item.Content>
            <Item.Header as="a">{u.first_name} {u.last_name}</Item.Header>
            <Item.Description>
              {u.middle_name}
            </Item.Description>
            <Item.Extra>More Details</Item.Extra>
            <Button floated="right" content="Request a meeting" primary />
          </Item.Content>
        </Item>
        ))}
      </Item.Group>
      <Pagination
        defaultActivePage={1}
        ellipsisItem={{
          content: <Icon name="ellipsis horizontal" />,
          icon: true,
        }}
        firstItem={{ content: <Icon name="angle double left" />, icon: true }}
        lastItem={{ content: <Icon name="angle double right" />, icon: true }}
        prevItem={{ content: <Icon name="angle left" />, icon: true }}
        nextItem={{ content: <Icon name="angle right" />, icon: true }}
        totalPages={3}
      />
    </Page>
  );
};

export default LawyersPage;
