import Cors from 'cors';
import { Pool } from 'pg';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST', 'GET', 'OPTIONS'],
  origin: '*', // Allow all origins (consider restricting this in production)
});

// Function to run CORS middleware
function runCors(req, res) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Create a new pool instance for connecting to the database
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Ensure this environment variable is set in Vercel
});

// Function to fetch NHL schedule
const fetchNHLData = async () => {
  const scheduleResponse = await fetch("https://api-web.nhle.com/v1/schedule");
  const scheduleData = await scheduleResponse.json();

  const scoreboardResponse = await fetch("https://api-web.nhle.com/v1/scoreboard");
  const scoreboardData = await scoreboardResponse.json();

  const formattedGames = { friday: [], saturday: [], sunday: [] };

  scheduleData.gameWeek.forEach((game) => {
    const gameDate = new Date(game.gameDate);
    const day = gameDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

    if (formattedGames[day]) {
      formattedGames[day].push({
        game: `${game.awayTeam.abbrev} vs ${game.homeTeam.abbrev}`,
        winner: null, // Initially set to null
      });
    }
  });

  scoreboardData.games.forEach((game) => {
    const gameStr = `${game.awayTeam.abbrev} vs ${game.homeTeam.abbrev}`;
    const winner = game.awayScore > game.homeScore ? game.awayTeam.abbrev : game.homeTeam.abbrev;

    Object.keys(formattedGames).forEach((day) => {
      formattedGames[day] = formattedGames[day].map((g) =>
        g.game === gameStr ? { ...g, winner } : g
      );
    });
  });

  return formattedGames;
};

// Main handler function
export default async function handler(req, res) {
  await runCors(req, res);

  // Use body-parser middleware to parse JSON
  bodyParser.json()(req, res, async () => {
    try {
      // Log the request body for debugging
      const body = req.body;
      console.log("Request body:", body);

      if (req.method === 'POST') {
        // Save player picks to Postgres
        const { name, friday, saturday, sunday } = body;

        // SQL query to insert or update player picks
        const query = `
          INSERT INTO player_picks (name, friday_picks, saturday_picks, sunday_picks)
          VALUES ($1, $2::json, $3::json, $4::json)
          ON CONFLICT (name) DO UPDATE 
          SET friday_picks = $2::json, saturday_picks = $3::json, sunday_picks = $4::json;
        `;

        // Log the prepared data for debugging
        console.log('Prepared SQL Data:', [name, friday, saturday, sunday]);

        await pool.query(query, [
          name,
          JSON.stringify(friday),  // Convert array to JSON string
          JSON.stringify(saturday), // Convert array to JSON string
          JSON.stringify(sunday)    // Convert array to JSON string
        ]);

        res.status(200).json({ message: 'Picks saved successfully!' });

      } else if (req.method === 'GET') {
        // Retrieve and format player picks from Postgres
        const result = await pool.query(`
          SELECT name, friday_picks, saturday_picks, sunday_picks 
          FROM player_picks
        `);

        // Format the data for the frontend
        const playersData = result.rows.map((row) => ({
          name: row.name,
          fridayPicks: row.friday_picks || [],
          saturdayPicks: row.saturday_picks || [],
          sundayPicks: row.sunday_picks || []
        }));

        // Fetch NHL schedule and game results
        const games = await fetchNHLData();

        res.status(200).json({ playersData, games });

      } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } catch (error) {
      console.error('Error in handler:', error); // Log error details for debugging
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
}
