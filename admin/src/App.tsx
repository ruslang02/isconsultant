
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.scss';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import EventsPage from './pages/EventsPage';
import MaintenancePage from './pages/MaintenancePage';
import OverviewPage from './pages/OverviewPage';
import ReportsPage from './pages/ReportsPage';
import RequestsPage from './pages/RequestsPage';
import UsersPage from './pages/UsersPage';
import UserContext from './utils/UserContext';

function LoggedOutApp() {
  return (
    <section className="App App--logged-out">
      <LoginForm />
    </section>
  )
}

function LoggedInApp() {
  return (
    <section className="App App--logged-in">
      <Router basename="/admin">
        <Header />
        <Switch>
          <Route path="/users" component={UsersPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/requests" component={RequestsPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/maintenance" component={MaintenancePage} />
          <Route component={OverviewPage} />
        </Switch>
      </Router>
    </section>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  return (
    <UserContext.Provider value={{ token, user, setToken, setUser }}>
      {user ? <LoggedInApp /> : <LoggedOutApp />}
    </UserContext.Provider>
  )
}

export default App;