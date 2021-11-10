import React from "react";
import { Link } from "react-router-dom";

export default function New(){
    return (
        <>
            <div>
                New
            </div>
            <Link to="/dashboard"> 
                <button className="btn">Retornar aos Spots</button> 
            </Link>
        </>
    );
}