import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { MainPage } from './views/MainPage';
import { CallPage } from './views/CallPage';
import './index.scss';

export function App() {
  return (
    <Router>
      <main className="rz-container">
        <Switch>
          <Route path="/" component={CallPage} />
          <Route path="/call" component={CallPage} />
          <Route>
            <p>This page was not found.</p>
          </Route>
        </Switch>
      </main>
    </Router>
  );
}