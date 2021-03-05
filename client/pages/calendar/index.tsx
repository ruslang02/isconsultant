import { Header } from "components/Header";
import { Page } from "components/Page";
import moment from 'moment';
import { useRouter } from "next/router";
import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card } from "semantic-ui-react";
import { useAuth } from "utils/useAuth";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [auth] = useAuth();
  const router = useRouter();

  return (
    <Page>
      { /*auth?.user.type === "lawyer" &&*/ (
        <Card
          link
          fluid
          onClick={() => router.push('/calendar/requests')}
          header='Pending advice requests'
          meta='1 pending'
          description='Click here to view your consultation requests'
        />
      )}
      <Calendar
        localizer={localizer}
        events={[]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }} />
    </Page>
  );
};

export default CalendarPage;