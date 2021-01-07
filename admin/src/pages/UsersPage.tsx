import { GetUserInfoDto } from '@common/dto/get-user-info.dto';
import { Snackbar } from '@material-ui/core';
import { ColDef, DataGrid } from '@material-ui/data-grid';
import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../utils/UserContext';

type UserRows = GetUserInfoDto[];

const columns: ColDef[] = [
  { field: 'id', headerName: 'ID', type: 'number', width: 70 },
  { field: 'type_localized', headerName: 'Тип', width: 140 },
  { field: 'last_name', headerName: 'Фамилия', width: 140 },
  { field: 'first_name', headerName: 'Имя', width: 140 },
  { field: 'middle_name', headerName: 'Отчество', width: 140 },
  { field: 'rating', headerName: 'Рейтинг', type: 'number', width: 100 },
  { field: 'verified', headerName: 'Подтвержден', width: 100 },
];
/*
const rows:  = [
  { id: 1, type_localized: 'Администратор', email: 'r@r.r', first_name: 'Ruslan', middle_name: 'I', last_name: 'Garifullin', phone: '+7 (977)-777-77-77' },
];
*/
function UsersPage() {
  const { token } = useContext(UserContext);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState<UserRows>([]);

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

  return (
    <div style={{ flexGrow: 1 }}>
      <DataGrid columns={columns} rows={users} />
      <Snackbar open={!!error} message={error} onClose={() => setError(null)} autoHideDuration={6000} anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }} />
    </div>
  )
}

export default UsersPage;