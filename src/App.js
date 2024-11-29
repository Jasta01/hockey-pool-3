import React, { useState, useEffect } from "react";
import "./App.css";
import PlayerForm from "./components/playerForm.js";

// Sample results for each game
const gameResults = {
  friday: [
    { game: "Rangers vs Flyers", winner: "Flyers" },
    { game: "Blackhawks vs Wild", winner: "Wild" },
    { game: "Devils vs Red Wings", winner: null },
    { game: "Flames vs Blue Jackets", winner: "Blue Jackets" },
    { game: "Canucks vs Sabres", winner: "Canucks" },
    { game: "Lightning vs Predators", winner: "Lightning" },
    { game: "Panthers vs Hurricanes", winner: "Panthers" },
    { game: "Islanders vs Capitals", winner: null },
    { game: "Kings vs Ducks", winner: null },
    { game: "Kraken vs Sharks", winner: null },
    { game: "Penguins vs Bruins", winner: null },
    { game: "Jets vs Golden Knights", winner: null },
    { game: "Oilers vs Utah HC", winner: null },
    { game: "Avalanche vs Stars", winner: null }
  ],
  saturday: [
    { game: "Canadiens vs Rangers", winner: null },
    { game: "Hurricanes vs Panthers", winner: null },
    { game: "Flames vs Penguins", winner: null },
    { game: "Maple Leafs vs Lightning", winner: null },
    { game: "Flyers vs Blues", winner: null },
    { game: "Senators vs Kings", winner: null },
    { game: "Capitals vs Devils", winner: null },
    { game: "Sabres vs Islanders", winner: null },
    { game: "Predators vs Wild", winner: null },
    { game: "Sharks vs Kraken", winner: null },
    { game: "Oilers vs Avalanche", winner: null },
    { game: "Utah HC vs Golden Knights", winner: null }
  ],
  sunday: [
    { game: "Canucks vs Red Wings", winner: null },
    { game: "Canadiens vs Bruins", winner: null },
    { game: "Blue Jackets vs Blackhawks", winner: null },
    { game: "Jets vs Stars", winner: null },
    { game: "Senators vs Ducks", winner: null }
  ]
};



// Function to calculate wins for each player
const calculateWins = (playerPicks, gameResults) => {
  let wins = 0;

  ["friday", "saturday", "sunday"].forEach((day) => {
    if (!playerPicks[`${day}Picks`] || !gameResults[day]) return;

    playerPicks[`${day}Picks`].forEach((pick) => {
      const gameResult = gameResults[day].find(
        (result) => result.game === pick.game
      );
      if (gameResult && gameResult.winner && gameResult.winner === pick.pick) {
        wins++;
      }
    });
  });

  return wins;
};

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
    const existingPlayerIndex = playersData.findIndex(
      (player) => player.name === newPicks.name
    );
    const updatedPicks = {
      name: newPicks.name,
      fridayPicks: newPicks.friday,
      saturdayPicks: newPicks.saturday,
      sundayPicks: newPicks.sunday,
    };

    if (existingPlayerIndex !== -1) {
      const updatedPlayers = [...playersData];
      updatedPlayers[existingPlayerIndex] = {
        ...updatedPlayers[existingPlayerIndex],
        ...updatedPicks,
      };
      setPlayersData(updatedPlayers);
    } else {
      setPlayersData((prevPlayers) => [...prevPlayers, updatedPicks]);
    }
  };

  const leaderboard = playersData.map((player) => {
    const gamesPlayed = ["friday", "saturday", "sunday"].reduce((total, day) => {
      if (!player[`${day}Picks`] || !gameResults[day]) return total;

      const dayGamesPlayed = player[`${day}Picks`].filter((pick) =>
        gameResults[day].some(
          (gameResult) => gameResult.game === pick.game && gameResult.winner !== null
        )
      ).length;

      return total + dayGamesPlayed;
    }, 0);

    const timesWon = calculateWins(player, gameResults);
    const winPercentage =
      gamesPlayed > 0 ? ((timesWon / gamesPlayed) * 100).toFixed(2) : 0;

    return {
      name: player.name,
      gamesPlayed,
      timesWon,
      winPercentage,
    };
  }).sort((a, b) => b.winPercentage - a.winPercentage || b.timesWon - a.timesWon); // Sort by win percentage, then by wins

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle the expanded state
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
            <th></th> {/* Column for expand button */}
          </tr>
        </thead>
        <tbody>
          {playersData.length > 0 ? (
            playersData.map((player, index) => (
              <React.Fragment key={index}>
                <tr className="player-row">
                  <td className="player-name">{player.name}</td>

                  {/* Friday Picks */}
                  <td className="picks-column">
                    {player.fridayPicks.slice(0, 1).map((pickData, i) => (
                      <div key={i} className="game-pick">
                        {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
                      </div>
                    ))}
                    {expandedRows[index] &&
                      player.fridayPicks.slice(1).map((pickData, i) => (
                        <div key={i} className="game-pick">
                          {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
                        </div>
                      ))}
                  </td>

                  {/* Saturday Picks */}
                  <td className="picks-column">
                    {player.saturdayPicks.slice(0, 1).map((pickData, i) => (
                      <div key={i} className="game-pick">
                        {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
                      </div>
                    ))}
                    {expandedRows[index] &&
                      player.saturdayPicks.slice(1).map((pickData, i) => (
                        <div key={i} className="game-pick">
                          {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
                        </div>
                      ))}
                  </td>

                  {/* Sunday Picks */}
                  <td className="picks-column">
                    {player.sundayPicks.slice(0, 1).map((pickData, i) => (
                      <div key={i} className="game-pick">
                        {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
                      </div>
                    ))}
                    {expandedRows[index] &&
                      player.sundayPicks.slice(1).map((pickData, i) => (
                        <div key={i} className="game-pick">
                          {pickData.game}: <strong className="picked-team">{pickData.pick}</strong>
                        </div>
                      ))}
                  </td>

                  {/* Expand/Collapse Button */}
                  <td>
                    <button
                      className="expand-button"
                      onClick={() => toggleRow(index)}
                    >
                      {expandedRows[index] ? "Show Less" : "Show More"}
                    </button>
                  </td>
                </tr>

                {/* Blue bar separator */}
                <tr className="separator-row">
                  <td colSpan="5" className="blue-bar"></td>
                </tr>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No players found.
              </td>
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
            <th>Times Won</th>
            <th>Win Percentage</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length > 0 ? (
            leaderboard.map((player, index) => (
              <tr key={index}>
                <td>{player.name}</td>
                <td>{player.gamesPlayed}</td>
                <td>{player.timesWon}</td>
                <td>{player.winPercentage}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No players in leaderboard.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
