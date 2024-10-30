import Cors from 'cors';
import { Pool } from 'pg';

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST', 'GET', 'OPTIONS'],
  origin: '*',
});

// Initialize PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }, // SSL required for Vercel Postgres
});

async function runCors(req, res) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runCors(req, res); // Run CORS middleware

  if (req.method === 'POST') {
    const picksData = req.body;

    try {
      // Connect to the database
      const client = await pool.connect();

      // Check if player exists
      const existingPlayer = await client.query(
        'SELECT * FROM player_picks WHERE name = $1',
        [picksData.name]
      );

      if (existingPlayer.rows.length > 0) {
        // Update picks for existing player
        await client.query(
          'UPDATE player_picks SET friday_picks = $1, saturday_picks = $2, sunday_picks = $3 WHERE name = $4',
          [picksData.friday, picksData.saturday, picksData.sunday, picksData.name]
        );
      } else {
        // Insert new player picks
        await client.query(
          'INSERT INTO player_picks (name, friday_picks, saturday_picks, sunday_picks) VALUES ($1, $2, $3, $4)',
          [picksData.name, picksData.friday, picksData.saturday, picksData.sunday]
        );
      }

      client.release();
      res.status(200).json({ message: 'Picks saved successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error saving picks' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
