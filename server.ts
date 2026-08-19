import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini AI Assistant for Homebrew
  app.post('/api/ai/recommend', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          success: true,
          fallback: true,
          recommendations: [
            {
              name: "ripgrep",
              type: "formula",
              command: "brew install ripgrep",
              reason: "Ultra-fast line-oriented search tool replacing grep and ack",
              category: "Developer Tools"
            },
            {
              name: "bat",
              type: "formula",
              command: "brew install bat",
              reason: "A cat clone with syntax highlighting and Git integration",
              category: "Developer Tools"
            },
            {
              name: "raycast",
              type: "cask",
              command: "brew install --cask raycast",
              reason: "Next-generation Spotlight replacement with powerful extensions",
              category: "Productivity"
            },
            {
              name: "eza",
              type: "formula",
              command: "brew install eza",
              reason: "Modern, maintained replacement for ls with tree views and icons",
              category: "Utilities"
            }
          ],
          advice: "Here are recommended modern CLI & GUI utilities for macOS developers."
        });
      }

      const { prompt, installedPackages, queryType } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const promptText = `
You are an expert macOS and Homebrew package manager assistant.
The user is asking: "${prompt || 'Suggest top modern Homebrew packages'}"
Currently installed packages: ${(installedPackages || []).slice(0, 30).join(', ')}
Query type: ${queryType || 'recommendations'}

Respond ONLY with a valid JSON object matching this exact schema:
{
  "advice": "A 2-3 sentence clear and helpful explanation of your recommendations or diagnosis",
  "recommendations": [
    {
      "name": "package-name",
      "type": "formula" or "cask",
      "command": "brew install ...",
      "reason": "Why this is useful",
      "category": "Category name (e.g. Developer Tools, Productivity, Media, Utilities, AI)"
    }
  ]
}
Do not wrap in markdown quotes if possible, output strict JSON only.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json({ success: true, ...parsed });
    } catch (error: any) {
      console.error('Gemini error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
