import React, { useState, useEffect } from "react";
import "./App.css";
import PlayerForm from "./components/playerForm.js";

function App() {
  const [playersData, setPlayersData] = useState([]);

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
    const gamesPlayed = player.fridayPicks.length + player.saturdayPicks.length + player.sundayPicks.length;
    const timesWon = 0; // Placeholder; calculate as needed
    const winPercentage = gamesPlayed > 0 ? ((timesWon / gamesPlayed) * 100).toFixed(2) : 0;
    return {
      name: player.name,
      gamesPlayed,
      timesWon,
      winPercentage,
    };
  });

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
          </tr>
        </thead>
        <tbody>
          {playersData.length > 0 ? (
            playersData.map((player, index) => (
              <tr key={index}>
                <td className="player-name">{player.name}</td>
                <td className="picks-column">
                  {player.fridayPicks?.map((pickData, i) => (
                    <div key={i} className="game-pick">
                      {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
                    </div>
                  ))}
                </td>
                <td className="picks-column">
                  {player.saturdayPicks?.map((pickData, i) => (
                    <div key={i} className="game-pick">
                      {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
                    </div>
                  ))}
                </td>
                <td className="picks-column">
                  {player.sundayPicks?.map((pickData, i) => (
                    <div key={i} className="game-pick">
                      {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
                    </div>
                  ))}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>No players found.</td>
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
