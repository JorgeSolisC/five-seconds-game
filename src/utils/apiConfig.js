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
      role: 'system',
      content: 'Eres el mazo de cartas del juego "5 Segundos para Ganar". Tu única función es dar el texto de la carta. NUNCA saludes, NUNCA des instrucciones. Solo entrega la pregunta directa.'
    }, {
      role: 'user',
      content: prompt
    }],
    max_tokens: 35,
    temperature: 0.9,
    top_p: 1
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
  // --- CATEGORÍA: TOP INTELLIGENCE (Los mejores para el humor del juego) ---
  'google/gemma-3-27b-it:free',
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.0-flash-thinking-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'nvidia/llama-3.1-nemotron-70b-instruct:free',

  // --- CATEGORÍA: BALANCED & CREATIVE (Rápidos y con buen tono) ---
  'google/gemma-3-12b-it:free',
  'google/learnlm-1.5-pro-experimental:free',
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/pixtral-12b:free',
  'sophosympathizer/lfm-40b:free',

  // --- CATEGORÍA: ULTRA FAST (Casi instantáneos, ideales como fallback) ---
  'google/gemma-3-4b-it:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'qwen/qwen-2.5-7b-instruct:free',
  'microsoft/phi-3-medium-128k-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',

  // --- CATEGORÍA: COMMUNITY STABLE (Muy confiables en disponibilidad) ---
  'arcee-ai/trinity-mini:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'openchat/openchat-7b:free'
];
