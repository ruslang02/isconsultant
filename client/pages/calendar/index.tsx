import { GetEventDto } from "@common/dto/get-event.dto";
import { EventModal } from "components/EventModal";
import { Page } from "components/Page";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import {
  Calendar, Event,
  momentLocalizer
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Button, Header as SHeader,
  Icon
} from "semantic-ui-react";
import { api } from "utils/api";
import { MessageContext } from "utils/MessageContext";
import { useAuth } from "utils/useAuth";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [auth] = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<GetEventDto | undefined>();
  const { setValue: setMessage } = useContext(MessageContext);

  const loadEvents = async () => {
    const { data } = await api.get<GetEventDto[]>("/events");

    setEvents(
      data.map((_) => ({
        title: _.title,
        start: new Date(_.timespan_start),
        end: new Date(_.timespan_end),
        resource: _,
      }))
    );
  };
  useEffect(() => {
    if (!event) loadEvents();
  }, [event]);

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
        <Button.Or style={{ height: "auto", width: "auto" }} />
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
      <EventModal editable
        onClose={() => {
          setOpen(false);
        }}
        open={open}
        event={event}
        onSubmit={async (temp: GetEventDto) => {
          if (event === undefined) {
            await api.put("/events", temp);
            setMessage("Your meeting was successfully created.");
          } else {
            await api.patch(`/events/${event.id}`, temp);
            setMessage("Your meeting was successfully edited.");
          }

          setOpen(false);
          setEvent(undefined);
          loadEvents();
        }}
      />
    </Page>
  );
};

export default CalendarPage;
