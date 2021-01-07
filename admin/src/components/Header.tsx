import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import UserContext from '../utils/UserContext';
import React, { useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation<any>();
  const history = useHistory();
  const { user, setUser, setToken } = useContext(UserContext);

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>Панель администрирования</Typography>
        <div style={{ marginRight: '1rem', textAlign: 'right' }}>
          <Typography variant="body2" style={{ fontWeight: 'bold' }}>{user.last_name} {user.first_name} {user.middle_name}</Typography>
          <Typography variant="body2">{user.type}</Typography>
        </div>
        <Button color="primary" variant="outlined" onClick={() => {
          setUser(null);
          setToken(null);
        }}>Выйти</Button>
      </Toolbar>
      <Tabs value={location.pathname} onChange={(_ev, value: string) => history.push(value)} aria-label="Секции">
        <Tab label="Статистика" value="/" />
        <Tab label="Пользователи" value="/users" />
        <Tab label="События" value="/events" />
        <Tab label="Заявки" value="/requests" />
        <Tab label="Жалобы" value="/reports" />
        <Tab label="Обслуживание" value="/maintenance" />
      </Tabs>
    </AppBar>
  )
}

export default Header;