import React, { useState, useEffect } from "react";
import "./playerForm.css";

function PlayerForm({ onSavePicks }) {
  const [schedule, setSchedule] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerPicks, setPlayerPicks] = useState({ friday: [], saturday: [], sunday: [] });

  useEffect(() => {
    fetch("/schedule.json")
      .then((response) => response.json())
      .then((data) => setSchedule(data))
      .catch((error) => console.error("Error loading schedule:", error));
  }, []);

  const handlePickChange = (day, index, pick) => {
    setPlayerPicks((prevPicks) => {
      const updatedPicks = [...prevPicks[day]];
      updatedPicks[index] = { game: schedule[day][index].game, pick };
      return { ...prevPicks, [day]: updatedPicks };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedPlayer) {
      alert("Please select a player.");
      return;
    }
    
    const dataToSubmit = { name: selectedPlayer, ...playerPicks };

    onSavePicks(dataToSubmit);

    fetch("/api/savePicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSubmit),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed: ${errorText}`);
        }
        return response.json();
      })
      .then((data) => alert(data.message))
      .catch((error) => console.error("Error saving picks:", error));
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

        {["friday", "saturday", "sunday"].map((day) => (
          <div key={day} className="day-section">
            <h3 className="day-title">{day.charAt(0).toUpperCase() + day.slice(1)}'s Games</h3>
            {schedule[day]?.map((game, index) => (
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
}

export default PlayerForm;
