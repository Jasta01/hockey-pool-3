import React, { useState, useEffect } from "react";
import "./App.css";
import PlayerForm from "./components/playerForm.js";

const gameResults = {
  friday: [
    { game: "Blackhawks vs Sharks", winner: "Sharks" },
    { game: "Panthers vs Stars", winner: "Panthers" },
    { game: "Jets vs Blue Jackets", winner: "Jets" },
    { game: "Senators vs Rangers", winner: "Rangers" },
    { game: "Islanders vs Sabres", winner: "Islanders" },
    { game: "Lightning vs Wild", winner: "Wild" },
    { game: "Devils vs Flames", winner: "Flames" },
  ],
  saturday: [
    { game: "Stars vs Panthers", winner: null },
    { game: "Bruins vs Flyers", winner: null },
    { game: "Blackhawks vs Kings", winner: null },
    { game: "Blue Jackets vs Capitals", winner: null },
    { game: "Maple Leafs vs Blues", winner: null },
    { game: "Kraken vs Senators", winner: null },
    { game: "Canadians vs Penguins", winner: null },
    { game: "Sabres vs Red Wings", winner: null },
    { game: "Avalanche vs Predators", winner: null },
    { game: "Utah HC vs Golden Knights", winner: null },
    { game: "Canucks vs Sharks", winner: null },
  ],
  sunday: [
    { game: "Islanders vs Rangers", winner: null },
    { game: "Lightning vs Jets", winner: null },
    { game: "Capitals vs Hurricanes", winner: null },
    { game: "Kraken vs Bruins", winner: null },
    { game: "Maple Leafs vs Wild", winner: null },
    { game: "Oilers vs Flames", winner: null },
    { game: "Blackhawks vs Ducks", winner: null },
  ],
};

function App() {
  const [playersData, setPlayersData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetch("/api/handler")
      .then((response) => response.json())
      .then((data) => setPlayersData(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  const onSavePicks = (newPicks) => {
    const updatedPicks = {
      name: newPicks.name,
      fridayPicks: newPicks.friday,
      saturdayPicks: newPicks.saturday,
      sundayPicks: newPicks.sunday,
    };

    setPlayersData((prevPlayers) => {
      const playerIndex = prevPlayers.findIndex(
        (player) => player.name === newPicks.name
      );
      if (playerIndex !== -1) {
        const updatedPlayers = [...prevPlayers];
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          ...updatedPicks,
        };
        return updatedPlayers;
      }
      return [...prevPlayers, updatedPicks];
    });
  };

  const calculateWins = (picks, results) => {
    let wins = 0;
    let gamesPlayed = 0;

    picks.forEach((pick, index) => {
      const gameResult = results[index];
      if (gameResult?.winner) {
        gamesPlayed++;
        if (pick === gameResult.winner) {
          wins++;
        }
      }
    });

    return { wins, gamesPlayed };
  };

  const leaderboard = playersData.map((player) => {
    const fridayResults = calculateWins(player.fridayPicks || [], gameResults.friday);
    const saturdayResults = calculateWins(player.saturdayPicks || [], gameResults.saturday);
    const sundayResults = calculateWins(player.sundayPicks || [], gameResults.sunday);

    const totalWins = fridayResults.wins + saturdayResults.wins + sundayResults.wins;
    const totalGamesPlayed = fridayResults.gamesPlayed + saturdayResults.gamesPlayed + sundayResults.gamesPlayed;
    const winPercentage = totalGamesPlayed > 0 ? ((totalWins / totalGamesPlayed) * 100).toFixed(2) : 0;

    return {
      name: player.name,
      gamesPlayed: totalGamesPlayed,
      timesWon: totalWins,
      winPercentage,
    };
  });

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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
                      <div className="game-pick">
                        {gameResults.friday[0]?.game}: <strong className="picked-team">{player.fridayPicks[0]}</strong>
                      </div>
                    ) : (
                      <div>No picks</div>
                    )}
                  </td>
                  <td className="picks-column">
                    {player.saturdayPicks?.[0] ? (
                      <div className="game-pick">
                        {gameResults.saturday[0]?.game}: <strong className="picked-team">{player.saturdayPicks[0]}</strong>
                      </div>
                    ) : (
                      <div>No picks</div>
                    )}
                  </td>
                  <td className="picks-column">
                    {player.sundayPicks?.[0] ? (
                      <div className="game-pick">
                        {gameResults.sunday[0]?.game}: <strong className="picked-team">{player.sundayPicks[0]}</strong>
                      </div>
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
                  <tr>
                    <td colSpan="5" style={{ background: "#f1f1f1" }}>
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
