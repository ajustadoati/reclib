import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { sharedRecommendations } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface AIRecognitionResult {
  title: string;
  category: "Books" | "Movies" | "Series" | "TV" | "Music" | "Podcasts" | "Links" | "Kids" | "Other";
  author?: string;
  platformUrl?: string;
  platformName?: string;
  confidence: number;
}

const PLATFORM_SUGGESTIONS: Record<string, { name: string; baseUrl: string }> = {
  Books: { name: "Goodreads", baseUrl: "https://www.goodreads.com/search?q=" },
  Movies: { name: "IMDb", baseUrl: "https://www.imdb.com/find?q=" },
  Series: { name: "IMDb", baseUrl: "https://www.imdb.com/find?q=" },
  TV: { name: "IMDb", baseUrl: "https://www.imdb.com/find?q=" },
  Music: { name: "Spotify", baseUrl: "https://open.spotify.com/search/" },
  Podcasts: { name: "Spotify", baseUrl: "https://open.spotify.com/search/" },
  Links: { name: "Google", baseUrl: "https://www.google.com/search?q=" },
  Kids: { name: "IMDb", baseUrl: "https://www.imdb.com/find?q=" },
  Other: { name: "Google", baseUrl: "https://www.google.com/search?q=" },
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/recognize", async (req: Request, res: Response) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that analyzes images to identify media recommendations (books, movies, TV shows, music, podcasts). 

Analyze the image and extract:
1. The title of the media
2. The category (Books, Movies, TV, Music, Podcasts, or Other)
3. The author/artist/director if visible
4. Your confidence level (0-1)

Respond in JSON format:
{
  "title": "string",
  "category": "Books" | "Movies" | "TV" | "Music" | "Podcasts" | "Other",
  "author": "string or null",
  "confidence": 0.0-1.0
}

If you cannot identify the content, make your best guess based on visual cues like book covers, movie posters, album art, etc.`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                },
              },
              {
                type: "text",
                text: "What media recommendation is shown in this image? Extract the title, category, and any creator information.",
              },
            ],
          },
        ],
        max_completion_tokens: 500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return res.status(500).json({ error: "No response from AI" });
      }

      const parsed = JSON.parse(content);
      const category = parsed.category || "Other";
      const platform = PLATFORM_SUGGESTIONS[category];
      const encodedTitle = encodeURIComponent(parsed.title || "");

      const result: AIRecognitionResult = {
        title: parsed.title || "Unknown Title",
        category: category,
        author: parsed.author || undefined,
        platformUrl: `${platform.baseUrl}${encodedTitle}`,
        platformName: platform.name,
        confidence: parsed.confidence || 0.5,
      };

      res.json(result);
    } catch (error) {
      console.error("Recognition error:", error);
      res.status(500).json({ error: "Failed to recognize content" });
    }
  });

  // Text-based recognition endpoint (cheaper than image-based)
  app.post("/api/recognize-text", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Text data is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use cheaper model for text processing
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that analyzes OCR text extracted from screenshots to identify media recommendations (books, movies, TV shows, series, music, podcasts).

Analyze the text and extract:
1. The title of the media (look for the most prominent title, often a book/movie/show name)
2. The category: Books, Movies, Series, TV, Music, Podcasts, Links, Kids, or Other
3. The author/artist/director if mentioned
4. The platform if mentioned (Netflix, Spotify, Goodreads, etc.)
5. Your confidence level (0-1)

CRITICAL - Title extraction rules:
- Words on SEPARATE LINES often form a SINGLE title. Combine them!
  Example: "NO\\nOTHER\\nCHOICE" should become "No Other Choice"
  Example: "La plaça\\ndel Diamant" should become "La plaça del Diamant"
- For books, author name (usually 1-2 words like "Mercè Rodoreda") comes before the title
- Ignore UI elements like "Play", "Watch", "Subscribe", etc.
- Ignore credits like "postfaci de", "estudi de", "traducció", "editorial"

Respond in JSON format:
{
  "title": "string",
  "category": "Books" | "Movies" | "Series" | "TV" | "Music" | "Podcasts" | "Links" | "Kids" | "Other",
  "author": "string or null",
  "platform": "string or null",
  "confidence": 0.0-1.0
}`,
          },
          {
            role: "user",
            content: `Here is the OCR text extracted from a screenshot. Identify the media recommendation:\n\n${text}`,
          },
        ],
        max_completion_tokens: 300,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return res.status(500).json({ error: "No response from AI" });
      }

      const parsed = JSON.parse(content);
      const category = parsed.category || "Other";
      const platform = PLATFORM_SUGGESTIONS[category];
      const encodedTitle = encodeURIComponent(parsed.title || "");

      const result: AIRecognitionResult = {
        title: parsed.title || "Unknown Title",
        category: category,
        author: parsed.author || undefined,
        platformUrl: `${platform.baseUrl}${encodedTitle}`,
        platformName: parsed.platform || platform.name,
        confidence: parsed.confidence || 0.5,
      };

      res.json(result);
    } catch (error) {
      console.error("Text recognition error:", error);
      res.status(500).json({ error: "Failed to recognize content from text" });
    }
  });

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/share", async (req: Request, res: Response) => {
    try {
      const { title, category, platforms, notes, platformUrl, imageBase64 } = req.body;

      if (!title || !category) {
        return res.status(400).json({ error: "Title and category are required" });
      }

      const sharedAt = Date.now();
      const expiresAt = sharedAt + 30 * 24 * 60 * 60 * 1000;

      const [inserted] = await db
        .insert(sharedRecommendations)
        .values({
          title,
          category,
          platforms: platforms || [],
          notes: notes || null,
          platformUrl: platformUrl || null,
          imageBase64: imageBase64 || null,
          sharedAt,
          expiresAt,
        })
        .returning();

      res.json({
        success: true,
        shareId: inserted.id,
        expiresAt,
      });
    } catch (error) {
      console.error("Share error:", error);
      res.status(500).json({ error: "Failed to share recommendation" });
    }
  });

  app.get("/api/share/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [recommendation] = await db
        .select()
        .from(sharedRecommendations)
        .where(eq(sharedRecommendations.id, id))
        .limit(1);

      if (!recommendation) {
        return res.status(404).json({ error: "Recommendation not found or expired" });
      }

      if (recommendation.expiresAt && recommendation.expiresAt < Date.now()) {
        await db.delete(sharedRecommendations).where(eq(sharedRecommendations.id, id));
        return res.status(404).json({ error: "Recommendation has expired" });
      }

      res.json({
        title: recommendation.title,
        category: recommendation.category,
        platforms: recommendation.platforms,
        notes: recommendation.notes,
        platformUrl: recommendation.platformUrl,
        imageBase64: recommendation.imageBase64,
        sharedAt: recommendation.sharedAt,
      });
    } catch (error) {
      console.error("Fetch shared error:", error);
      res.status(500).json({ error: "Failed to fetch recommendation" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
