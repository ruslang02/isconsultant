import { GetEventDto } from "@common/dto/get-event.dto";
import { Header } from "components/Header";
import { Page } from "components/Page";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  Calendar,
  CalendarProps,
  Event,
  momentLocalizer,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Button,
  Card,
  Header as SHeader,
  Icon,
  Modal,
} from "semantic-ui-react";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";

const localizer = momentLocalizer(moment);

function EventEditModal({ open, onClose, event, onSubmit }) {
  const [temp, setTemp] = useState(event);
  return (
    <Modal onClose={() => onClose()} open={open}>
      <Modal.Header>Update meeting info</Modal.Header>
      <Modal.Content></Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          content="Update"
          labelPosition="right"
          icon="edit"
          onClick={() => onSubmit(temp)}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}

const CalendarPage = () => {
  const [auth] = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<GetEventDto | undefined>();

  useEffect(() => {
    (async () => {
      const { data } = await api.get<GetEventDto[]>("/events", {
        headers: {
          Authorization: `Bearer ${auth?.access_token}`,
        },
      });

      setEvents(
        data.map((_) => ({
          title: _.title,
          start: new Date(_.timespan_start),
          end: new Date(_.timespan_end),
          resource: _,
        }))
      );
    })();
  }, []);

  return (
    <Page>
      <h2>My meetings
        <br />
        <small style={{ color: "grey" }}>
          Your personal control panel over your meeting sessions.
        </small>
      </h2>
      <Button.Group size="huge" fluid>
        <Button size="huge" onClick={() => router.push("/calendar/requests")}>
          <SHeader as="h2">
            <Icon name="address book" />
            <SHeader.Content style={{ textAlign: "left" }}>
              Pending advice requests
              <SHeader.Subheader>Click here to view</SHeader.Subheader>
            </SHeader.Content>
          </SHeader>
        </Button>
        <Button.Or style={{ height: "auto" }} />
        <Button
          size="huge"
          primary
          onClick={() => {
            setOpen(true);
            setEvent(undefined);
          }}
        >
          <SHeader as="h2" style={{ color: "white" }}>
            <Icon name="plus" />
            <SHeader.Content style={{ textAlign: "left" }}>
              Create a new meeting
              <SHeader.Subheader style={{ color: "white" }}>
                Configure your meeting settings
              </SHeader.Subheader>
            </SHeader.Content>
          </SHeader>
        </Button>
      </Button.Group>
      <br />
      <br />
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onDoubleClickEvent={(e) => {
          setOpen(true);
          setEvent(e.resource);
        }}
        style={{ height: 500 }}
      />
      <EventEditModal
        onClose={() => setOpen(false)}
        open={open}
        event={event}
        onSubmit={async (e: GetEventDto) => {
          await api.patch("/events/" + e.id, e, {
            headers: {
              Authorization: `Bearer ${auth?.access_token}`,
            },
          });
        }}
      />
    </Page>
  );
};

export default CalendarPage;
