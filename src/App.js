import logo from './logo.svg';
import './App.css';
import { createOidc } from "oidc-spa";
import { z } from "zod";
import React, { useState, useEffect } from "react";

const oidcPromise  = createOidc({
    issuerUri: "https://dev-login.nocode-x.com/auth/realms/dev-061567e7-35d9-4219-9c9f-be2439000a33",
    clientId: "nocodex-broker",
	homeUrl: "/",
    extraQueryParams: () => ({
       ui_locales: "en"
     }),
     decodedIdTokenSchema: z.object({
        preferred_username: z.string(),
        name: z.string()
     })
});

function App() {
	
  const [oidc, setOidc] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [persons, setPersons] = useState([]);
  const [username, setUsername] = useState("");
  
  
  useEffect(() => {
    oidcPromise.then(async (oidcInstance) => {
      setOidc(oidcInstance);

      if (oidcInstance.isUserLoggedIn) {
        setIsLoggedIn(true);
        const tokens = await oidcInstance.getTokens_next();
        const decodedIdToken = oidcInstance.getDecodedIdToken();
        setUsername(decodedIdToken.preferred_username);
        fetchPersons(tokens.accessToken);
      }
    });
  }, []);
  
  
  const fetchPersons = async (accessToken) => {
    try {
      const response = await fetch("https://your-api.com/persons", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch persons");

      const data = await response.json();
      setPersons(data);
    } catch (error) {
      console.error("Error fetching persons:", error);
    }
  };
  
  const handleLogin = () => {
    if (oidc) {
      oidc.login({
        doesCurrentHrefRequiresAuth: false,
      });
    }
  };
  
	return (
		<div className="App">
		  <header className="App-header">
			<h1>NoCode-X & React</h1>
			<div style={{display:"flex"}}>
				<img src={logo} className="App-logo" alt="logo" />
				<img src="https://app.nocode-x.com/images/theme/nocode-x-logo-symbol-negative.svg" className="App-logo" alt="logo"/>
			</div>
			{isLoggedIn ? (
			  <>
				<p>Welcome, {username}!</p>
				<h2>Persons List:</h2>
				<ul>
				  {persons.length > 0 ? (
					persons.map((person, index) => (
					  <li key={index}>
						{person.firstname} {person.lastname}
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
