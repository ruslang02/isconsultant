import { GetUserDto } from "@common/dto/get-user.dto";
import { Header } from "components/Header";
import { Page } from "components/Page";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Container, Icon, Image, Segment } from "semantic-ui-react";
import styles from "styles/Page.module.css";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";

const Empty = () => {
  const [user, setUser] = useState<GetUserDto | undefined>();
  const router = useRouter();
  console.log(router);
  const { id } = router.query;

  useEffect(() => {
    (async () => {
      const { data } = await api.get<GetUserDto>(`/users/${id}`);
      setUser(data);
    })()
  }, [id]);
  return (
    <Page>
      <Segment>
        <div style={{ float: "left", margin: "0 2rem 0 0", textAlign: "center" }}>
          <Image size="small" src={user?.avatar} avatar />
          <br />
          <br />
          <div><a href="#"><Icon name="edit" /> Change avatar</a></div>
        </div>
        <div>
          <h2>
            {user?.last_name}
            {" "}
            {user?.first_name}
            {" "}
            {user?.middle_name}
          </h2>
          <p>{user?.type}</p>
          <p>
            <b>E-mail: </b>
            {user?.email || <i>not set</i>}
          </p>
          <p>
            <b>Phone number: </b>
            {user?.phone || <i>not set</i>}
          </p>
          <p>
            <b>Rating: </b>
            {user?.rating || <i>not set</i>}
          </p>
          <p>
            <b>Created at: </b>
            {user?.created_timestamp ? new Date(user.created_timestamp).toLocaleDateString() : <i>not set</i>}
          </p>
        </div>
        <div style={{ textAlign: "right", margin: "1rem" }}>
          <a href="#" style={{ color: "red" }}><Icon name="envelope" /> Send feedback</a>
        </div>
      </Segment>
    </Page>
  );
};

export default Empty;
