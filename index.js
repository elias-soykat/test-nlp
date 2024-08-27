const express = require("express");
const Groq = require("groq-sdk");
const postgres = require("postgres");
require("dotenv").config();

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Utility function to call Groq LLM with a specific prompt
async function callGroq(messages) {
  const chatCompletion = await groq.chat.completions.create({
    messages,
    model: "llama3-8b-8192",
    temperature: 0,
    max_tokens: 150,
    top_p: 1,
    stream: false,
    stop: null,
  });

  return chatCompletion.choices[0].message.content.trim();
}

// Function to generate SQL query from a user query
async function generateSQLFromQuery(userQuery) {
  const messages = [
    {
      role: "user",
      content: `Convert the following natural language query into a SQL query that I can execute on a PostgreSQL database: "${userQuery}". Only return the SQL query without backticks, and there are two tables: products and sales (products table has 5 columns product_id, product_name, category, price and sales table has 5 columns sale_id, product_id, quantity, sale_amount, sale_date). Return only the SQL query, nothing else.`,
    },
  ];

  const sqlQuery = await callGroq(messages);
  if (!sqlQuery.toUpperCase().startsWith("SELECT")) {
    throw new Error(
      "The generated output does not appear to be a valid SQL query."
    );
  }

  return sqlQuery;
}

// Function to format the SQL result using Groq LLM
async function formatResultWithGroq(result) {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant that formats data in a human-readable way.",
    },
    {
      role: "user",
      content: `Format the following SQL query result into a well-structured table or list:\n\n${JSON.stringify(
        result
      )}`,
    },
  ];

  return callGroq(messages);
}

// Endpoint to handle the query
app.post("/query", async (req, res) => {
  try {
    const { userQuery } = req.body;
    const sqlQuery = await generateSQLFromQuery(userQuery);
    const result = await sql.unsafe(sqlQuery);

    if (result.length > 0) {
      const formattedResult = await formatResultWithGroq(result);
      res.json({ formattedResult });
    } else {
      res.json({ message: "No results found." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
