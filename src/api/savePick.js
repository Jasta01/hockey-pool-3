import fs from 'fs';
import path from 'path';

export default async (req, res) => {
  if (req.method === "POST") {
    try {
      const picks = req.body;

      // Validate if picks data has the required structure
      if (!picks || !picks.name || !picks.fridayPicks || !picks.saturdayPicks || !picks.sundayPicks) {
        return res.status(400).json({ message: "Invalid picks data." });
      }

      // Define the path to the picks.json file
      const filePath = path.join(process.cwd(), 'public', 'picks.json');

      // Read existing data or initialize an empty array if the file doesn't exist
      let fileData = [];
      if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        fileData = rawData ? JSON.parse(rawData) : [];
      }

      // Add the new picks to the file data
      fileData.push(picks);

      // Write updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

      res.status(200).json({ message: "Picks saved successfully!" });
    } catch (error) {
      console.error("Error writing to file:", error);
      res.status(500).json({ message: "Error saving picks." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
