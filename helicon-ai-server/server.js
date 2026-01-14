import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1",
        prompt,
        stream: false
      })
    });

    const data = await ollamaRes.json();
    res.json({ reply: data.response });
  } catch (err) {
    res.status(500).json({ error: "Ollama not available" });
  }
});

app.listen(3000, () => {
  console.log("HELICON AI server running on http://localhost:3000");
});
