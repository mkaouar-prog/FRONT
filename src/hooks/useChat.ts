// src/hooks/useChat.ts
import { useState } from 'react';

export interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async (userInput: string) => {
    // Add the user's message to the conversation.
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: userInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const botResponse = await fetchGeminiResponse(userInput);
      const botMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        text: "Désolé, une erreur s'est produite.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage };
};

// --- Helper function to call the Gemini API ---
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
      messages: [
        { role: "user", content: prompt }
      ]
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Gemini API error:', errorBody);
    throw new Error('API request failed');
  }

  const data = await response.json();
  // The response is expected to have the structure:
  // { choices: [ { message: { content: "..." } } ] }
  return data.choices[0].message.content;
}
