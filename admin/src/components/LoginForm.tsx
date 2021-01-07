import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import React, { useContext, useState } from 'react';
import logo from '../assets/logo_square.png';
import UserContext from '../utils/UserContext';
import './LoginForm.scss';

function LoginForm() {
  const { setUser, setToken } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
        cache: 'no-cache',
      });
      const body = await response.json();

      switch (response.status) {
        case 200:
        case 201:
          setToken(body.access_token);
          setUser(body.user);
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
    setLoading(false);
  }

  return (
    <Paper className="LoginForm">
      <form>
        <header className="LoginForm__logo">
          <img src={logo} alt="Логотип компании" />
        </header>
        <Typography variant="h6" align="center">Войти в панель администратора</Typography>
        <TextField label="Адрес электронной почты" type="email" variant="outlined" value={email} disabled={loading} onChange={(ev) => setEmail(ev.target.value)} />
        <TextField label="Пароль" type="password" variant="outlined" value={password} disabled={loading} onChange={(ev) => setPassword(ev.target.value)} />
        <footer className="LoginForm__footer">
          <Button color="primary" variant="contained" disabled={loading} onClick={login} type="submit">Вход в систему</Button>
        </footer>
        <Snackbar open={!!error} message={error} onClose={() => setError(null)} autoHideDuration={6000} anchorOrigin={{ horizontal: 'center', vertical: 'top' }} />
      </form>
    </Paper>
  )
}

export default LoginForm;
