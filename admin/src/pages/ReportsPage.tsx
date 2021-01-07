import { GetUserInfoDto } from '@common/dto/get-user-info.dto';
import { Report } from '@common/models/report.entity';
import { Snackbar } from '@material-ui/core';
import { ColDef, DataGrid } from '@material-ui/data-grid';
import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../utils/UserContext';

type ReportRows = (Partial<Report> & { id: number })[];

function ReportsPage() {
  const { token } = useContext(UserContext);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState<ReportRows>([]);

  const columns: ColDef[] = [
    { field: 'id', headerName: 'ID', type: 'number', width: 70 },
    {
      field: 'author', headerName: 'Пользователь', width: 220,
      renderCell: (params) => {
        const { first_name, middle_name, last_name } = params.value as GetUserInfoDto;
        return (
          <a href="#" style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', color: 'black' }}><b><u>{last_name} {first_name} {middle_name}</u></b></a>
        );
      }
    },
    {
      field: 'receiver', headerName: 'Адресат', width: 220,
      renderCell: (params) => {
        const { first_name, middle_name, last_name } = params.value as GetUserInfoDto;
        return (
          <a href="#" style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', color: 'black' }}><b><u>{last_name} {first_name} {middle_name}</u></b></a>
        );
      }
    },
    { field: 'description', headerName: 'Описание', width: 250 },
    { field: 'status_localized', headerName: 'Состояние', width: 150 },
    { field: 'decision', headerName: 'Решение', width: 300 },
  ];

  useEffect(() => {
    update();
  }, []);

  async function update() {
    try {
      const response = await fetch('/api/reports?resolve_users=true', {
        method: 'GET',
        headers: new Headers({ 'Authorization': `Bearer ${token}` }),
        cache: 'no-cache',
      });
      const body = await response.json() as Report[] & { message: string };

      switch (response.status) {
        case 200:
        case 201:
          setReports(body);
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
      <DataGrid columns={columns} rows={reports} />
      <Snackbar open={!!error} message={error} onClose={() => setError(null)} autoHideDuration={6000} anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }} />
    </div>
  )
}

export default ReportsPage;