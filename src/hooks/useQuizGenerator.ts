import { useState } from 'react';

export interface Question {
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export const useQuizGenerator = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New generateQuiz function accepts the course description and chapter descriptions.
  const generateQuiz = async (courseTitle: string,courseDescription: string, chapterDescriptions: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Generate a quiz for a course titled "${courseTitle}" with the following course description:
      
"${courseDescription}"

And for the following chapter descriptions:
      
${chapterDescriptions.map(desc => `"${desc}"`).join(", ")}

Return the quiz in strict JSON format following this schema:

{
  "Title": "string",
  "Questions": [
    {
      "Text": "string",
      "Options": ["string", "string", "string", "string"],
      "CorrectOptionIndex": number
    }
  ]
}

Ensure there are at least 4 questions in the quiz. Return only the JSON object.`;

      const quizResponse = await fetchGeminiResponse(prompt);
      let jsonString = quizResponse.trim();
      // Remove markdown code fences if present.
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.slice(7).trim();
        if (jsonString.endsWith("```")) {
          jsonString = jsonString.slice(0, -3).trim();
        }
      } else if (jsonString.startsWith("```") && jsonString.endsWith("```")) {
        jsonString = jsonString.slice(3, -3).trim();
      }
      const parsedQuiz: Quiz = JSON.parse(jsonString);
      setQuiz(parsedQuiz);
    } catch (err) {
      console.error(err);
      setError("Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  return { quiz, loading, error, generateQuiz };
};

async function fetchGeminiResponse(prompt: string): Promise<string> {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not defined in environment variables.");
  }

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/chat/completions";

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gemini-1.5-flash", // Adjust the model as needed
      messages: [{ role: "user", content: prompt }]
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Gemini API error:', errorBody);
    throw new Error('API request failed');
  }

  const data = await response.json();
  // Expected structure: { choices: [ { message: { content: "..." } } ] }
  return data.choices[0].message.content;
}
