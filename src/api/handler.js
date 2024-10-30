]import Cors from 'cors';
import { Client } from '@vercel/postgres';

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST', 'GET', 'OPTIONS'],
  origin: '*',
});

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

export default async function handler(req, res) {
  await runCors(req, res);

  // Create a new client instance for each request
  const client = new Client({
    connectionString: process.env.POSTGRES_URL, // Ensure this variable is set in your Vercel environment
  });

  try {
    await client.connect(); // Connect to the database

    if (req.method === 'POST') {
      // Save player picks to Postgres
      const { name, friday, saturday, sunday } = req.body;
      const query = `
        INSERT INTO player_picks (name, friday, saturday, sunday)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE 
        SET friday = $2, saturday = $3, sunday = $4;
      `;
      await client.query(query, [name, friday, saturday, sunday]);
      res.status(200).json({ message: 'Picks saved successfully!' });

    } else if (req.method === 'GET') {
      // Retrieve player picks from Postgres
      const result = await client.query('SELECT * FROM player_picks');
      res.status(200).json(result.rows);

    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    await client.end(); // Ensure the client is closed after the request
  }
}
