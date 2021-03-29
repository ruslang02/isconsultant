import { GetPendingEventDto } from "@common/dto/get-pending-event.dto";
import { PendingEvent } from "@common/models/pending-event.entity";
import { User } from "@common/models/user.entity";
import { Page } from "components/Page";
import React, { useEffect, useState } from "react";
import { Button, Comment, Form } from "semantic-ui-react";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";

const RequestsPage = () => {
  const [requests, setRequests] = useState<GetPendingEventDto[]>([]);
  const [auth] = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await api.get<GetPendingEventDto[]>(`/events/requests${["admin", "moderator"].includes(auth?.user?.type) ? "/all" : ""}`);
      setRequests(data);
    })();
  }, []);

  return (
    <Page>
      <h2>Pending advice requests</h2>
      {requests.length
        ? requests.map((r) => (
          <Comment.Group>
            <Comment>
              <Comment.Avatar as="a" src={r.from.avatar} />
              <Comment.Content>
                <Comment.Author as="a">
                  {r.from.first_name} {r.from.last_name}
                </Comment.Author>
                <Comment.Metadata>
                  <div>
                    Starting at {new Date(r.timespan_start).toLocaleString()}{" "}
                      until {new Date(r.timespan_end).toLocaleString()}
                  </div>
                </Comment.Metadata>
                <Comment.Metadata>
                  <div>
                    To: {r.lawyer ? `${r.lawyer.first_name} ${r.lawyer.last_name}` : 'Anyone'}
                  </div>
                </Comment.Metadata>
                <Comment.Text>{r.description}</Comment.Text>
                <Form reply>
                  <Button
                    content="Accept"
                    labelPosition="left"
                    icon="checkmark"
                    color="green"
                    onClick={() => {
                      api
                        .post("/events/request/accept", { id: r.id })
                        .then(() => {
                          setRequests((v) => v.filter((_) => _.id != r.id));
                        });
                    }}
                  />
                  <Button
                    secondary
                    content="Decline"
                    onClick={() => {
                      api
                        .post("/events/request/decline", { id: r.id })
                        .then(() => {
                          setRequests((v) => v.filter((_) => _.id != r.id));
                        });
                    }}
                  />
                </Form>
              </Comment.Content>
            </Comment>
          </Comment.Group>
        ))
        : <div style={{ color: "grey", textAlign: "center", margin: "1rem" }}>No items found.</div>}
    </Page>
  );
};

export default RequestsPage;
