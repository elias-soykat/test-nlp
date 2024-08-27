const postgres = require("postgres");
const fs = require("fs");
require("dotenv").config();

// Initialize PostgreSQL connection
const sql = postgres({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${process.env.ENDPOINT_ID}`,
  },
});

async function seedDatabase() {
  try {
    // Read the SQL files
    const createTablesSQL = fs.readFileSync("./sql/create_tables.sql", "utf8");
    const seedDataSQL = fs.readFileSync("./sql/seed_data.sql", "utf8");

    // Execute the SQL commands
    await sql.unsafe(createTablesSQL);
    console.log("Tables created successfully.");

    await sql.unsafe(seedDataSQL);
    console.log("Data seeded successfully.");
  } catch (error) {
    console.error("Error seeding the database:", error);
  } finally {
    await sql.end(); // Close the database connection
  }
}

seedDatabase();
