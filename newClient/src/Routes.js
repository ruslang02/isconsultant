import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./Login";
import Home from "./Home"
import Signup from "./Signup"

export default function Routes() {
  return (
        <Switch>
            <Route exact path="/">
                <Home />
             </Route>

             <Route exact path="/login">
                 <Login />
             </Route>

             <Route exact path="/singup">
                 <Signup />
             </Route>
          </Switch>
  );
}