import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

async function getUsername(url, selectorFunc) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const username = await page.evaluate(selectorFunc);
  await browser.close();
  return username;
}

// TIKTOK
app.get("/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.json({ error: "Tambahkan ?url=" });
  try {
    const username = await getUsername(url, () => {
      const meta = document.querySelector('meta[property="og:title"]');
      return meta ? meta.content.split("(@")[1]?.split(")")[0] : null;
    });
    res.json({ platform: "tiktok", username: username || "tidak ditemukan" });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// INSTAGRAM
app.get("/instagram", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.json({ error: "Tambahkan ?url=" });
  try {
    const username = await getUsername(url, () => {
      const meta = document.querySelector('meta[property="og:title"]');
      return meta ? meta.content.split("•")[0].trim() : null;
    });
    res.json({ platform: "instagram", username: username || "tidak ditemukan" });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// FACEBOOK
app.get("/facebook", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.json({ error: "Tambahkan ?url=" });
  try {
    const username = await getUsername(url, () => {
      const title = document.title || "";
      const possible = title.split(" | ")[0];
      return possible || null;
    });
    res.json({ platform: "facebook", username: username || "tidak ditemukan" });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Root info
app.get("/", (req, res) => {
  res.json({
    info: "Gunakan endpoint /tiktok, /instagram, /facebook dengan parameter ?url=",
    contoh: "/tiktok?url=https://www.tiktok.com/@username",
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
