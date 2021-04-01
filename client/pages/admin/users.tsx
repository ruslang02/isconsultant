import { GetUserInfoDto } from "@common/dto/get-user-info.dto";
import { PatchUserDto } from "@common/dto/patch-user.dto";
import { EventArrange } from "components/EventArrange";
import { Page } from "components/Page";
import React, { useEffect, useState } from "react";
import { Button, Item } from "semantic-ui-react";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";

const UsersPage = () => {
  const [lawyers, setLawyers] = useState<GetUserInfoDto[]>([]);
  const [auth] = useAuth();
  const [open, setOpen] = useState(false);
  const [lawyerId, setLawyerId] = useState<string | undefined>(undefined);

  async function reload() {
    const { data } = await api.get<GetUserInfoDto[]>("/users");

    setLawyers(data);
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <Page>
      <h2>Users</h2>
      <Item.Group>
        {lawyers?.map((u) => (
          <Item>
            <Item.Image avatar size="tiny" src={u.avatar} />
            <Item.Content>
              <Item.Header>
                <a href={`/profile/${u.id}`}>
                  {u.first_name} {u.last_name}
                </a>
              </Item.Header>
              <Item.Meta>{u.type[0].toUpperCase() + u.type.slice(1)}</Item.Meta>
              <Item.Description>
                Rating: {u.rating}
                <br />
                Joined at: {new Date(u.created_timestamp).toLocaleDateString()}
                <br />
                Verified: {u.verified ? "Yes" : "No"}
              </Item.Description>
              <Button
                floated="right"
                content="Deverify"
                color="red"
                onClick={() => {
                  api.patch(`/users/${u.id}`, {
                    verified: false,
                  } as PatchUserDto);
                  reload();
                }}
              />
              <Button
                floated="right"
                content="Change role"
                secondary
                onClick={() => {
                  const answer = prompt(
                    'New User Role (one of "admin", "moderator", "lawyer", "client"):'
                  );
                  if (
                    ["admin", "moderator", "lawyer", "client"].includes(answer)
                  ) {
                    api.patch(`/users/${u.id}`, {
                      type: answer,
                    } as PatchUserDto);
                    reload();
                  }
                }}
              />
            </Item.Content>
          </Item>
        ))}
      </Item.Group>
    </Page>
  );
};

export default UsersPage;
