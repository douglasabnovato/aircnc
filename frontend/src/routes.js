import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import New from "./pages/New";

export default function Rotas(){
    
    return(
        <Router>
            <Routes>
                <Route path="/" component={Login} />
                <Route path="/dashboard" component={Dashboard}/>
                <Route path="/new" component={New}/>
            </Routes>   
        </Router>
    );
}
