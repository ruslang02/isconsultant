import { Dialog, DialogContent, DialogTitle, Modal, Snackbar, TextField } from '@material-ui/core';
import { ColDef, DataGrid } from '@material-ui/data-grid';
import { GetEventDto } from '@common/dto/get-event.dto';
import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../utils/UserContext';

type EventRows = GetEventDto[];

const columns: ColDef[] = [
  { field: 'id', headerName: 'ID', type: 'number', width: 70 },
  { field: 'owner', headerName: 'Юрист', width: 220 },
  { field: 'title', headerName: 'Название', width: 250 },
  { field: 'start_timestamp', headerName: 'Время начала', width: 200 },
  { field: 'end_timestamp', headerName: 'Время окончания', width: 200 },
  { field: 'users', headerName: 'Участники', width: 140,  },
];

const rows = [
  {
    id: 1,
    owner: 'Иванов Иван Иванович',
    title: 'Встреча №834',
    start_timestamp: new Date(2020, 4, 4, 13, 0, 0).toLocaleString(),
    end_timestamp: new Date(2020, 4, 4, 16, 0, 0).toLocaleString(),
    participants: '3 участника',
  },
];
function EventsPage() {
  const { token } = useContext(UserContext);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState<EventRows>([]);
  const [currentEvent, setCurrentEvent] = useState<GetEventDto | undefined>();

    useEffect(() => {
      update();
    }, []);
  
    async function update() {
      try {
        const response = await fetch('/api/events/all', {
          method: 'GET',
          headers: new Headers({ 'Authorization': `Bearer ${token}` }),
          cache: 'no-cache',
        });
        const body = await response.json() as (GetEventDto[] & { message: string });
  
        switch (response.status) {
          case 200:
          case 201:
            setEvents(body.map(dto => ({
              ...dto,
              start_timestamp: new Date(dto.timespan_start),
              end_timestamp: new Date(dto.timespan_end),
              users: `${dto.participants.length} участников`
            })));
            break;
          case 401:
            setError('Invalid username or password.');
            break;
          default:
            setError(body.message);
            break;
        }
      } catch (e) {
        console.error(e);
      }
    }
    
  return (
    <div style={{ flexGrow: 1 }}>
      <DataGrid columns={columns} rows={events} onRowClick={(row) => setCurrentEvent(row.row)} />
      <Snackbar open={!!error} message={error} onClose={() => setError(null)} autoHideDuration={6000} anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }} />
      <Dialog open={false}>
        <DialogTitle>Information about this event</DialogTitle>
        <DialogContent>
        <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            type="text"
            value={currentEvent.title}
            fullWidth
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EventsPage;