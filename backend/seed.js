import mongoose from "mongoose";
import fs from "fs";
import Paper from "./models/Paper.js"; // Adjust the path to your Paper model

// --- Configuration ---
const MONGO_URI = "mongodb+srv://admin:1234@cluster0.w1rkjmb.mongodb.net/questionPaperDB?retryWrites=true&w=majority"; // Correct Path
const JSON_FILE_PATH = "C:/Users/wankh/pyq-backend/papers_data.json"; // Path to your JSON data file

// --- Main Seeding Function ---
const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected for seeding");

    // 2. Clear existing data (optional, but recommended for clean seeding)
    await Paper.deleteMany({});
    console.log("🗑️ Cleared existing papers from the database");

    // 3. Read the JSON file
    const papersData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, "utf-8"));
    const papers = papersData.GHRAISONI_EXAMS_WINTER_2022;

    if (!papers || papers.length === 0) {
      console.log("No papers found in the JSON file.");
      return;
    }

    // 4. Insert the new data
    // We use insertMany for better performance with bulk data
    await Paper.insertMany(papers);
    console.log(`🌱 Successfully seeded ${papers.length} papers into the database`);

  } catch (error) {
    console.error("❌ Error seeding the database:", error);
  } finally {
    // 5. Disconnect from the database
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
};

// --- Run the Seeder ---
seedDatabase();