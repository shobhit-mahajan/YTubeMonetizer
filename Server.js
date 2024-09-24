const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for all routes

// Define the route for checking monetization status
app.get('/checkMonetization', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL is required' });
  }

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Navigate to the YouTube video page
    await page.goto(videoUrl, { waitUntil: 'networkidle2' });

    // Wait for the video page to load completely
    await page.waitForSelector('#primary');

    // Get the page content (HTML)
    const content = await page.content();
    // Check for monetization marker in the HTML content
    const isMonetized = content.includes('"key":"yt_ad","value":"1"');

    // Close Puppeteer browser
    await browser.close();

    // Respond with the result
    res.json({
      monetized: isMonetized,
      message: isMonetized ? 'Video is monetized' : 'Video is not monetized',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while checking the video.' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
