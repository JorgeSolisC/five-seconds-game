// apiConfig.js - Configuraciones de APIs
import { DEFAULT_QUESTIONS } from './localQuestions.js';
import { CATEGORY_PROMPTS } from './categoryPrompts.js';

// Configuraciones de APIs
export const OPENROUTER_CONFIG = {
  url: 'https://openrouter.ai/api/v1/chat/completions',

  getHeaders: () => ({
    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ''}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin || 'https://five-seconds-game.github.io',
    'X-Title': 'Five Seconds Game'
  }),

  // CAMBIO: Ahora recibe el modelo como parámetro
  getBody: (prompt, model = 'google/gemma-3n-e2b-it:free') => ({
    model: model, // Usar el modelo pasado como parámetro
    messages: [{
      role: 'user',
      content: prompt
    }],
    max_tokens: 60,
    temperature: 0.8
  }),

  extractResponse: (data) => {
    try {
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error(error);
      return '';
    }
  }
};

export const HUGGINGFACE_CONFIG = {
  url: 'https://api-inference.huggingface.co/models/google/flan-t5-base',

  getHeaders: () => ({
    'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY || ''}`,
    'Content-Type': 'application/json'
  }),

  getBody: (prompt) => ({
    inputs: prompt,
    parameters: {
      max_new_tokens: 50,
      temperature: 0.8,
      return_full_text: false
    }
  }),

  extractResponse: (data) => {
    try {
      return data[0]?.generated_text || '';
    } catch (error) {
      console.error(error);
      return '';
    }
  }
};

// Función para obtener pregunta aleatoria
export function getRandomQuestion(language = 'es', category = 'random') {
  const questions = DEFAULT_QUESTIONS[language]?.[category] || DEFAULT_QUESTIONS[language]?.random;
  return questions[Math.floor(Math.random() * questions.length)];
}

// Función para generar prompt
export function generatePrompt(category, language = 'es') {
  const theme = CATEGORY_PROMPTS[language][category] || CATEGORY_PROMPTS[language].random;

  if (language === 'es') {
    return `Instrucción: ${theme}\n\nResponde SOLAMENTE con la pregunta, sin explicaciones.`;
  } else {
    return `Instruction: ${theme}\n\nRespond ONLY with the question, no explanations.`;
  }
}

// ⭐⭐ NUEVO: Lista de modelos OpenRouter (para usar en apiService) ⭐⭐
export const OPENROUTER_MODELS = [
  'google/gemma-3n-e2b-it:free',      // Modelo principal (gratuito)
  'google/gemma-3-27b-it:free',
  'google/gemma-3-12b-it:free',
  'google/gemma-3-4b-it:free',
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.5-flash-lite',
  'openai/o4-mini-deep-research',
  'arcee-ai/trinity-mini:free',
  'nex-agi/deepseek-v3.1-nex-n1:free',
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'microsoft/phi-3-medium-128k-instruct:free',
  'qwen/qwen-2.5-32b-instruct:free',
  'kwaipilot/kat-coder-pro:free',
  'tngtech/deepseek-r1t2-chimera:free',
  'mistralai/devstral-2512:free',
];
