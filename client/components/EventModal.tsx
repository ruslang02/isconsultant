import { GetEventDto } from "@common/dto/get-event.dto";
import React, { useContext, useEffect, useState } from "react";
import {
    Button,
    Comment,
    Dropdown,
    Form,
    Icon,
    Input,
    List,
    Modal,
    Segment,
    Select,
    TextArea,
} from "semantic-ui-react";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";
import { api } from "utils/api";
import { File } from "@common/models/file.entity";
import { PatchEventDto } from "@common/dto/patch-event.dto";
import { MessageContext } from "utils/MessageContext";
import { Status } from "pages/video/[id]";
import { useRouter } from "next/router";
import { GetUserDto } from "@common/dto/get-user.dto";
import { ChatMessage } from "@common/models/chat-message.entity";
import { UserCacheContext } from "utils/UserCacheContext";
import { useAuth } from "utils/useAuth";
import { TimeSelect } from "./TimeSelect";

interface EventModalProps {
    editable?: boolean
    open: boolean
    onClose: () => void
    onSubmit: (e: PatchEventDto) => void
    event: GetEventDto
    startSlot?: string
}

export function EventModal({
    editable,
    open,
    onClose,
    event,
    onSubmit,
    startSlot
}: EventModalProps) {
    const [temp, setTemp] = useState<PatchEventDto | undefined>(event);
    const [files, setFiles] = useState<File[]>([]);
    const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
    const [users, setUsers] = useContext(UserCacheContext);
    const [, setMessage] = useContext(MessageContext);
    const router = useRouter();
    const [auth] = useAuth();
    const [, update] = useState();

    useEffect(() => {
        setTemp({ ...temp, timespan_start: startSlot });
    }, [startSlot]);

    useEffect(() => {
        if (event === undefined && temp === undefined) {
            setTemp({
                title: "",
                description: "",
                timespan_start: new Date().toISOString(),
                timespan_end: new Date(new Date().getTime() + 1800000).toISOString(),
            });
        } else if (event) {
            (async () => {
                const { data } = await api.get<File[]>(`/events/${event.id}/files`);
                setFiles(data);
            })();
            (async () => {
                const { data } = await api.get<ChatMessage[]>(
                    `/events/${event.id}/log/json`
                );
                setChatLog(data);
            })();
            if (event.participants?.length) {
                (async () => {
                    const { data } = await api.get<GetUserDto[]>(
                        `/users/search?ids=${event.participants.join(",")}`
                    );
                    setUsers([
                        ...users.filter(u => !data.some(v => v.id === u.id)),
                        ...data,
                    ]);
                })();
            }
            setTemp({ ...event });
        }
    }, [event]);

    useEffect(() => {
        if (!open) {
            setTemp({
                title: "",
                description: "",
                timespan_start: new Date().toISOString(),
                timespan_end: new Date(new Date().getTime() + 1800000).toISOString(),
            });
        }
    }, [open]);

    useEffect(() => {
        console.log(temp);
    }, [temp]);

    const inviteText = event
        ? `${event.owner.first_name} ${
            event.owner.last_name
        } invites you to a meeting on ISConsultant.
Topic: ${temp.title}
Time: ${new Date(temp.timespan_start).toLocaleDateString("en-GB")}, ${new Date(
    temp.timespan_start
).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
})}

Join the meeting room: https://consultant.infostrategic.com/video/${event.id}

Meeting ID: ${event.id}
${
    temp.room_access == 1
        ? "You will also be required to log in to your account."
        : `Password: ${event.room_password}`
}`
        : "";

    return (
        <Modal style={{ width: "900px" }} onClose={() => onClose()} open={open}>
            <Modal.Header style={{
                display: "flex",
                padding: "1rem 1.5rem",
                "align-items": "center",
            }}>
                { editable
                    ? event === undefined
                        ? "Create new meeting"
                        : "Update meeting info"
                    : "View meeting info" }
                { event !== undefined && (
                    <Button primary
                            icon="arrow right"
                            labelPosition="right"
                            content={
                                event.owner.id === auth?.user?.id
                                    ? "Start meeting"
                                    : "Join meeting"
                            }
                            onClick={() => {
                                window.open(`/video/${event.id}`);
                            }}
                            style={{ marginLeft: "auto" }} />
                ) }
            </Modal.Header>
            <Modal.Content style={{ display: "flex", minHeight: "600px" }}>
                <section style={{ width: "100%" }}>
                    <Form>
                        <Form.Field>
                            <Form.Input readOnly={!editable}
                                        label={
                                            <label>
                                                Title<span style={{ color: "red" }}>*</span>
                                            </label>
                                        }
                                        onChange={(_e, data) => setTemp({ ...temp, title: data.value })}
                                        value={temp?.title} />
                        </Form.Field>
                        <Form.Field>
                            <Form.TextArea readOnly={!editable}
                                           label="Description"
                                           onChange={(_e, data) =>
                                               setTemp({ ...temp, description: data.value.toString() })}
                                           value={temp?.description} />
                        </Form.Field>
                        <Form.Field inline
                                    style={{ display: "flex", alignItems: "center" }}
                                    className="date-picker">
                            <label>
                                Starts at<span style={{ color: "red" }}>*</span>
                            </label>
                            <SemanticDatepicker required
                                                clearable={false}
                                                readOnly={!editable}
                                                onChange={(_e, { value }) =>
                                                    setTemp({
                                                        ...temp,
                                                        timespan_start: (
                                                            (value as Date) ?? new Date()
                                                        ).toISOString(),
                                                        timespan_end: (
                                                            new Date((value as Date ?? new Date()).getTime() + 1800000)
                                                        ).toISOString()
                                                    })}
                                                value={
                                                    temp !== undefined ? new Date(temp.timespan_start) : undefined
                                                } />{ " " }
              &nbsp;
                            <TimeSelect readOnly={!editable}
                                        disabled={!editable}
                                        onChange={(e, { value }) => {
                                            const date = new Date(temp.timespan_start);
                                            const [hours, minutes] = value.toString().split(":", 2);
                                            date.setHours(+hours, +minutes, 0, 0);
                                            const nev = { ...temp, timespan_start: date.toISOString() };
                                            nev.timespan_end = new Date(date.getTime() + 1800000).toISOString();
                                            setTemp(nev);
                                        }}
                                        type="time"
                                        style={{ height: "38px" }}
                                        value={
                                            temp !== undefined
                                                ? new Date(temp.timespan_start).toLocaleTimeString(
                                                    undefined,
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false,
                                                    }
                                                )
                                                : undefined
                                        } />
                        </Form.Field>

                        <Form.Field inline>
                            <label>Participants</label>
                            <Dropdown disabled={!editable}
                                      fluid
                                      multiple
                                      search
                                      selection

                                      onChange={(_e, d) => {
                                          const nTemp = {
                                              ...temp,
                                              participants: d.value
                                                  .toString()
                                                  .split(",")
                                                  .filter(x => x),
                                          };
                                          setTemp(nTemp);
                                      }}
                                      placeholder="Start typing participant's name..."
                                      onSearchChange={(_e, d) => {
                                          api
                                              .get<GetUserDto[]>(`/users/search?query=${d.searchQuery}`)
                                              .then(({ data }) => {
                                                  setUsers([
                                                      ...users.filter(
                                                          u => !data.some(v => v.id === u.id)
                                                      ),
                                                      ...data,
                                                  ]);
                                              });
                                      }}
                                      options={users.map(user => ({
                                          key: user.id,
                                          text: `${user.first_name} ${user.last_name}`,
                                          value: user.id,
                                      }))}
                                      value={temp?.participants?.map(v => {
                                          const user = users.find(u => u.id === v) as GetUserDto;
                                          return user?.id;
                                      }) ?? []} />
                        </Form.Field>
                        <h4>Security</h4>
                        { event && (
                            <Form.Field>
                                <Form.Input label="Meeting ID"
                                            placeholder="(will be generated later)"
                                            readOnly
                                            value={event?.id} />
                            </Form.Field>
                        ) }

                        { editable && event && (
                            <>
                                <Form.Field>
                                    <Form.Input label="Meeting Secret (for meeting moderators)"
                                                placeholder="(will be generated later)"
                                                readOnly
                                                value={temp?.room_secret} />
                                </Form.Field>
                                <Form.Field>
                                    <Form.Input label={
                                        editable
                                            ? "Meeting Password (for unregistered users)"
                                            : "Meeting Password"
                                    }
                                                placeholder="(will be generated later)"
                                                readOnly
                                                value={temp?.room_password} />
                                </Form.Field>
                            </>
                        ) }
                        { editable && (
                            <Form.Field>
                                <label>Meeting Access Level</label>
                                <Select options={[
                                    { value: 0, text: "Anyone with password" },
                                    { value: 1, text: "Only participants" },
                                ]}
                                        onChange={(e, { value }) =>
                                            setTemp({
                                                ...temp,
                                                room_access: +value,
                                            })}
                                        value={temp?.room_access ?? 1} />
                            </Form.Field>
                        ) }
                    </Form>
                </section>
                <section style={{
                    marginLeft: "1.5rem",
                    width: "100%",
                    display: event ? "flex" : "none",
                    flexDirection: "column",
                }}>
                    <div>
                        <h4>Shared files</h4>
                        <Segment>
                            <List divided
                                  relaxed
                                  style={{ height: "100px", overflow: "auto" }}>
                                { files && files.length ? (
                                    files.map(f => (
                                        <List.Item>
                                            <List.Icon name="file"
                                                       size="large"
                                                       verticalAlign="middle"
                                                       style={{ paddingLeft: ".5rem" }} />
                                            <List.Content>
                                                <List.Header as="a"
                                                             onClick={() =>
                                                                 window.open(
                                                                     `/api/events/${event?.id}/files/${f.id}/${f.name}`
                                                             )}>
                                                    { f.name }
                                                </List.Header>
                                                <List.Description as="a">
                                                    Uploaded by { f.owner.first_name } { f.owner.last_name }
                                                </List.Description>
                                            </List.Content>
                                        </List.Item>
                                    ))
                                ) : (
                                    <div style={{ textAlign: "center", color: "grey" }}>
                                        Nothing uploaded yet.
                                    </div>
                                ) }
                            </List>
                        </Segment>
                    </div>
                    <div style={{
                        marginTop: "1rem",
                        flexGrow: 1,
                        height: 0,
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        <h4 style={{ display: "flex", alignItems: "center" }}>
                            Chat log
                            <Button size="tiny"
                                    content="Download Log"
                                    labelPosition="left"
                                    icon={<Icon name="download" />}
                                    style={{ marginLeft: "auto" }}
                                    onClick={() => {
                                        window.open(
                                            `/api/events/${event.id}/log/text/meeting_log_${event.id}.txt`
                                        );
                                    }} />
                        </h4>
                        <Segment style={{ marginTop: 0, flexGrow: 1, height: 0, overflow: "auto" }}>
                            <Comment.Group style={{ minHeight: "100%", position: "relative" }}>
                                { chatLog && chatLog.length ? (
                                    chatLog.map(message => (
                                        <Comment key={message.from.id}>
                                            <Comment.Avatar src={
                                                message.from.avatar ??
                                            "https://react.semantic-ui.com/images/avatar/small/matt.jpg"
                                            } />
                                            <Comment.Content>
                                                <Comment.Author as="a">
                                                    { message.from.last_name } { message.from.first_name }
                                                </Comment.Author>
                                                <Comment.Metadata>
                                                    <div>
                                                        { new Date(
                                                            message.created_timestamp
                                                        ).toLocaleTimeString() }
                                                    </div>
                                                </Comment.Metadata>
                                                <Comment.Text>{ message.content }</Comment.Text>
                                            </Comment.Content>
                                        </Comment>
                                    ))
                                ) : (
                                    <div style={{ color: "grey", textAlign: "center" }}>
                                        No messages yet.
                                    </div>
                                ) }
                            </Comment.Group>
                        </Segment>
                    </div>
                    <Form style={{ marginTop: "1rem" }}>
                        <h4 style={{ display: "flex", alignItems: "center" }}>
                            Invitation
                            <Button primary
                                    size="tiny"
                                    icon="linkify"
                                    labelPosition="left"
                                    content="Copy invitation"
                                    style={{ marginLeft: "auto" }}
                                    onClick={() => {
                                        navigator.clipboard.writeText(inviteText);
                                        setMessage("Invitation copied!");
                                    }} />
                        </h4>
                        <Form.TextArea readOnly
                                       style={{ resize: "none", height: "180px" }}
                                       value={inviteText} />
                    </Form>
                </section>
            </Modal.Content>
            <Modal.Actions>
                { event !== undefined && editable && (
                    <Button color="red"
                            style={{ float: "left" }}
                            onClick={async () => {
                                try {
                                    await api.delete(`/events/${event.id}`);
                                    setMessage("Meeting was deleted.");
                                    onClose();
                                } catch (e) {
                                    setMessage(`Error: ${e}`);
                                }
                            }}>
                        Delete
                    </Button>
                ) }

                <Button color="black" onClick={() => onClose()}>
                    { editable ? "Cancel" : "Close" }
                </Button>
                { editable && (
                    <Button content={event === undefined ? "Create" : "Update"}
                            labelPosition="right"
                            icon="edit"
                            onClick={() => onSubmit(temp)}
                            positive />
                ) }
            </Modal.Actions>
        </Modal>
    );
}
