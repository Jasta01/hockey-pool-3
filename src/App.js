import React, { useState, useEffect } from "react";
import "./App.css";
import PlayerForm from "./components/playerForm.js";

function App() {
  const [playersData, setPlayersData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetch("/api/handler")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setPlayersData(data);
      })
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
    const gamesPlayed =
      (player.fridayPicks?.length || 0) +
      (player.saturdayPicks?.length || 0) +
      (player.sundayPicks?.length || 0);
    const timesWon = 0; // Update this if you have a way to calculate wins
    const winPercentage = gamesPlayed > 0 ? ((timesWon / gamesPlayed) * 100).toFixed(2) : 0;

    return {
      name: player.name,
      gamesPlayed,
      timesWon,
      winPercentage,
    };
  });

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderPick = (pick) => {
    if (!pick || !pick.game) {
      return <div>No pick available</div>;
    }
    
    const [teamA, teamB] = pick.game.split(" vs ");
    return (
      <div>
        <span>{teamA} vs {teamB}: </span>
        <span className="picked-team">{pick.pick}</span> {/* Highlight the chosen team */}
      </div>
    );
  };

  return (
    <div className="App">
      <h1 className="app-title">Hockey Pool</h1>
      <PlayerForm onSavePicks={onSavePicks} />

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
                    {player.fridayPicks?.[0] ? (
                      renderPick(player.fridayPicks[0])
                    ) : (
                      <div>No picks</div>
                    )}
                  </td>
                  <td className="picks-column">
                    {player.saturdayPicks?.[0] ? (
                      renderPick(player.saturdayPicks[0])
                    ) : (
                      <div>No picks</div>
                    )}
                  </td>
                  <td className="picks-column">
                    {player.sundayPicks?.[0] ? (
                      renderPick(player.sundayPicks[0])
                    ) : (
                      <div>No picks</div>
                    )}
                  </td>
                  <td>
                    <button className="expand-button" onClick={() => toggleRow(index)}>
                      {expandedRows[index] ? "Show Less" : "Show More"}
                    </button>
                  </td>
                </tr>
                {expandedRows[index] && (
                  <React.Fragment>
                    {/* Expanded Row with Picks for Friday */}
                    {player.fridayPicks?.slice(1).map((pick, pickIndex) => (
                      <tr key={`friday-${pickIndex}`} className="player-row">
                        <td></td>
                        <td className="picks-column" colSpan="3">
                          {renderPick(pick)}
                        </td>
                      </tr>
                    ))}
                    {/* Expanded Row with Picks for Saturday */}
                    {player.saturdayPicks?.slice(1).map((pick, pickIndex) => (
                      <tr key={`saturday-${pickIndex}`} className="player-row">
                        <td></td>
                        <td className="picks-column" colSpan="3">
                          {renderPick(pick)}
                        </td>
                      </tr>
                    ))}
                    {/* Expanded Row with Picks for Sunday */}
                    {player.sundayPicks?.slice(1).map((pick, pickIndex) => (
                      <tr key={`sunday-${pickIndex}`} className="player-row">
                        <td></td>
                        <td className="picks-column" colSpan="3">
                          {renderPick(pick)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
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
