import React, { useState, useEffect } from "react";
import "./App.css";
import PlayerForm from "./components/playerForm";

const App = () => {
  const [games, setGames] = useState({ friday: [], saturday: [], sunday: [] });
  const [playersData, setPlayersData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  // Fetch NHL schedule
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("https://api-web.nhle.com/v1/schedule"); // Adjust endpoint if needed
        const data = await response.json();

        const formattedGames = { friday: [], saturday: [], sunday: [] };

        data.gameWeek.forEach((game) => {
          const gameDate = new Date(game.gameDate);
          const day = gameDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

          if (formattedGames[day]) {
            formattedGames[day].push({
              game: `${game.awayTeam.abbrev} vs ${game.homeTeam.abbrev}`,
              winner: null, // Initially set to null
            });
          }
        });

        setGames(formattedGames);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchGames();
  }, []);

  // Fetch NHL game results and update winners
  useEffect(() => {
    const fetchGameResults = async () => {
      try {
        const response = await fetch("https://api-web.nhle.com/v1/scoreboard");
        const data = await response.json();

        setGames((prevGames) => {
          const updatedGames = { ...prevGames };

          data.games.forEach((game) => {
            const gameStr = `${game.awayTeam.abbrev} vs ${game.homeTeam.abbrev}`;
            const winner =
              game.awayScore > game.homeScore ? game.awayTeam.abbrev : game.homeTeam.abbrev;

            Object.keys(updatedGames).forEach((day) => {
              updatedGames[day] = updatedGames[day].map((g) =>
                g.game === gameStr ? { ...g, winner } : g
              );
            });
          });

          return updatedGames;
        });
      } catch (error) {
        console.error("Error fetching game results:", error);
      }
    };

    // Fetch results every minute
    const interval = setInterval(fetchGameResults, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const leaderboard = playersData
    .map((player) => {
      const gamesPlayed = Object.keys(games).reduce((total, day) => {
        if (!player[`${day}Picks`] || !games[day]) return total;
        const dayGamesPlayed = player[`${day}Picks`].filter((pick) => {
          const gameResult = games[day].find((game) => game.game === pick.game);
          return gameResult && gameResult.winner;
        }).length;
        return total + dayGamesPlayed;
      }, 0);

      const timesWon = calculateWins(player, games);
      const winPercentage = gamesPlayed > 0 ? ((timesWon / gamesPlayed) * 100).toFixed(2) : 0;

      return { name: player.name, gamesPlayed, timesWon, winPercentage };
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
        games={games}
      />
      <h2 className="leaderboard-title">Leaderboard</h2>
      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
};

// Calculate wins based on game results
const calculateWins = (playerPicks, games) => {
  let wins = 0;

  Object.keys(games).forEach((day) => {
    if (!playerPicks[`${day}Picks`] || !games[day]) return;

    playerPicks[`${day}Picks`].forEach((pick) => {
      const gameResult = games[day].find((result) => result.game === pick.game);
      if (gameResult && gameResult.winner === pick.pick) {
        wins++;
      }
    });
  });

  return wins;
};

const PlayerTable = ({ playersData, expandedRows, toggleRow, games }) => (
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
              <td className="picks-column">{renderPicks(player.fridayPicks, games.friday, expandedRows, index)}</td>
              <td className="picks-column">{renderPicks(player.saturdayPicks, games.saturday, expandedRows, index)}</td>
              <td className="picks-column">{renderPicks(player.sundayPicks, games.sunday, expandedRows, index)}</td>
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
          <td colSpan="5" style={{ textAlign: "center" }}>No players found.</td>
        </tr>
      )}
    </tbody>
  </table>
);

const renderPicks = (picks, results, expandedRows, index) => (
  <>
    {picks.slice(0, 1).map((pickData, i) => renderPick(pickData, results, i))}
    {expandedRows[index] && picks.slice(1).map((pickData, i) => renderPick(pickData, results, i))}
  </>
);

const renderPick = (pickData, results, i) => {
  const gameResult = results.find((result) => result.game === pickData.game);
  const isWinner = gameResult && gameResult.winner === pickData.pick;

  return (
    <div key={i} className="game-pick">
      {pickData.game}: <strong className={`picked-team ${isWinner ? "highlight-winner" : ""}`}>{pickData.pick}</strong>
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
      {leaderboard.length > 0 ? leaderboard.map((player, index) => (
        <tr key={index}>
          <td>{player.name}</td>
          <td>{player.gamesPlayed}</td>
          <td>{player.timesWon}</td>
          <td>{player.winPercentage}%</td>
        </tr>
      )) : (
        <tr>
          <td colSpan="4" style={{ textAlign: "center" }}>No players in leaderboard.</td>
        </tr>
      )}
    </tbody>
  </table>
);

export default App;
