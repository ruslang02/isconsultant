import { GetEventDto } from "@common/dto/get-event.dto";
import React, { useContext, useEffect, useState } from "react";
import { Button, Dropdown, Form, List, Modal, Select } from "semantic-ui-react";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";
import { api } from "utils/api";
import { File } from "@common/models/file.entity";
import { PatchEventDto } from "@common/dto/patch-event.dto";
import { MessageContext } from "utils/MessageContext";
import { Status } from "pages/video/[id]";
import { useRouter } from "next/router";

interface EventModalProps {
  editable?: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (e: PatchEventDto) => void;
  event: GetEventDto;
}

export function EventModal({
  editable,
  open,
  onClose,
  event,
  onSubmit,
}: EventModalProps) {
  const [temp, setTemp] = useState<PatchEventDto | undefined>(event);
  const [files, setFiles] = useState<File[]>([]);
  const { setValue: setMessage } = useContext(MessageContext);
  const router = useRouter();

  useEffect(() => {
    if (event === undefined && temp === undefined) {
      setTemp({
        title: "",
        description: "",
        timespan_start: new Date().toISOString(),
        timespan_end: new Date().toISOString(),
      });
    } else if (event) {
      (async () => {
        const { data } = await api.get<File[]>(`/events/${event.id}/files`);
        setFiles(data);
      })();
      setTemp({ ...event });
    }
  }, [event]);

  useEffect(() => {
    if (!open) {
      setTemp({
        title: "",
        description: "",
        timespan_start: new Date().toISOString(),
        timespan_end: new Date().toISOString(),
      });
    }
  }, [open]);

  useEffect(() => {
    console.log(temp);
  }, [temp]);

  const handleSubmit = async () => {
    if (event === undefined) {
      await api.put("/events", temp);
      setMessage("Your meeting was successfully created.");
    } else {
      await api.patch(`/events/${event.id}`, temp);
      setMessage("Your meeting was successfully edited.");
    }
    onSubmit(temp);
  };

  return (
    <Modal onClose={() => onClose()} open={open}>
      <Modal.Header>
        {event === undefined ? "Create new meeting" : "Update meeting info"}
      </Modal.Header>
      <Modal.Content style={{ display: "flex" }}>
        <section style={{ width: "100%" }}>
          <Form>
            <Form.Field>
              <Form.Input
                label="Title"
                onChange={(_e, data) => setTemp({ ...temp, title: data.value })}
                value={temp?.title}
              />
            </Form.Field>
            <Form.Field>
              <Form.TextArea
                label="Description"
                onChange={(_e, data) =>
                  setTemp({ ...temp, description: data.value.toString() })
                }
                value={temp?.description}
              />
            </Form.Field>
            <Form.Field inline>
              <label>Starts at</label>
              <SemanticDatepicker
                onChange={(_e, { value }) =>
                  setTemp({
                    ...temp,
                    timespan_start: (value as Date).toISOString(),
                  })
                }
                value={
                  temp !== undefined ? new Date(temp.timespan_start) : undefined
                }
              />{" "}
              &nbsp;
              <input
                onChange={(e) => {
                  const date = new Date(temp.timespan_start);
                  const value = e.target.valueAsDate;
                  date.setHours(value.getUTCHours(), value.getUTCMinutes());
                  setTemp({ ...temp, timespan_start: date.toISOString() });
                }}
                type="time"
                value={
                  temp !== undefined
                    ? new Date(
                      temp.timespan_start
                    ).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    : undefined
                }
              />
            </Form.Field>
            <Form.Field inline>
              <label>Ends at</label>
              <SemanticDatepicker
                onChange={(_e, { value }) =>
                  setTemp({
                    ...temp,
                    timespan_end: (value as Date).toISOString(),
                  })
                }
                value={
                  temp !== undefined ? new Date(temp.timespan_end) : undefined
                }
              />{" "}
              &nbsp;
              <input
                onChange={(e) => {
                  const date = new Date(temp.timespan_end);
                  const value = e.target.valueAsDate;
                  date.setHours(value.getUTCHours(), value.getUTCMinutes());
                  setTemp({ ...temp, timespan_end: date.toISOString() });
                }}
                type="time"
                value={
                  temp !== undefined
                    ? new Date(temp.timespan_end).toLocaleTimeString(
                      undefined,
                      { hour: "2-digit", minute: "2-digit", hour12: false }
                    )
                    : undefined
                }
              />
            </Form.Field>
            <Form.Field inline>
              <label>Participants</label>
              <Dropdown multiple selection fluid value={temp?.participants} />
            </Form.Field>
            <h4>Security</h4>
            <Form.Field>
              <Form.Input
                label="Room ID"
                placeholder="(will be generated later)"
                readOnly
                value={temp?.room_id}
              />
            </Form.Field>
            <Form.Field>
              <Form.Input
                label="Room Secret (only for you)"
                placeholder="(will be generated later)"
                readOnly
                value={temp?.room_secret}
              />
            </Form.Field>
            <Form.Field>
              <Form.Input
                label="Room Password (for unregistered users)"
                placeholder="(will be generated later)"
                readOnly
                value={temp?.room_password}
              />
            </Form.Field>
            <Form.Field>
              <label>Room Access Level</label>
              <Select
                options={[
                  { value: 0, text: "Only participants" },
                  { value: 1, text: "Anyone with password" },
                ]}
                onChange={(e, { value }) =>
                  setTemp({
                    ...temp,
                    room_access: +value,
                  })
                }
                value={temp?.room_access}
              />
            </Form.Field>
          </Form>
        </section>
        <section
          style={{
            borderLeft: "1px solid grey",
            paddingLeft: "1.5rem",
            marginLeft: "1.5rem",
            width: "100%",
            display: event ? "block" : "none",
          }}
        >
          <h4>Shared files</h4>
          <List divided relaxed>
            {files && files.length ? (
              files.map((f) => (
                <List.Item>
                  <List.Icon name="file" size="large" verticalAlign="middle" />
                  <List.Content>
                    <List.Header as="a">{f.name}</List.Header>
                    <List.Description as="a">
                      Uploaded by {f.owner.first_name} {f.owner.last_name}
                    </List.Description>
                  </List.Content>
                </List.Item>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "grey" }}>
                Nothing uploaded yet.
              </div>
            )}
          </List>
          <h4>Chat log</h4>
          <Button
            primary
            content="Download"
            onClick={() => {
              window.open(`/api/events/${event.id}/log/text/meeting_log_${event.id}.txt`);
            }}
          />
          <h4>Room Control</h4>
          {event?.room_status == Status.NEW ?
            <Button
              primary
              content="Start meeting"
              onClick={async () => {
                const response = await api.post(`/events/${event.id}/start`);
                if(response.status == 201) {
                  router.replace(`/video/${event.id}`)
                }
              }}
            />
            : event?.room_status == Status.STARTED ?
              <Button
                primary
                content="Finish meeting"
                onClick={async () => {
                  const response = await api.post(`/events/${event.id}/stop`);
                  if(response.status == 201) {
                    router.reload()
                  }
                }}
              />
              : <></>}
        </section>
      </Modal.Content>
      <Modal.Actions>
        {event !== undefined && <Button color="red" style={{ float: "left" }} onClick={async () => {
          try {
            await api.delete(`/events/${event.id}`);
            setMessage('Meeting was deleted.');
            onClose();
          } catch (e) {
            setMessage(`Error: ${e}`);
          }
        }}>
          Delete
        </Button>}

        <Button primary icon="linkify" labelPosition="left" content="Copy link" onClick={() => {
          const url = new URL(location.href);
          url.pathname = `/video/${event.room_id}`;
          navigator.clipboard.writeText(url.href);
          setMessage("Link copied!");
        }} style={{ float: "left" }} />

        <Button color="black" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          content={event === undefined ? "Create" : "Update"}
          labelPosition="right"
          icon="edit"
          onClick={() => handleSubmit()}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}
