import fs from 'fs';
import path from 'path';

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  if (req.method === "POST") {
    const picksData = req.body;
    const filePath = path.join(process.cwd(), "public", "picks.json");

    try {
      const currentData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      currentData.push(picksData);

      fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
      res.status(200).json({ message: "Picks saved!" });
    } catch (error) {
      console.error("Error saving picks:", error);
      res.status(500).json({ message: "Failed to save picks." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
};
