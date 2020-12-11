import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './index.scss';

export function App() {
  return (
    <Router>
      <main className="rz-container">
        <ul>
          <li>Документация OpenAPI - <a href="/docs"></a></li>
        </ul>
      </main>
    </Router>
  );
}