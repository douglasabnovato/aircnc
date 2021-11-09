import React from 'react';

import "./App.css";
import logo from "./assets/logo.svg";

import Rotas from "./routes";

function App() { 

  return (
    <div className="container">
      <img src={logo} alt="AirCnc"/>
      <div className="content">
        <h5>App</h5>
        <Rotas/>
      </div>
    </div>
  );
}

export default App;
