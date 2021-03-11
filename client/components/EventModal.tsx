import { GetEventDto } from "@common/dto/get-event.dto";
import React, { useState } from "react";
import { Button, Dropdown, Form, List, Modal } from "semantic-ui-react";
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

interface EventModalProps {
  editable?: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (e: GetEventDto) => void;
  event: GetEventDto;
}

export function EventModal({ editable, open, onClose, event, onSubmit }: EventModalProps) {
  const [temp, setTemp] = useState(event);
  const [files, setFiles] = useState([])

  return (
    <Modal onClose={() => onClose()} open={open}>
      <Modal.Header>Update meeting info</Modal.Header>
      <Modal.Content style={{ display: "flex" }}>
        <section style={{ borderRight: "1px solid grey", paddingRight: "1.5rem", marginRight: "1.5rem", width: "100%" }}>
          <Form>
            <Form.Field>
              <Form.Input label="Title" value={event?.title} />
            </Form.Field>
            <Form.Field>
              <Form.TextArea label="Description" value={event?.title} />
            </Form.Field>
            <Form.Field inline>
              <label>Starts at</label>
              <SemanticDatepicker value={event && new Date(event.timespan_start)} />{" "}&nbsp;
              <input type="time" value={event && new Date(event.timespan_start).toTimeString()} />
            </Form.Field>
            <Form.Field inline>
              <label>Ends at</label>
              <SemanticDatepicker value={event && new Date(event.timespan_end)} />{" "}&nbsp;
              <input type="time" value={event && new Date(event.timespan_end).toTimeString()} />
            </Form.Field>
            <Form.Field inline>
              <label>Participants</label>
              <Dropdown multiple selection fluid value={event?.participants} />
            </Form.Field>
          </Form>
        </section>
        <section style={{ width: "100%" }}>
          <h4>Shared files</h4>
          <List divided relaxed>
            <List.Item>
              <List.Icon name='github' size='large' verticalAlign='middle' />
              <List.Content>
                <List.Header as='a'>Semantic-Org/Semantic-UI</List.Header>
                <List.Description as='a'>Updated 10 mins ago</List.Description>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name='github' size='large' verticalAlign='middle' />
              <List.Content>
                <List.Header as='a'>Semantic-Org/Semantic-UI-Docs</List.Header>
                <List.Description as='a'>Updated 22 mins ago</List.Description>
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name='github' size='large' verticalAlign='middle' />
              <List.Content>
                <List.Header as='a'>Semantic-Org/Semantic-UI-Meteor</List.Header>
                <List.Description as='a'>Updated 34 mins ago</List.Description>
              </List.Content>
            </List.Item>
          </List>
          <h4>Chat log</h4>
          <a href="#">Download</a>
        </section>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          content="Update"
          labelPosition="right"
          icon="edit"
          onClick={() => onSubmit(temp)}
          positive />
      </Modal.Actions>
    </Modal>
  );
}
