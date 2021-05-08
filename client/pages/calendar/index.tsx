import { GetEventDto } from "@common/dto/get-event.dto";
import { PatchEventDto } from "@common/dto/patch-event.dto";
import { EventModal } from "components/EventModal";
import { Page } from "components/Page";
import { TimetableModal } from "components/TimetableModal";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { Calendar, Event, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Header as SHeader, Icon } from "semantic-ui-react";
import { api } from "utils/api";
import { MessageContext } from "utils/MessageContext";
import { useAuth } from "utils/useAuth";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [auth] = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [ttOpen, setTtOpen] = useState(false);
  const [startSlot, setStartSlot] = useState<string | undefined>(undefined);
  const [event, setEvent] = useState<GetEventDto | undefined>();
  const [, setMessage] = useContext(MessageContext);

  const loadEvents = async () => {
    const { data } = await api.get<GetEventDto[]>(
      `/events${
        ["admin", "moderator"].includes(auth?.user?.type) ? "/all" : ""
      }`
    );

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
      <h2>
        My meetings
        <br />
        <small style={{ color: "grey" }}>
          Your personal control panel over your meeting sessions.
        </small>
      </h2>
      <div style={{display: "flex"}}>
        <Button
          primary
          onClick={() => {
            setOpen(true);
            setEvent(undefined);
            setStartSlot(undefined);
          }}
          style={{marginRight: "auto"}}
        >
            <Icon name="plus" />
              New meeting
        </Button>
        <Button onClick={() => router.push("/calendar/requests")}>
            <Icon name="address book" />
              Advice requests
        </Button>
        <Button onClick={() => setTtOpen(true)}>
            <Icon name="calendar alternate" />
              Timetable
        </Button>
      </div>
      <br />
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={(e) => {
          setOpen(true);
          setEvent(e.resource);
        }}
        onSelectSlot={({ start }) => {
          setOpen(true);
          setEvent(undefined);
          setStartSlot(new Date(start).toISOString());
        }}
        timeslots={1}
        selectable
        step={30}
        style={{ height: 500 }}
      />
      <TimetableModal open={ttOpen} onClose={() => setTtOpen(false)} />
      <EventModal
        editable
        onClose={() => {
          setOpen(false);
          setEvent(undefined);
          loadEvents();
        }}
        open={open}
        event={event}
        startSlot={startSlot}
        onSubmit={async (temp: GetEventDto) => {
          if (event === undefined) {
            await api.put(`/events`, temp);
            setMessage("Your meeting was successfully created.");
          } else {
            const ptch = Object.fromEntries(
              Object.entries(temp).filter(
                ([key, value]) => event[key] !== value
              )
            ) as PatchEventDto;
            if (
              ptch.participants?.length === temp.participants?.length &&
              ptch.participants?.every((a) => !temp.participants.includes(a))
            ) {
              delete ptch.participants;
            }
            await api.patch(`/events/${event.id}`, ptch);
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
