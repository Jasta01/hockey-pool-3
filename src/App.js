import React, { useState, useEffect } from "react";
import "./App.css";
import PlayerForm from "./components/playerForm.js";

// Sample results for each game
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
  });

  // Sort the leaderboard by win percentage (descending) and then by times won (descending)
  leaderboard.sort((a, b) => {
    if (b.winPercentage !== a.winPercentage) {
      return b.winPercentage - a.winPercentage; // Sort by win percentage
    }
    return b.timesWon - a.timesWon; // Sort by wins if win percentage is the same
  });

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
                    {player.fridayPicks && player.fridayPicks.length > 0 ? (
                      <div className="picked-team">
                        {player.fridayPicks[0].game}: {player.fridayPicks[0].pick} {/* Only show the first pick */}
                      </div>
                    ) : (
                      <div>No picks</div>
                    )}
                  </td>
                  <td className="picks-column">
                    {player.saturdayPicks && player.saturdayPicks.length > 0 ? (
                      <div className="picked-team">
                        {player.saturdayPicks[0].game}: {player.saturdayPicks[0].pick} {/* Only show the first pick */}
                      </div>
                    ) : (
                      <div>No picks</div>
                    )}
                  </td>
                  <td className="picks-column">
                    {player.sundayPicks && player.sundayPicks.length > 0 ? (
                      <div className="picked-team">
                        {player.sundayPicks[0].game}: {player.sundayPicks[0].pick} {/* Only show the first pick */}
                      </div>
                    ) : (
                      <div>No picks</div>
                    )}
                  </td>
                  <td>
                    <button
                      className="expand-button"
                      onClick={() => toggleRow(index)}
                    >
                      {expandedRows[index] ? "Show Less" : "Show More"}
                    </button>
                  </td>
                </tr>
                {expandedRows[index] && (
                  <tr>
                    <td colSpan="5" style={{ background: "#f1f1f1" }}>
                      <div className="expanded-picks">
                        <p><strong>Friday Picks:</strong></p>
                        {player.fridayPicks.map((pick, i) => (
                          <div key={i} className="game-pick">
                            {pick.game}: {pick.pick}
                          </div>
                        ))}
                        <p><strong>Saturday Picks:</strong></p>
                        {player.saturdayPicks.map((pick, i) => (
                          <div key={i} className="game-pick">
                            {pick.game}: {pick.pick}
                          </div>
                        ))}
                        <p><strong>Sunday Picks:</strong></p>
                        {player.sundayPicks.map((pick, i) => (
                          <div key={i} className="game-pick">
                            {pick.game}: {pick.pick}
                          </div>
                        ))}
                      </div>
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
            <th>Wins</th>
            <th>Win Percentage</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <tr key={index}>
                <td>{entry.name}</td>
                <td>{entry.gamesPlayed}</td>
                <td>{entry.timesWon}</td>
                <td>{entry.winPercentage}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No leaderboard data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
