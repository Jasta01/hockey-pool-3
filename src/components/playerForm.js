import React, { useState, useEffect } from 'react';
import "./playerForm.css";

// Updated schedule with the new games
const schedule = [
  {
    day: "friday",
    games: [
      { game: "Blackhawks vs Sharks" },
      { game: "Panthers vs Stars" },
      { game: "Jets vs Blue Jackets" },
      { game: "Senators vs Rangers" },
      { game: "Islanders vs Sabres" },
      { game: "Lightning vs Wild" },
      { game: "Devils vs Flames" }
    ]
  },
  {
    day: "saturday",
    games: [
      { game: "Stars vs Panthers" },
      { game: "Bruins vs Flyers" },
      { game: "Blackhawks vs Kings" },
      { game: "Blue Jackets vs Capitals" },
      { game: "Maple Leafs vs Blues" },
      { game: "Kraken vs Senators" },
      { game: "Canadians vs Penguins" },
      { game: "Sabres vs Red Wings" },
      { game: "Avalanche vs Predators" },
      { game: "Utah HC vs Golden Knights" },
      { game: "Canucks vs Sharks" }
    ]
  },
  {
    day: "sunday",
    games: [
      { game: "Islanders vs Rangers" },
      { game: "Lightning vs Jets" },
      { game: "Capitals vs Hurricanes" },
      { game: "Kraken vs Bruins" },
      { game: "Maple Leafs vs Wild" },
      { game: "Oilers vs Flames" },
      { game: "Blackhawks vs Ducks" }
    ]
  }
];

const PlayerForm = ({ onSavePicks }) => {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [fridayPicks, setFridayPicks] = useState([]);
  const [saturdayPicks, setSaturdayPicks] = useState([]);
  const [sundayPicks, setSundayPicks] = useState([]);
  const [playerList, setPlayerList] = useState([]);
  const [playersData, setPlayersData] = useState([]);

  useEffect(() => {
    fetch('/api/handler')
      .then(response => response.json())
      .then(data => {
        setPlayersData(data);
        const activePlayers = data.map(player => player.name);
        setPlayerList([
          "Joshua",
          "John Crocker",
          "John Loder",
          "Andrew",
          "Wrinkles",
          "Bunsey",
          "Dean/JD",
          "Adam",
          "Sadie",
          "Landon",
          "Clifford",
          "Dave Rawding"
        ].filter(player => !activePlayers.includes(player)));
      })
      .catch(error => console.error("Error loading players:", error));
  }, []);

  const handlePickChange = (day, index, value) => {
    const updatePicks = (dayPicks, setDayPicks) => {
      const updatedPicks = [...dayPicks];
      updatedPicks[index] = { game: schedule.find(d => d.day === day).games[index].game, pick: value }; // Store the game and pick
      setDayPicks(updatedPicks);
    };
    if (day === "friday") updatePicks(fridayPicks, setFridayPicks);
    if (day === "saturday") updatePicks(saturdayPicks, setSaturdayPicks);
    if (day === "sunday") updatePicks(sundayPicks, setSundayPicks);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlayer || fridayPicks.length !== schedule[0].games.length ||
        saturdayPicks.length !== schedule[1].games.length || sundayPicks.length !== schedule[2].games.length) {
      alert("Please complete all picks and select a player name.");
      return;
    }

    const data = {
      name: selectedPlayer,
      friday: fridayPicks,
      saturday: saturdayPicks,
      sunday: sundayPicks
    };

    try {
      const response = await fetch('/api/handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Error saving picks: ${response.statusText}`);

      const result = await response.json();
      console.log(result.message);
      onSavePicks(data); // Updates parent component
      setSelectedPlayer('');
      setFridayPicks([]);
      setSaturdayPicks([]);
      setSundayPicks([]);
    } catch (error) {
      console.error('Error saving picks:', error);
    }
  };

  return (
    <div className="player-form">
      <h2 className="form-title">Player Picks</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Select Player:</label>
          <select
            onChange={(e) => setSelectedPlayer(e.target.value)}
            value={selectedPlayer}
            className="player-select"
          >
            <option value="">Choose Player</option>
            {playerList.map(player => (
              <option key={player} value={player}>{player}</option>
            ))}
          </select>
        </div>

        {schedule.map(({ day, games }) => (
          <div key={day} className="day-section">
            <h3 className="day-title">{day.charAt(0).toUpperCase() + day.slice(1)}'s Games</h3>
            {games.map((game, index) => (
              <div key={index} className="game-item">
                <label className="game-label">{game.game}</label>
                <select
                  onChange={(e) => handlePickChange(day, index, e.target.value)}
                  value={day === "friday" ? fridayPicks[index] : day === "saturday" ? saturdayPicks[index] : sundayPicks[index] || ""}
                  className="game-select"
                >
                  <option value="">Select Winner</option>
                  <option value={game.game.split(" vs ")[0]}>
                    {game.game.split(" vs ")[0]}
                  </option>
                  <option value={game.game.split(" vs ")[1]}>
                    {game.game.split(" vs ")[1]}
                  </option>
                </select>
              </div>
            ))}
          </div>
        ))}

        <button type="submit" className="submit-button">Save Picks</button>
      </form>
    </div>
  );
};

export default PlayerForm;
