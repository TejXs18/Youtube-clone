import fetch from 'node-fetch';

export const translateComment = async (req, res) => {
  const { q, target } = req.body;

  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q,
        source: 'auto',
        target,
        format: 'text'
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Translation failed", details: error.message });
  }
};
