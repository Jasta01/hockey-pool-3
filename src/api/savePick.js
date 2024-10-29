import fs from 'fs';
import path from 'path';

// Define and export the API endpoint
export default async (req, res) => {
  if (req.method === "POST") {
    const picksData = req.body;  // Retrieve the picks data from the request body
    const filePath = path.join(process.cwd(), "public", "picks.json");

    try {
      // Read the current picks data from picks.json
      const currentData = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // Add the new picks to the existing data
      currentData.push(picksData);

      // Write the updated data back to picks.json
      fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));

      // Send a success response
      res.status(200).json({ message: "Picks saved!" });
    } catch (error) {
      console.error("Error saving picks:", error);
      
      // Send an error response if something goes wrong
      res.status(500).json({ message: "Failed to save picks." });
    }
  } else {
    // Respond with a 405 error if the request method is not POST
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: "Method not allowed." });
  }
};
