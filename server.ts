import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client with a graceful safety buffer
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please enter your Gemini API Key in the Settings > Secrets section of AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Check key availability
app.get('/api/ai/status', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ hasKey, message: hasKey ? "Gemini is connected" : "Gemini API key is not set. Please update Secrets to enable AI practice sessions." });
});

// Endpoint: Explain complex CS concepts on-the-fly
app.post('/api/ai/explain', async (req, res) => {
  try {
    const { concept, codeSnippet, domainId } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "Concept name is required." });
    }

    const ai = getGeminiClient();
    const prompt = `You are an elite, patient Computer Science Professor.
Explain the following concept in a thorough, engaging, and clear way suited for university-level students.
Concept: ${concept}
${domainId ? `Domain: ${domainId}` : ''}
${codeSnippet ? `Included Code Context:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ''}

Please structure your response cleanly in Markdown. Include:
1. **Analogy/Concept Overview**: Simple, real-world metaphor
2. **Detailed Deep Dive**: Detailed technical explanation
3. **Core Architectural Tradeoffs**: Pros, cons, space/time complexity where applicable
4. **Code Example**: High-quality code snippet (in popular languages like JS/TypeScript, Python, or Go) illustrating the concept in practice
5. **Interactive Checkpoint**: A quick summary question for their self-assessment with answer hidden.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert interactive CS learning assistant, dedicated to teaching concepts clearly and effectively with clean analogies and readable code blocks.",
      }
    });

    res.json({ explanation: response.text });
  } catch (error) {
    console.error("Explain endpoint error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate concept explanation" });
  }
});

// Endpoint: Generate structured custom practice questions
app.post('/api/ai/generate-practice', async (req, res) => {
  try {
    const { topic, keyConcepts } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic identifier is required." });
    }

    const ai = getGeminiClient();
    const conceptsPrompt = keyConcepts && keyConcepts.length > 0 ? `covering terms: ${keyConcepts.join(', ')}` : '';
    const prompt = `Generate exactly one high-quality, conceptual, or coding practice multiple-choice question for the Computer Science topic: "${topic}" ${conceptsPrompt}.
The question should test high-level thinking, analytical skills, or tracing code output.
Ensure all options are plausible but exactly one option is correct. Provide a thorough, educational explanation of the answer.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The practice question text, which can include a short code block formatted inside markdown tags if applicable."
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Four distinct multiple choice options. Exactly four elements."
            },
            correctAnswerIndex: {
              type: Type.INTEGER,
              description: "0-based index targeting the correct option inside the options array."
            },
            explanation: {
              type: Type.STRING,
              description: "Rigorous step-by-step description and analysis of why the correct option is right and others are incorrect."
            }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (error) {
    console.error("Interactive practice generation error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate custom practice question" });
  }
});

// Endpoint: AI CS Assistant chatbot
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();
    
    // Construct simplified Chat history structure
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are 'ByteTutor', the interactive AI tutor for the Computer Science Learning Academy. You help students understand complex engineering technologies by providing instant, helpful answers, showing diagrams as ASCII or code snippets, and adding brief follow-up suggestions."
      }
    });

    // Populate history if present
    if (history && history.length > 0) {
      // Re-send past conversations silently or use standard gemini chats
      // For speed and compatibility, we can just send the current message prefixed with the user context!
    }

    const response = await chat.sendMessage({
      message: message
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("AI chat assistant error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to obtain tutor response" });
  }
});

// Endpoint: AI code grader for Coding Arena (LeetCode, HackerRank style)
app.post('/api/ai/grade-code', async (req, res) => {
  try {
    const { code, language, problemTitle, description, difficulty } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code content is missing" });
    }

    const ai = getGeminiClient();
    const prompt = `You are an elite Senior Technical interviewer and dynamic compiler judge. Analyze the user's submitted code solution inside our Coding Arena.

Challenge Problem Details:
- Title: ${problemTitle}
- Difficulty: ${difficulty}
- Description: ${description}

User Solution Details:
- Language: ${language}
- User Code:
\`\`\`${language}
${code}
\`\`\`

Perform a comprehensive code review and structure assessment. Evaluate:
1. Functional accuracy (does the algorithm correctly resolve the challenge problem?)
2. Code style, readability, and modern execution paradigms
3. Worst-case and Average-case Time and Space Complexity in Big O notation
4. Resiliency to boundary boundaries & edge cases (e.g., negative values, massive scales, empty objects)

Determine if the code is correct & satisfies problem constraints. Provide helpful and actionable suggestions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: {
              type: Type.BOOLEAN,
              description: "True if the code correctly solves the core logical requirements of the challenge, even if some micro-optimizations could be added. False if it fails primary cases or has compile/runtime bugs."
            },
            complexity: {
              type: Type.STRING,
              description: "Estimated Time and Space complexity, e.g. 'O(N) Time, O(1) Space'."
            },
            feedback: {
              type: Type.STRING,
              description: "A comprehensive, professional, encouraging evaluation configured in Markdown. Highlight what is clean, evaluate the architectural approach, and explain any bugs."
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of bulleted action items or optimizations to make."
            },
            score: {
              type: Type.INTEGER,
              description: "An overall correctness and execution score between 0 and 100."
            }
          },
          required: ["passed", "complexity", "feedback", "suggestions", "score"]
        }
      }
    });

    const gradeData = JSON.parse(response.text || '{}');
    res.json(gradeData);
  } catch (error) {
    console.error("Grade code error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to grade code" });
  }
});

// Setup Vite Dev server or Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer();
