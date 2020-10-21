import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useLocation
} from "react-router-dom";

import keys from "./keys.json";

const client_id = keys.id;
const redirect_uri = "http://localhost:3000/authorize";
var scopes =
  "user-read-private user-read-email user-top-read user-read-recently-played user-follow-read";

function App() {
  return (
    <Router>
      <Switch>
        <Route
          path="/login"
          component={() => {
            window.location.href =
              "https://accounts.spotify.com/authorize" +
              "?response_type=token" +
              "&client_id=" +
              client_id +
              (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
              "&redirect_uri=" +
              encodeURIComponent(redirect_uri);
            return null;
          }}
        />
        <Route path="/authorize">
          <Authorize />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

const Authorize = () => {
  let access_token = window.location.hash
    .substr(window.location.hash.indexOf("access_token"))
    .split("&")[0]
    .split("=")[1];

  return <Redirect to={{ pathname: "/", state: { token: access_token } }} />;
};

const Home = () => {
  const { token } = useLocation().state || "";

  const [me, setMe] = useState({});
  const [top, setTop] = useState({});
  const [time, setTime] = useState("short_term");
  const [topType, setTopType] = useState("tracks");

  console.log(top.items && top.items.map(art => art.name));

  useEffect(() => {
    if (token) {
      fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(resp => resp.json())
        .then(setMe);

      setTop({});

      fetch(
        `https://api.spotify.com/v1/me/top/${topType}?time_range=${time}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
        .then(resp => resp.json())
        .then(setTop);
    }
  }, [token, time, topType]);

  const updateTimeFromForm = evt => setTop({}) || setTime(evt.target.value);
  const updateTopTypeFromForm = evt =>
    setTop({}) || setTopType(evt.target.value);

  return (
    <div className="App">
      <header className="App-header">
        <div className="TopBar">
          {me.display_name}

          <select
            id="topselect"
            onChange={updateTopTypeFromForm}
            value={topType}
          >
            <option value="tracks">Songs</option>
            <option value="artists">Artists</option>
          </select>

          <select id="timeselect" onChange={updateTimeFromForm} value={time}>
            <option value="short_term">Short-term (4 weeks)</option>
            <option value="medium_term">Mid-term (6 months)</option>
            <option value="long_term">Long-term (all time)</option>
          </select>
        </div>
        {top.items &&
          top.items.map(obj =>
            topType === "tracks" ? <Song song={obj} /> : <Artist artist={obj} />
          )}
        {!token ? (
          <Link to="/login">Login</Link>
        ) : (
          <Link to="/authorize">Logout</Link>
        )}
      </header>
    </div>
  );
};

const Song = ({ song }) => {
  let img = song.album.images[song.album.images.length - 1];
  let artist = song.artists.map(artist => artist.name).join(", ");
  return (
    <div className="Song">
      <img src={img.url} height={img.height} width={img.width} alt="Album Cover" />
      <div className="SongDesc">
        <div className="SongName">{song.name}</div>
        <div className="SongArtist">{artist}</div>
      </div>
    </div>
  );
};

const Artist = ({ artist }) => {
  let img = artist.images[artist.images.length - 1];

  return (
    <div className="Song">
      {img && <img src={img.url} height={64} width={64} alt="Artist" />}
      <div className="SongDesc">
        <div className="SongName">{artist.name}</div>
      </div>
    </div>
  );
};
