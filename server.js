const express = require("express");
const Groq = require("groq-sdk");

const app = express();
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static("public"));

app.post("/roast", async (req, res) => {
  const { text, type } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a brutally honest, witty roast master. Roast the following ${type || "text"} mercilessly but cleverly. Be funny, sharp, and specific to what they wrote.

Return your response in this exact JSON format with no markdown or extra text:
{
  "score": <a number from 0-100 rating how good the ${type} is, where 0 is catastrophically bad and 100 is perfect>,
  "roast": "<your brutal roast in under 150 words>",
  "redemption": "<specific actionable improvements in under 100 words>"
}

Here is what to roast:
${text}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Roast failed. Try again." });
  }
});

app.listen(3000, () => {
  console.log("Roast Engine running on http://localhost:3000");
});