import React, { useState, useEffect } from 'react';
import "./playerForm.css";

// Updated schedule with the new games
const schedule = [
  {
    day: "friday",
    games: [
      { game: "Penguins vs Panthers" },
      { game: "Canadiens vs Blackhawks" },
      { game: "Senators vs Blues" },
      { game: "Ducks vs Oilers" },
      { game: "Predators vs Canucks" }
    ]
  },
  {
    day: "saturday",
    games: [
      { game: "Rangers vs Capitals" },
      { game: "Red Wings vs Jets" },
      { game: "Devils vs Sharks" },
      { game: "Canadiens vs Avalanche" },
      { game: "Bruins vs Maple Leafs" },
      { game: "Wild vs Hurricanes" },
      { game: "Blues vs Blue Jackets" },
      { game: "Utah HC vs Stars" },
      { game: "Lightning vs Kings" },
      { game: "Predators vs Flames" },
      { game: "Sabres vs Golden Knights" },
      { game: "Oilers vs Kraken" }
    ]
  },
  {
    day: "sunday",
    games: [
      { game: "Rangers vs Blackhawks" },
      { game: "Penguins vs Hurricanes" },
      { game: "Islanders vs Bruins" },
      { game: "Flyers vs Maple Leafs" },
      { game: "Lightning vs Ducks" }
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
          "Jon Loder",
          "Andrew",
          "Wrinkles",
          "Bunsey",
          "Dean/JD",
          "Adam",
          "Sadie",
          "Landon",
          "Clifford",
          "Dave Rawding",
          "Darryl",
          "Mike Greely",
          "Rod",
          "JD Squad",
          "Pat"
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
  
    // Check if all picks are filled for each day
    const isAllPicksComplete = (picks, dayIndex) => 
      picks.length === schedule[dayIndex].games.length && picks.every(pick => pick?.pick);
  
    if (!selectedPlayer ||
        !isAllPicksComplete(fridayPicks, 0) ||
        !isAllPicksComplete(saturdayPicks, 1) ||
        !isAllPicksComplete(sundayPicks, 2)) {
      alert("Please complete all picks for each game and select a player name.");
      return;
    }
  
    const data = {
      name: selectedPlayer,
      friday: fridayPicks,
      saturday: saturdayPicks,
      sunday: sundayPicks
    };
  
    console.log("Picks being saved:", JSON.stringify(data, null, 2)); // Log the picks being saved in a readable format
  
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
  
      // Reset form after successful submission
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
      {playerList.length > 0 ? ( // Check if there are players left
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
                    value={day === "friday" ? fridayPicks[index]?.pick : day === "saturday" ? saturdayPicks[index]?.pick : sundayPicks[index]?.pick || ""}
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
      ) : (
        <p>The first game has started, no more picks allowed.</p> // Message if no players are left
      )}
    </div>
  );
};

export default PlayerForm;
