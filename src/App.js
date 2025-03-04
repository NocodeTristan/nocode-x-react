import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from "react";
import { createOidc } from "oidc-spa";
import { z } from "zod";

const oidc = await createOidc({
    issuerUri: "https://login.nocode-x.com/auth/realms/dev-183e4f41-fe7e-469a-8dbb-ed83d5323227",
    clientId: "nocodex-broker",
    homeUrl: "/",
    scopes: ["profile", "email"],
    extraQueryParams: () => ({
        ui_locales: "en"
    }),
    decodedIdTokenSchema: z.object({
        preferred_username: z.string(),
        name: z.string(),
        email: z.string().email().optional()
    })
});

function App() {
    const [persons, setPersons] = useState([]);

    const fetchPersons = async () => {
        try {
            const tokens = await oidc.getTokens_next();
            const response = await fetch("https://dev-unnamed-application-167-nocode-x-4.api.nocode-x.com/api/person/list", {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`
                }
            });
            if (!response.ok) throw new Error("Failed to fetch persons");

            const data = await response.json();
            setPersons(data.content);
        } catch (error) {
            console.error("Error fetching persons:", error);
        }
    };

    useEffect(() => {
        if(oidc.isUserLoggedIn) {
            fetchPersons();
        }
    }, []);

    const handleLogin = () => {
        if(oidc) {
            oidc.login({
                doesCurrentHrefRequiresAuth: false,
            })
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>NoCode-X & React</h1>
                <div style={{display: "flex"}}>
                    <img src={logo} className="App-logo" alt="logo"/>
                    <img src="https://app.nocode-x.com/images/theme/nocode-x-logo-symbol-negative.svg"
                         className="App-logo" alt="logo"/>
                </div>
                {oidc.isUserLoggedIn ? (
                    <>
                        <p>Welcome, Tristan!</p>
                        <h2>Persons List:</h2>
                        <ul>
                            {persons.length > 0 ? (
                                persons.map((person, index) => (
                                    <li key={index}>
                                        {person.firstName} {person.lastName}
                                    </li>
                                ))
                            ) : (
                                <p>No persons found.</p>
                            )}
                        </ul>
                    </>
                ) : (
                    <>
                        <p>You are not logged in.</p>
                        <button onClick={handleLogin}>Login</button>
                    </>
                )}
            </header>
        </div>
    );
}


export default App;
