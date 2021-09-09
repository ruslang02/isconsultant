import { GetEventDto } from "@common/dto/get-event.dto";
import { GetPendingEventDto } from "@common/dto/get-pending-event.dto";
import { CalendarEvent } from "@common/models/calendar-event.entity";
import { EventModal } from "components/EventModal";
import { Page } from "components/Page";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Card, Item } from "semantic-ui-react";
import { api } from "utils/api";
import { useAuth } from "utils/useAuth";

const MeetingsList = () => {
    const [meetings, setMeetings] = useState<GetEventDto[]>([]);
    const [request, setRequest] = useState<GetPendingEventDto | undefined>();
    const [auth] = useAuth();
    const [open, setOpen] = useState(false);
    const [event, setEvent] = useState<GetEventDto | undefined>();

    useEffect(() => {
        (async () => {
            const { data, status } = await api.get<GetEventDto[]>("/events/@me");

            if (status < 300) {
                console.log(data);
                setMeetings(data);
            }
        })();
        (async () => {
            const { data, status } = await api.get<GetPendingEventDto>(
                "/events/requests/@me"
            );

            if (status < 300) {
                console.log(data);
                setRequest(data);
            }
        })();
    }, []);

    const upcoming = meetings.filter(
        _ => new Date(_.timespan_end) > new Date()
    );
    const past = meetings.filter(_ => new Date(_.timespan_end) <= new Date());

    return (
        <Page>
            <Head>
                <title>My meetings - ISConsultant</title>
            </Head>
            <h2>My meetings</h2>
            { request && (
                <>
                    <Card.Group>
                        <Card fluid>
                            <Card.Content>
                                <Card.Header>Pending request</Card.Header>
                                <Card.Description>
                                    Lawyer:{ " " }
                                    <b>
                                        { request.lawyer
                                            ? `${request.lawyer.first_name} ${request.lawyer.last_name}`
                                            : "any" }
                                    </b>
                                    <br />
                                    Starts at:{ " " }
                                    <b>{ new Date(request.timespan_start).toLocaleString() }</b>
                                    <br />
                                    Ends at:{ " " }
                                    <b>{ new Date(request.timespan_end).toLocaleString() }</b>
                                    <br />
                                    <br />
                                    Description: <br />
                                    { request.description }
                                </Card.Description>
                            </Card.Content>
                        </Card>
                    </Card.Group>
                </>
            ) }
            <h3>Upcoming meetings</h3>
            <Card.Group>
                { upcoming.length ? (
                    upcoming.map(m => (
                        <Card link
                              fluid
                              onClick={() => {
                                  setEvent(m);
                                  setOpen(true);
                              }}>
                            <Card.Content>
                                <Card.Header as="a">{ m.title }</Card.Header>
                                <Card.Description>
                                    Lawyer:{ " " }
                                    <b>
                                        { m.owner.first_name } { m.owner.last_name }
                                    </b>
                                    <br />
                                    Starts at:{ " " }
                                    <b>{ new Date(m.timespan_start).toLocaleString() }</b>
                                    <br />
                                    Ends at: <b>{ new Date(m.timespan_end).toLocaleString() }</b>
                                </Card.Description>
                            </Card.Content>
                        </Card>
                    ))
                ) : (
                    <div style={{ textAlign: "center", color: "grey", width: "100%" }}>
                        No meetings found.
                    </div>
                ) }
            </Card.Group>
            <h3>Past meetings</h3>
            <Card.Group>
                { past.length ? (
                    past.map(m => (
                        <Card link
                              fluid
                              onClick={() => {
                                  setEvent(m);
                                  setOpen(true);
                              }}>
                            <Card.Content>
                                <Card.Header as="a">{ m.title }</Card.Header>
                                <Card.Description>
                                    Lawyer:{ " " }
                                    <b>
                                        { m.owner.first_name } { m.owner.last_name }
                                    </b>
                                    <br />
                                    Starts at:{ " " }
                                    <b>{ new Date(m.timespan_start).toLocaleString() }</b>
                                    <br />
                                    Ends at: <b>{ new Date(m.timespan_end).toLocaleString() }</b>
                                </Card.Description>
                            </Card.Content>
                        </Card>
                    ))
                ) : (
                    <div style={{ textAlign: "center", color: "grey", width: "100%" }}>
                        No meetings found.
                    </div>
                ) }
            </Card.Group>
            <EventModal open={open}
                        onClose={() => {
                            setOpen(false);
                            setEvent(undefined);
                        }}
                        onSubmit={() => {}}
                        event={event} />
        </Page>
    );
};

export default MeetingsList;
