import React, { useState, useEffect } from "react";
import "./App.css";
import PlayerForm from "./components/playerForm";

const games = {
  friday: [
    { game: "Red Wings vs Hurricanes", winner: "Hurricanes" },
    { game: "Oilers vs Islanders", winner: "Oilers" },
    { game: "Stars vs Jets", winner: "Jets" },
    { game: "Avalanche vs Flames", winner: "Avalanche" },
    { game: "Predators vs Ducks", winner: "Ducks" },
    { game: "Utah Hockey Club vs Kraken", winner: "Kraken" }
  ],
  saturday: [
    { game: "Golden Knights vs Sabres", winner: "Sabres" },
    { game: "Devils vs Penguins", winner: "Penguins" },
    { game: "Capitals vs Sharks", winner: "Capitals" },
    { game: "Panthers vs Canadiens", winner: "Canadiens" },
    { game: "Hurricanes vs Flyers", winner: "Hurricanes" },
    { game: "Rangers vs Blue Jackets", winner: "Rangers" },
    { game: "Senators vs Maple Leafs", winner: "Senators" },
    { game: "Lightning vs Bruins", winner: "Lightning" },
    { game: "Blues vs Wild", winner: "Blues" },
    { game: "Predators vs Kings", winner: "Kings" },
    { game: "Blackhawks vs Canucks", winner: "Canucks" }
  ],
  sunday: [
    { game: "Golden Knights vs Red Wings", winner: null" },
    { game: "Stars vs Avalanche", winner: null },
    { game: "Ducks vs Blues", winner: null },
    { game: "Oilers vs Rangers", winner: null },
    { game: "Panthers vs Islanders", winner: null },
    { game: "Utah Hockey Club vs Canucks", winner: null },
    { game: "Jets vs Kraken", winner: null }
  ]
};

const calculateWins = (playerPicks, games) => {
  let wins = 0;

  ["friday", "saturday", "sunday"].forEach((day) => {
    if (!playerPicks[`${day}Picks`] || !games[day]) return;

    playerPicks[`${day}Picks`].forEach((pick) => {
      const gameResult = games[day].find(
        (result) => result.game === pick.game
      );
      if (gameResult && gameResult.winner === pick.pick) {
        wins++;
      }
    });
  });

  return wins;
};

const PlayerTable = ({ playersData, expandedRows, toggleRow }) => (
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
                {renderPicks(player.fridayPicks, games.friday, expandedRows, index)}
              </td>
              <td className="picks-column">
                {renderPicks(player.saturdayPicks, games.saturday, expandedRows, index)}
              </td>
              <td className="picks-column">
                {renderPicks(player.sundayPicks, games.sunday, expandedRows, index)}
              </td>
              <td>
                <button className="expand-button" onClick={() => toggleRow(index)}>
                  {expandedRows[index] ? "Show Less" : "Show More"}
                </button>
              </td>
            </tr>
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
);

const renderPicks = (picks, results, expandedRows, index) => (
  <>
    {picks.slice(0, 1).map((pickData, i) => renderPick(pickData, results, i))}
    {expandedRows[index] &&
      picks.slice(1).map((pickData, i) => renderPick(pickData, results, i))}
  </>
);

const renderPick = (pickData, results, i) => {
  const gameResult = results.find((result) => result.game === pickData.game);
  const isWinner = gameResult && gameResult.winner === pickData.pick;

  return (
    <div key={i} className="game-pick">
      {pickData.game}:{" "}
      <strong className={`picked-team ${isWinner ? "highlight-winner" : ""}`}>
        {pickData.pick}
      </strong>
    </div>
  );
};

const Leaderboard = ({ leaderboard }) => (
  <table className="leaderboard-table">
    <thead>
      <tr>
        <th>Player</th>
        <th>Games Played</th>
        <th>Games Won</th>
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
);

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

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const leaderboard = playersData
    .map((player) => {
      const gamesPlayed = ["friday", "saturday", "sunday"].reduce(
        (total, day) => {
          if (!player[`${day}Picks`] || !games[day]) return total;
          const dayGamesPlayed = player[`${day}Picks`].filter((pick) => {
            const gameResult = games[day].find(
              (gameResult) => gameResult.game === pick.game
            );
            return gameResult && gameResult.winner;
          }).length;
          return total + dayGamesPlayed;
        },
        0
      );

      const timesWon = calculateWins(player, games);
      const winPercentage =
        gamesPlayed > 0 ? ((timesWon / gamesPlayed) * 100).toFixed(2) : 0;

      return {
        name: player.name,
        gamesPlayed,
        timesWon,
        winPercentage,
      };
    })
    .sort((a, b) => b.winPercentage - a.winPercentage || b.timesWon - a.timesWon);

  return (
    <div className="App">
      <h1 className="app-title">Hockey Pool</h1>
      <PlayerForm games={games} onSavePicks={(newPicks) => setPlayersData(newPicks)} />
      <PlayerTable
        playersData={playersData}
        expandedRows={expandedRows}
        toggleRow={toggleRow}
      />
      <h2 className="leaderboard-title">Leaderboard</h2>
      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
}

export default App;
