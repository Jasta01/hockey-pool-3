import Cors from 'cors';
import { Pool } from 'pg'; // Use pg instead of @vercel/postgres
import dotenv from 'dotenv'; // Import dotenv to manage environment variables

// Load environment variables from .env file
dotenv.config();

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

// Create a new pool instance
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Use the environment variable for the connection string
});

// Main handler function
export default async function handler(req, res) {
  await runCors(req, res);

  try {
    if (req.method === 'POST') {
      // Save player picks to Postgres
      const { name, friday, saturday, sunday } = req.body;

      // SQL query to insert or update player picks
      const query = `
        INSERT INTO player_picks (name, friday, saturday, sunday)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE 
        SET friday = $2, saturday = $3, sunday = $4;
      `;
      
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
