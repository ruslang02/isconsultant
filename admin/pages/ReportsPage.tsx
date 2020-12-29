import { User } from '@common/models/User';
import { Snackbar } from '@material-ui/core';
import { ColDef, DataGrid } from '@material-ui/data-grid';
import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../utils/UserContext';

type UserRows = (Partial<User> & { id: number, type_localized: string })[];

const columns: ColDef[] = [
  { field: 'id', headerName: 'ID', type: 'number', width: 70 },
  { field: 'author', headerName: 'Пользователь', width: 220 },
  { field: 'receiver', headerName: 'Адресат', width: 220 },
  { field: 'description', headerName: 'Описание', flex: 1 },
  { field: 'status', headerName: 'Состояние', width: 150 },
  { field: 'decision', headerName: 'Решение', width: 200 },
];

const rows = [
  {
    id: 1,
    author: 'Гарифуллин Руслан Ильфатович',
    receiver: 'Иванов Иван Иванович',
    status: 'На рассмотрении',
    decision: '',
  },
];
function ReportsPage() {
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

export default ReportsPage;