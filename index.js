import express from "express";
import chromium from "chrome-aws-lambda";

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// Fungsi umum ambil username (pakai Chrome AWS Lambda)
// ======================
async function getUsername(url, selectorFunc) {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const username = await page.evaluate(selectorFunc);
  await browser.close();
  return username;
}

// ======================
// TikTok
// ======================
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

// ======================
// Instagram
// ======================
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

// ======================
// Facebook
// ======================
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

// ======================
app.get("/", (req, res) => {
  res.json({
    info: "Gunakan endpoint /tiktok, /instagram, /facebook dengan parameter ?url=",
    contoh: "/tiktok?url=https://www.tiktok.com/@username",
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

