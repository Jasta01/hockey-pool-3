import React, { useState, useEffect } from "react";
import "./App.css";
import PlayerForm from "./components/playerForm.js";

function App() {
  const [playersData, setPlayersData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetch("/picks.json")
      .then((response) => response.json())
      .then((data) => setPlayersData(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  const onSavePicks = (newPicks) => {
    const existingPlayerIndex = playersData.findIndex(player => player.name === newPicks.name);
    const updatedPicks = {
      name: newPicks.name,
      fridayPicks: newPicks.friday,
      saturdayPicks: newPicks.saturday,
      sundayPicks: newPicks.sunday
    };
  
    if (existingPlayerIndex !== -1) {
      const updatedPlayers = [...playersData];
      updatedPlayers[existingPlayerIndex] = { ...updatedPlayers[existingPlayerIndex], ...updatedPicks };
      setPlayersData(updatedPlayers);
    } else {
      setPlayersData((prevPlayers) => [...prevPlayers, updatedPicks]);
    }
  };
  

  const leaderboard = playersData.map((player) => {
    const gamesPlayed = 0;
    const timesWon = 0; // Placeholder; calculate as needed
    const winPercentage = gamesPlayed > 0 ? ((timesWon / gamesPlayed) * 100).toFixed(2) : 0;
    return {
      name: player.name,
      gamesPlayed,
      timesWon,
      winPercentage,
    };
  });

  // Toggle function to expand/collapse rows
  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle the current row's expanded state
    }));
  };

  return (
    <div className="App">
      <h1 className="app-title">Hockey Pool</h1>
      <PlayerForm onSavePicks={onSavePicks} />

      {/* Player Picks Table */}
      <table className="picks-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Friday Picks</th>
            <th>Saturday Picks</th>
            <th>Sunday Picks</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
  {playersData.length > 0 ? (
    playersData.map((player, index) => (
      <React.Fragment key={index}>
        <tr className="player-row">
          <td className="player-name">{player.name}</td>
          <td className="picks-column">
            {player.friday.map((pickData, i) => (
              <div key={i} className="game-pick">
                {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
              </div>
            ))}
          </td>
          <td className="picks-column">
            {player.saturday.map((pickData, i) => (
              <div key={i} className="game-pick">
                {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
              </div>
            ))}
          </td>
          <td className="picks-column">
            {player.sunday.map((pickData, i) => (
              <div key={i} className="game-pick">
                {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
              </div>
            ))}
          </td>
          <td>
            <button className="expand-button" onClick={() => toggleRow(index)}>
              {expandedRows[index] ? "Show Less" : "Show More"}
            </button>
          </td>
        </tr>
        {expandedRows[index] && (
          <tr>
            <td colSpan="5" style={{ background: "#f1f1f1" }}>
              {/* You can add additional information here for the expanded row */}
              <p>Additional Details for {player.name}</p>
            </td>
          </tr>
        )}
        <tr className="separator-row">
          <td colSpan="5" className="blue-bar"></td>
        </tr>
      </React.Fragment>
    ))
  ) : (
    <tr>
      <td colSpan="5" style={{ textAlign: "center" }}>No players found.</td>
    </tr>
  )}
</tbody>

      </table>

      {/* Leaderboard */}
      <h2 className="leaderboard-title">Leaderboard</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Games Played</th>
            <th>Wins</th>
            <th>Win %</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard
            .sort((a, b) => b.winPercentage - a.winPercentage)
            .map((player, index) => (
              <tr key={index}>
                <td className="player-name">{player.name}</td>
                <td>{player.gamesPlayed}</td>
                <td>{player.timesWon}</td>
                <td>{player.winPercentage}%</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;