import { GetEventDto } from "@common/dto/get-event.dto";
import React, { useEffect, useState } from "react";
import { Button, Dropdown, Form, List, Modal, Select } from "semantic-ui-react";
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import { api } from "utils/api";
import { File } from "@common/models/file.entity";
import { PatchEventDto } from "@common/dto/patch-event.dto";

interface EventModalProps {
  editable?: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (e: GetEventDto) => void;
  event: GetEventDto;
}

export function EventModal({ editable, open, onClose, event, onSubmit }: EventModalProps) {
  const [temp, setTemp] = useState<PatchEventDto>(event ?? {

  } as PatchEventDto);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!temp) return;
    (async () => {
      const { data } = await api.get<File[]>(`/events/${event.id}/files`);
      setFiles(data);
    });
  }, [temp])

  const handleSubmit = async () => {
    await api.patch(`/events/${event.id}`, temp);
    onClose();
  }

  return (
    <Modal onClose={() => onClose()} open={open}>
      <Modal.Header>{event === undefined ? "Create new meeting" : "Update meeting info"}</Modal.Header>
      <Modal.Content style={{ display: "flex" }}>
        <section style={{ width: "100%" }}>
          <Form>
            <Form.Field>
              <Form.Input label="Title" value={temp?.title} />
            </Form.Field>
            <Form.Field>
              <Form.TextArea label="Description" value={temp?.title} />
            </Form.Field>
            <Form.Field inline>
              <label>Starts at</label>
              <SemanticDatepicker value={temp !== undefined ? new Date(temp.timespan_start ?? new Date()) : undefined} />{" "}&nbsp;
              <input type="time" value={temp !== undefined ? new Date(temp.timespan_start ?? new Date()).toTimeString() : undefined} />
            </Form.Field>
            <Form.Field inline>
              <label>Ends at</label>
              <SemanticDatepicker value={temp !== undefined ? new Date(temp.timespan_end ?? new Date()) : undefined} />{" "}&nbsp;
              <input type="time" value={temp !== undefined ? new Date(temp.timespan_end ?? new Date()).toTimeString() : undefined} />
            </Form.Field>
            <Form.Field inline>
              <label>Participants</label>
              <Dropdown multiple selection fluid value={temp?.participants} />
            </Form.Field>
            <h4>Security</h4>
            <Form.Field>
              <Form.Input label="Room ID" placeholder="(will be generated later)" readOnly value={temp?.room_id} />
            </Form.Field>
            <Form.Field>
              <Form.Input label="Room Secret (only for you)" placeholder="(will be generated later)" readOnly value={temp?.room_secret} />
            </Form.Field>
            <Form.Field>
              <Form.Input label="Room Password (for unregistered users)" placeholder="(will be generated later)" readOnly value={temp?.room_password} />
            </Form.Field>
            <Form.Field>
              <label>Room Access Level</label>
              <Select options={[{ value: 0, text: "Only participants" }, { value: 1, text: "Anyone with password" }]} value={temp?.room_access} />
            </Form.Field>
          </Form>
        </section>
        <section style={{ borderLeft: "1px solid grey", paddingLeft: "1.5rem", marginLeft: "1.5rem", width: "100%", display: event ? "block" : "none" }}>
          <h4>Shared files</h4>
          <List divided relaxed>
            {files && files.length ? files.map(f => (
              <List.Item>
                <List.Icon name='file' size='large' verticalAlign='middle' />
                <List.Content>
                  <List.Header as='a'>{f.name}</List.Header>
                  <List.Description as='a'>Uploaded by {f.owner.first_name} {f.owner.last_name}</List.Description>
                </List.Content>
              </List.Item>
            )) : <div style={{ textAlign: "center", color: "grey" }}>Nothing uploaded yet.</div>}
          </List>
          <h4>Chat log</h4>
          <Button primary content="Download" onClick={() => {
            window.open(`/api/temps/${event.id}/log`);
          }} />
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
          onClick={() => handleSubmit()}
          positive />
      </Modal.Actions>
    </Modal>
  );
}
