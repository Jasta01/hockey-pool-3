import Cors from 'cors';

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST', 'GET', 'OPTIONS'],
  origin: '*', // Update this in production to restrict origins
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

// In-memory storage for demonstration
let picks = [];

export default async function handler(req, res) {
  await runCors(req, res);

  if (req.method === 'POST') {
    const picksData = req.body;

    const existingPlayerIndex = picks.findIndex(player => player.name === picksData.name);
    if (existingPlayerIndex !== -1) {
      picks[existingPlayerIndex] = { ...picks[existingPlayerIndex], ...picksData };
    } else {
      picks.push(picksData);
    }

    // Log the data to console instead of writing to a file
    console.log("Updated Picks:", JSON.stringify(picks, null, 2));
    return res.status(200).json({ message: 'Picks saved successfully!' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
