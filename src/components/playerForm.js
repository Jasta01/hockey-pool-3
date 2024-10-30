import React, { useState } from 'react';
import "./playerForm.css"

const PlayerForm = () => {
  const [playerName, setPlayerName] = useState('');
  const [fridayPicks, setFridayPicks] = useState('');
  const [saturdayPicks, setSaturdayPicks] = useState('');
  const [sundayPicks, setSundayPicks] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: playerName,
      friday: JSON.stringify(fridayPicks), // Ensure these are valid JSON
      saturday: JSON.stringify(saturdayPicks),
      sunday: JSON.stringify(sundayPicks),
    };

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
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Friday Picks:</label>
        <input
          type="text"
          value={fridayPicks}
          onChange={(e) => setFridayPicks(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Saturday Picks:</label>
        <input
          type="text"
          value={saturdayPicks}
          onChange={(e) => setSaturdayPicks(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Sunday Picks:</label>
        <input
          type="text"
          value={sundayPicks}
          onChange={(e) => setSundayPicks(e.target.value)}
          required
        />
      </div>
      <button type="submit">Submit Picks</button>
    </form>
  );
};

export default PlayerForm;
