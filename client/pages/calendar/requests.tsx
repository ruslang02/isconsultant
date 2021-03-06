import { PendingEvent } from "@common/models/pending-event.entity"
import { User } from "@common/models/user.entity"
import { Page } from "components/Page"
import React from "react"
import { Button, Comment, Form } from "semantic-ui-react"

const requests: PendingEvent[] = [{
  id: 1,
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis sem scelerisque, lobortis leo eget, lacinia est. Aliquam fermentum dictum sapien, in tempus turpis malesuada in. Sed lobortis nisl sed quam consectetur, eu suscipit purus vehicula. In congue, arcu in blandit consequat, eros justo consequat felis, et vulputate quam libero et augue.",
  from: {
    id: 1,
    first_name: "Ruslan",
    last_name: "Garifullin",
    avatar: "https://react.semantic-ui.com/images/avatar/small/steve.jpg"
  } as User,
  start_timestamp: new Date(1100000000000),
  end_timestamp: new Date(1102000000000),
  participants: []
}]

const RequestsPage = () => {
  return (
    <Page>
      <h2>Pending advice requests</h2>
      { requests.map(r => (
        <Comment.Group>
          <Comment>
            <Comment.Avatar as='a' src={r.from.avatar} />
            <Comment.Content>
              <Comment.Author as='a'>{r.from.first_name} {r.from.last_name}</Comment.Author>
              <Comment.Metadata>
                <div>Starting at {r.start_timestamp.toLocaleString()} until {r.end_timestamp.toLocaleString()}</div>
              </Comment.Metadata>
              <Comment.Text>{r.description}</Comment.Text>
              <Form reply>
                <Button
                  content='Accept'
                  labelPosition='left'
                  icon='checkmark'
                  color='green'
                />
                <Button
                  secondary
                  content='Decline'
                />
              </Form>
            </Comment.Content>
          </Comment>
        </Comment.Group>
      ))}
    </Page>
  )
}

export default RequestsPage;