import fetch from 'node-fetch';

export const translateComment = async (req, res) => {
  const { q, target } = req.body;

  try {
    const response = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q,
        source: "auto",
        target,
        format: "text"
      })
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok || !contentType.includes('application/json')) {
      const text = await response.text(); // fallback to read HTML
      console.error("LibreTranslate error:", text);
      return res.status(500).json({ error: 'Failed to fetch translation', raw: text });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("Translate API error:", error);
    res.status(500).json({ error: "Translation failed", details: error.message });
  }
};
