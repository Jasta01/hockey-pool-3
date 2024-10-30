import Cors from 'cors';
import { Pool } from 'pg'; // Using pg instead of @vercel/postgres
import bodyParser from 'body-parser';

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

// Main handler function
export default async function handler(req, res) {
  await runCors(req, res);

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
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE 
        SET friday_picks = $2, saturday_picks = $3, sunday_picks = $4;
      `;

      // Log the prepared data for debugging
      console.log('Prepared SQL Data:', [name, friday, saturday, sunday]);

      await pool.query(query, [name, friday, saturday, sunday]);
      res.status(200).json({ message: 'Picks saved successfully!' });

    } else if (req.method === 'GET') {
      // Retrieve player picks from Postgres
      const result = await pool.query('SELECT * FROM player_picks');
      res.status(200).json(result.rows);

    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in handler:', error); // Log error details for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
