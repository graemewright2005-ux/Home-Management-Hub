process.on('uncaughtException', function (err) { console.error('Uncaught:', err); });
process.on('unhandledRejection', function (reason, p) { console.error('Unhandled Rejection:', reason); });
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const app = express();

app.use(bodyParser.json());

const GITHUB_USER = 'graemewright2005-ux';
const GITHUB_REPO = 'Home-Management-Hub';
const GITHUB_BRANCH = 'main';
const GITHUB_PAT = process.env.GITHUB_PAT;

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/(^-+|-+$)/g, '') + ".json";
}

app.post("/api/save-meal", async (req, res) => {
  try {
    const meal = req.body;
    const mealType = meal.type.toLowerCase();
    const fileName = slugify(meal.title);
    const filePath = `meals/${mealType}/${fileName}`;
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`;
    const mealContent = Buffer.from(JSON.stringify(meal, null, 2)).toString("base64");
    const payload = {
      message: `Add meal: ${meal.title}`,
      content: mealContent,
      branch: GITHUB_BRANCH
    };
    const resp = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_PAT}`,
        "Accept": "application/vnd.github.v3+json"
      },
      body: JSON.stringify(payload)
    });
    const result = await resp.json();
    if (resp.ok) res.json({ success: true, url: result.content.html_url });
    else res.status(resp.status).json({ error: result.message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () => console.log("API listening"));
