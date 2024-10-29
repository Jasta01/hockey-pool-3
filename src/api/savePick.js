import fs from 'fs';
import path from 'path';
import Cors from 'cors';

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST', 'GET', 'OPTIONS'],
  origin: '*', // Change this to your frontend URL in production
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
  await runCors(req, res); // Run CORS middleware

  if (req.method === 'POST') {
    const picksData = req.body;

    // Path to your JSON file
    const filePath = path.join(process.cwd(), 'picks.json');

    // Read current data from the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error reading file' });
      }

      // Parse current data and add new picks
      let picks = JSON.parse(data);
      const existingPlayerIndex = picks.findIndex(player => player.name === picksData.name);
      
      if (existingPlayerIndex !== -1) {
        // Update existing player picks
        picks[existingPlayerIndex] = { ...picks[existingPlayerIndex], ...picksData };
      } else {
        // Add new player picks
        picks.push(picksData);
      }

      // Write updated data back to the JSON file
      fs.writeFile(filePath, JSON.stringify(picks, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error writing file' });
        }
        return res.status(200).json({ message: 'Picks saved successfully!' });
      });
    });
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
