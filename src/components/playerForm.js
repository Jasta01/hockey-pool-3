import React, { useState } from 'react';
import "./playerForm.css";

const PlayerForm = ({ schedule = { friday: [], saturday: [], sunday: [] } }) => {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [fridayPicks, setFridayPicks] = useState('');
  const [saturdayPicks, setSaturdayPicks] = useState('');
  const [sundayPicks, setSundayPicks] = useState('');

  const handlePickChange = (day, value) => {
    if (day === 'friday') {
      setFridayPicks(value);
    } else if (day === 'saturday') {
      setSaturdayPicks(value);
    } else if (day === 'sunday') {
      setSundayPicks(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: selectedPlayer,
      friday: fridayPicks,
      saturday: saturdayPicks,
      sunday: sundayPicks,
    };

    console.log('Data to be sent:', data); // Log the data being sent

    try {
      const response = await fetch('/api/handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Ensure data is stringified
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
            {/* Add more player options here if needed */}
          </select>
        </div>

        {["friday", "saturday", "sunday"].map((day) => (
          <div key={day} className="day-section">
            <h3 className="day-title">{day.charAt(0).toUpperCase() + day.slice(1)}'s Games</h3>
            {schedule[day]?.map((game, index) => (
              <div key={index} className="game-item">
                <label className="game-label">{game.game}</label>
                <select
                  onChange={(e) => handlePickChange(day, e.target.value)}
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
