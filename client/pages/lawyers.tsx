import { GetUserInfoDto } from "@common/dto/get-user-info.dto";
import { EventArrange } from "components/EventArrange";
import { Page } from "components/Page";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button, Item } from "semantic-ui-react";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";

const LawyersPage = () => {
  const [lawyers, setLawyers] = useState<GetUserInfoDto[]>([]);
  const [auth] = useAuth();
  const [open, setOpen] = useState(false);
  const [lawyerId, setLawyerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const { data } = await api.get<GetUserInfoDto[]>("/users");

      setLawyers(data.filter((_) => _.type === "lawyer"));
    })();
  }, []);

  return (
    <Page>
      <Head>
        <title>Lawyers - ISConsultant</title>
      </Head>
      <h2>
        Lawyers Directory
        <br />
        <small style={{ color: "grey" }}>
          View all lawyers in ISConsultant.
        </small>
      </h2>
      <Item.Group>
        {lawyers?.map((u) => (
          <Item>
            <Item.Image avatar src={u.avatar}  style={{width: "80px", height: "80px", objectFit: "cover", overflow: "hidden", borderRadius: "50%"}} />
            <Item.Content>
              <Item.Header>
                <Link href={`/profile/${u.id}`}>
                  <a>{u.first_name} {u.last_name}</a>
                </Link>
              </Item.Header>
              <Item.Description>
                Rating: {u.rating}
                <br />
                Joined at: {new Date(u.created_timestamp).toLocaleDateString()}
              </Item.Description>
              <Button
                floated="right"
                content="Request a meeting"
                primary
                onClick={() => {
                  setLawyerId(u.id);
                  setOpen(true);
                }}
              />
            </Item.Content>
          </Item>
        ))}
      </Item.Group>
      <EventArrange
        open={open}
        onClose={() => {
          setOpen(false);
          setLawyerId(undefined);
        }}
        lawyerId={lawyerId}
      />
    </Page>
  );
};

export default LawyersPage;
