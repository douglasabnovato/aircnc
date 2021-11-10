import React, { useState } from "react"; 

import camera from "../../assets/camera.svg";
import "./styles.css";

export default function New(){

    const [company, setCompany] = useState("");
    const [techs, setTechs] = useState("");
    const [price, setPrice] = useState("");
    const [thumbnail, setThumbnail] = useState(null);

    function handleSubmit(){

    }

    return (
        <>
            <form onSubmit={handleSubmit}>

                <label id="thumbnail">
                    <input type="file" onChange={event => setThumbnail(event.target.files[0])}/>
                    <img src={camera} alt="Select img" />
                </label>

                <label htmlFor="company">EMPRESA *</label>
                <input 
                    id="company" 
                    placeholder="Sua empresa incrível" 
                    value={company} 
                    onChange={event => setCompany(event.target.value)}
                />

                <label htmlFor="techs">TECNOLOGIAS * <span>(separadas por vírgula)</span></label>
                <input 
                    id="techs" 
                    placeholder="Quais tecnologias usam?" 
                    value={techs} 
                    onChange={event => setTechs(event.target.value)}
                />

                <label htmlFor="techs">VALOR DA DIÁRIA * <span>(em branco para GRATUITO)</span></label>
                <input 
                    id="price" 
                    placeholder="Valor cobrado por dia" 
                    value={price} 
                    onChange={event => setPrice(event.target.value)}
                />

                <button type="submit" className="btn">Cadastrar</button>

            </form>
        </>
    );
}