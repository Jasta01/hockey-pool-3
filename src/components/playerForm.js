import React, { useState } from 'react';
import "./playerForm.css";

// Define the schedule as an array
const schedule = [
  {
    day: "friday",
    games: [
      { game: "Sharks vs Kings" },
      { game: "Senators vs Golden Knights" }
    ]
  },
  {
    day: "saturday",
    games: [
      { game: "Red Wings vs Sabres" }
    ]
  },
  {
    day: "sunday",
    games: [
      { game: "Oilers vs Red Wings" }
    ]
  }
];

const PlayerForm = () => {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [fridayPicks, setFridayPicks] = useState([]);
  const [saturdayPicks, setSaturdayPicks] = useState([]);
  const [sundayPicks, setSundayPicks] = useState([]);

  const handlePickChange = (day, index, value) => {
    if (day === "friday") {
      const updatedPicks = [...fridayPicks];
      updatedPicks[index] = value;
      setFridayPicks(updatedPicks);
    } else if (day === "saturday") {
      const updatedPicks = [...saturdayPicks];
      updatedPicks[index] = value;
      setSaturdayPicks(updatedPicks);
    } else if (day === "sunday") {
      const updatedPicks = [...sundayPicks];
      updatedPicks[index] = value;
      setSundayPicks(updatedPicks);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: selectedPlayer,
      friday: fridayPicks,     // Keep as array
      saturday: saturdayPicks, // Keep as array
      sunday: sundayPicks      // Keep as array
    };
  
    try {
      const response = await fetch('/api/handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Send data as JSON
      });
  
      if (!response.ok) {
        throw new Error(`Error saving picks: ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log(result.message);
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
            <option value="Joshua">Joshua</option>
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
