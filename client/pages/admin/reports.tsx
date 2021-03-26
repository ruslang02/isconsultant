import { GetPendingEventDto } from "@common/dto/get-pending-event.dto";
import { GetReportDto } from "@common/dto/get-report.dto";
import { PendingEvent } from "@common/models/pending-event.entity";
import { User } from "@common/models/user.entity";
import { Page } from "components/Page";
import React, { useEffect, useState } from "react";
import { Button, Comment, Form } from "semantic-ui-react";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";

const RequestsPage = () => {
  const [reports, setReports] = useState<GetReportDto[]>([]);
  const [auth] = useAuth();

  async function loadReports() {
      const { data } = await api.get<GetReportDto[]>("/reports");
      setReports(data);
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <Page>
      <h2>Reports</h2>
      {reports.length
        ? reports.map((r) => (
          <Comment.Group>
            <Comment>
              <Comment.Avatar as="a" src={r.author.avatar} />
              <Comment.Content>
                <Comment.Author as="a">
                  {r.author.first_name} {r.author.last_name}
                </Comment.Author>
                <Comment.Metadata>
                  <div>
                    To {r.receiver.first_name} {r.receiver.last_name}
                  </div>
                </Comment.Metadata>
                <Comment.Text>
                  <p>
                  <b>Description</b><br />
                  {r.description}
                  </p>
                  <p>
                  <b>Status</b><br />
                  {r.status_localized}
                  </p>
                  <p>
                  <b>Decision</b><br />
                  {r.decision ?? <i>not made yet</i>}
                  </p>
                </Comment.Text>
                <Form reply>
                  <Button
                    content="Set decision"
                    labelPosition="left"
                    icon="edit"
                    primary
                    onClick={() => {
                      const decision = prompt("Report decision:");
                      if (decision) {
                        api.patch(`/reports/${r.id}`, { decision }).then(loadReports);
                      }
                    }}
                  />
                  <Button
                    secondary
                    content="Set status"
                    onClick={() => {
                      const status = prompt("Report status (one of ['awaiting', 'processing', 'complete']):");
                      if (status && ["awaiting", "processing", "complete"].includes(status)) {
                        api.patch(`/reports/${r.id}`, { status }).then(loadReports);
                      }
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
