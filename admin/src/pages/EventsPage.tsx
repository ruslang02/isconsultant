import { Snackbar } from '@material-ui/core';
import { ColDef, DataGrid } from '@material-ui/data-grid';
import { GetUserInfoDto } from '@common/dto/get-user-info.dto';
import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../utils/UserContext';

type UserRows = GetUserInfoDto[];

const columns: ColDef[] = [
  { field: 'id', headerName: 'ID', type: 'number', width: 70 },
  { field: 'owner', headerName: 'Юрист', width: 220 },
  { field: 'title', headerName: 'Название', width: 250 },
  { field: 'start_timestamp', headerName: 'Время начала', width: 200 },
  { field: 'end_timestamp', headerName: 'Время окончания', width: 200 },
  { field: 'participants', headerName: 'Участники', width: 140 },
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
  const [users, setUsers] = useState<UserRows>([]);
  /*
    useEffect(() => {
      update();
    }, []);
  
    async function update() {
      try {
        const response = await fetch('/api/users', {
          method: 'GET',
          headers: new Headers({ 'Authorization': `Bearer ${token}` }),
          cache: 'no-cache',
        });
        const body = await response.json();
  
        switch (response.status) {
          case 200:
          case 201:
            setUsers(body);
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
  */
  return (
    <div style={{ flexGrow: 1 }}>
      <DataGrid columns={columns} rows={rows} />
      <Snackbar open={!!error} message={error} onClose={() => setError(null)} autoHideDuration={6000} anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }} />
    </div>
  )
}

export default EventsPage;