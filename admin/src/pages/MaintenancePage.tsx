import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import React from 'react';

function MaintenancePage() {
  return (
    <div style={{ padding: '1rem' }}>
      <div><FormControlLabel control={<Switch />} label="Сайт на обслуживании" /></div>
      <Button variant="contained" color="primary">
        Перезапуск сервера
      </Button>
    </div>
  )
}

export default MaintenancePage;