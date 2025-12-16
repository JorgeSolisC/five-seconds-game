/* eslint-disable no-undef */
/* eslint-disable no-useless-escape */
// apiService.js - VERSIÓN COMPLETA CON TODAS LAS FUNCIONES
import {
  OPENROUTER_CONFIG,
  HUGGINGFACE_CONFIG,
  OPENROUTER_MODELS,
  HUGGINGFACE_MODELS,
  generatePrompt,
  getRandomQuestion
} from './apiConfig.js';

class RateLimiter {
  constructor(maxRequests, timeWindowMs) {
    this.maxRequests = maxRequests;
    this.timeWindowMs = timeWindowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(timestamp => now - timestamp < this.timeWindowMs);
    return this.requests.length < this.maxRequests;
  }

  addRequest() {
    this.requests.push(Date.now());
  }

  getRemainingRequests() {
    const now = Date.now();
    this.requests = this.requests.filter(timestamp => now - timestamp < this.timeWindowMs);
    return this.maxRequests - this.requests.length;
  }

  reset() {
    this.requests = [];
  }
}

const rateLimiters = {
  OpenRouter: new RateLimiter(40, 60000),
  HuggingFace: new RateLimiter(15, 60000),
};

// ⭐⭐ ESTADO PARA MODELOS ⭐⭐
let currentWorkingModelIndex = 0;
let modelTested = false;
let modelFailureCount = 0;
const MAX_FAILURES_BEFORE_ROTATION = 3;

function getCurrentOpenRouterModel() {
  return OPENROUTER_MODELS[currentWorkingModelIndex];
}

function rotateToNextModel() {
  const previousModel = getCurrentOpenRouterModel();
  currentWorkingModelIndex = (currentWorkingModelIndex + 1) % OPENROUTER_MODELS.length;
  modelTested = false;
  modelFailureCount = 0;

  console.log(`🔄 Rotated from "${previousModel}" to "${getCurrentOpenRouterModel()}"`);
  return getCurrentOpenRouterModel();
}

async function findNewWorkingModel() {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey || apiKey.length < 10) {
    return null;
  }

  console.log('🔍 Searching for a new working OpenRouter model...');

  const startIndex = currentWorkingModelIndex;
  let attempts = 0;

  while (attempts < OPENROUTER_MODELS.length) {
    const testIndex = (startIndex + attempts) % OPENROUTER_MODELS.length;
    const testModel = OPENROUTER_MODELS[testIndex];

    // Saltar modelo actual si ya tiene muchos fallos
    if (attempts === 0 && modelFailureCount >= MAX_FAILURES_BEFORE_ROTATION) {
      console.log(`⏭️ Skipping current model due to ${modelFailureCount} failures`);
      attempts++;
      continue;
    }

    console.log(`  Testing model ${attempts + 1}/${OPENROUTER_MODELS.length}: ${testModel}`);

    try {
      const response = await fetch(OPENROUTER_CONFIG.url, {
        method: 'POST',
        headers: OPENROUTER_CONFIG.getHeaders(),
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: 'user', content: 'Say "test"' }],
          max_tokens: 5
        }),
        signal: AbortSignal.timeout(3000) // ⭐ Reducido
      });

      if (response.ok) {
        console.log(`✅ Found working model: ${testModel}`);
        currentWorkingModelIndex = testIndex;
        modelTested = true;
        modelFailureCount = 0;
        return testModel; // ⭐ Se detiene aquí
      } else {
        console.log(`❌ Model ${testModel} failed (HTTP ${response.status})`);
      }
    } catch (error) {
      console.log(`❌ Model ${testModel} error: ${error.message}`);
    }

    attempts++;

    // ⭐ Pausa más corta
    if (attempts < OPENROUTER_MODELS.length) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  console.log('❌ No working OpenRouter models found');
  modelTested = false;
  return null;
}

async function testCurrentModel() {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey || apiKey.length < 10) {
    return false;
  }

  const currentModel = getCurrentOpenRouterModel();
  console.log(`🧪 Testing current model: ${currentModel}`);

  try {
    const response = await fetch(OPENROUTER_CONFIG.url, {
      method: 'POST',
      headers: OPENROUTER_CONFIG.getHeaders(),
      body: JSON.stringify({
        model: currentModel,
        messages: [{ role: 'user', content: 'Say "test"' }],
        max_tokens: 5
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      console.log(`✅ Current model ${currentModel} is working`);
      modelTested = true;
      modelFailureCount = 0;
      return true;
    } else {
      console.log(`❌ Current model ${currentModel} failed (HTTP ${response.status})`);
      modelFailureCount++;
      return false;
    }
  } catch (error) {
    console.log(`❌ Current model ${currentModel} error: ${error.message}`);
    modelFailureCount++;
    return false;
  }
}

function cleanQuestionText(text, language = 'es') {
  if (!text || typeof text !== 'string' || text.trim().length < 5) {
    return getRandomQuestion(language, 'random');
  }

  let cleaned = text
    .replace(/^["'¿¡\s]+|["'\.\?!\s]+$/g, '')
    .replace(/^(Pregunta:|Question:|Respuesta:|Answer:|AI:|Bot:|Assistant:|Model:|Here's|Aquí):?\s*/i, '')
    .replace(/^\d+[\.\)]\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim();

  if (language === 'es') {
    if (!cleaned.toLowerCase().startsWith('nombra 3')) {
      cleaned = 'Nombra 3 ' + cleaned;
    }
  } else {
    if (!cleaned.toLowerCase().startsWith('name 3')) {
      cleaned = 'Name 3 ' + cleaned;
    }
  }

  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (!cleaned.endsWith('?')) {
      cleaned = cleaned + '?';
    }
  }

  if (cleaned.length > 120) {
    cleaned = cleaned.substring(0, 117) + '...';
  }

  return cleaned || getRandomQuestion(language, 'random');
}

// ===== OPENROUTER API CALL =====
async function tryOpenRouter(prompt) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey || apiKey.length < 10) {
    return null;
  }

  if (!rateLimiters.OpenRouter.canMakeRequest()) {
    console.log('⏳ OpenRouter rate limit reached');
    return null;
  }

  if (!modelTested) {
    const isWorking = await testCurrentModel();
    if (!isWorking) {
      await findNewWorkingModel();
      if (!modelTested) {
        return null;
      }
    }
  }

  if (modelFailureCount >= MAX_FAILURES_BEFORE_ROTATION) {
    console.log(`🔄 ${modelFailureCount} consecutive failures, rotating model before attempt`);
    rotateToNextModel();
    const isWorking = await testCurrentModel();
    if (!isWorking) {
      return null;
    }
  }

  const currentModel = getCurrentOpenRouterModel();
  console.log(`🎯 Using OpenRouter model: ${currentModel}`);

  try {
    const response = await fetch(OPENROUTER_CONFIG.url, {
      method: 'POST',
      headers: OPENROUTER_CONFIG.getHeaders(),
      body: JSON.stringify({
        ...OPENROUTER_CONFIG.getBody(prompt),
        model: currentModel
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      const text = OPENROUTER_CONFIG.extractResponse(data);

      if (text && text.trim().length > 5) {
        console.log(`✅ OpenRouter success with model: ${currentModel}`);
        rateLimiters.OpenRouter.addRequest();
        modelFailureCount = 0;
        return text;
      } else {
        console.log(`⚠️ Empty response from model: ${currentModel}`);
        modelFailureCount++;
      }
    } else {
      const error = await response.json().catch(() => ({}));
      const errorMsg = error.error?.message || `HTTP ${response.status}`;
      console.log(`❌ OpenRouter model failed (${currentModel}):`, errorMsg);

      modelFailureCount++;

      if (response.status === 404 || response.status === 400 ||
          response.status >= 500 || modelFailureCount >= MAX_FAILURES_BEFORE_ROTATION) {
        console.log(`🔄 Model ${currentModel} has ${modelFailureCount} failures, rotating...`);
        rotateToNextModel();
      }
    }
  } catch (error) {
    console.log(`❌ OpenRouter request failed (${currentModel}):`, error.message);
    modelFailureCount++;

    if (error.name === 'TimeoutError' || error.name === 'TypeError' ||
        modelFailureCount >= MAX_FAILURES_BEFORE_ROTATION) {
      console.log(`🔄 Network error or ${modelFailureCount} failures, rotating model`);
      rotateToNextModel();
    }
  }

  return null;
}

// ===== HUGGINGFACE API CALL =====
async function tryHuggingFace(prompt) {
  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;

  if (!apiKey || apiKey.length < 10) {
    return null;
  }

  if (!rateLimiters.HuggingFace.canMakeRequest()) {
    console.log('⏳ HuggingFace rate limit reached');
    return null;
  }

  try {
    const response = await fetch(HUGGINGFACE_CONFIG.url, {
      method: 'POST',
      headers: HUGGINGFACE_CONFIG.getHeaders(),
      body: JSON.stringify(HUGGINGFACE_CONFIG.getBody(prompt)),
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) {
      const data = await response.json();
      const text = HUGGINGFACE_CONFIG.extractResponse(data);

      if (text && text.trim().length > 5) {
        console.log('✅ HuggingFace success!');
        rateLimiters.HuggingFace.addRequest();
        return text;
      }
    } else {
      const error = await response.text();
      console.log('❌ HuggingFace error:', error.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ HuggingFace request failed:', error.message);
  }

  return null;
}

// ⭐⭐⭐ FUNCIÓN PRINCIPAL PARA UNA PREGUNTA ⭐⭐⭐
export async function generateAIQuestion(category = 'random', language = 'es') {
  console.log(`🎲 Generating: ${category} (${language})`);

  const prompt = generatePrompt(category, language);
  let aiResult = null;

  // 1. Intentar OpenRouter
  if (import.meta.env.VITE_OPENROUTER_API_KEY) {
    aiResult = await tryOpenRouter(prompt);
    if (aiResult) {
      console.log('✨ Generated with OpenRouter');
      const cleaned = cleanQuestionText(aiResult, language);
      if (cleaned && cleaned.length > 10) {
        return cleaned;
      }
    }
  }

  // 2. Si OpenRouter falla, intentar HuggingFace
  if (!aiResult && import.meta.env.VITE_HUGGINGFACE_API_KEY) {
    aiResult = await tryHuggingFace(prompt);
    if (aiResult) {
      console.log('✨ Generated with HuggingFace');
      const cleaned = cleanQuestionText(aiResult, language);
      if (cleaned && cleaned.length > 10) {
        return cleaned;
      }
    }
  }

  // 3. Si ambos fallan, usar preguntas locales
  console.log('📚 Using high-quality default question');
  return getRandomQuestion(language, category);
}

// ⭐⭐⭐ FUNCIÓN PARA MÚLTIPLES PREGUNTAS ⭐⭐⭐
export async function generateAIQuestions(count, category = 'random', language = 'es') {
  console.log(`🚀 Generating ${count} questions...`);

  const questions = [];
  const usedQuestions = new Set();

  for (let i = 0; i < count; i++) {
    console.log(`  [${i + 1}/${count}]`);

    let question;
    let attempts = 0;

    // Para las primeras preguntas, intentar con AI
    const maxAIAttempts = Math.min(count, 8);
    if (i < maxAIAttempts) {
      const prompt = generatePrompt(category, language);

      // Intentar OpenRouter
      if (import.meta.env.VITE_OPENROUTER_API_KEY && rateLimiters.OpenRouter.canMakeRequest()) {
        const aiResult = await tryOpenRouter(prompt);
        if (aiResult) {
          question = cleanQuestionText(aiResult, language);
          if (question.length > 10 && !usedQuestions.has(question.toLowerCase())) {
            usedQuestions.add(question.toLowerCase());
            questions.push({
              text: question,
              category,
              language,
              source: 'OpenRouter',
              model: getCurrentOpenRouterModel(),
              timestamp: new Date().toISOString(),
              index: i + 1
            });

            await new Promise(resolve => setTimeout(resolve, 800));
            continue;
          }
        }
      }

      // Si OpenRouter falla, intentar HuggingFace
      if (!question && import.meta.env.VITE_HUGGINGFACE_API_KEY && rateLimiters.HuggingFace.canMakeRequest()) {
        const aiResult = await tryHuggingFace(prompt);
        if (aiResult) {
          question = cleanQuestionText(aiResult, language);
          if (question.length > 10 && !usedQuestions.has(question.toLowerCase())) {
            usedQuestions.add(question.toLowerCase());
            questions.push({
              text: question,
              category,
              language,
              source: 'HuggingFace',
              timestamp: new Date().toISOString(),
              index: i + 1
            });

            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }
      }
    }

    // Usar pregunta local (asegurar unicidad)
    while (attempts < 15) {
      question = getRandomQuestion(language, category);

      if (!usedQuestions.has(question.toLowerCase())) {
        usedQuestions.add(question.toLowerCase());
        break;
      }
      attempts++;
    }

    questions.push({
      text: question,
      category,
      language,
      source: 'local',
      timestamp: new Date().toISOString(),
      index: i + 1
    });

    // Pequeña pausa para no sobrecargar
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  console.log(`✅ Generated ${questions.length} unique questions`);

  // Estadísticas de fuentes
  const sourceStats = questions.reduce((stats, q) => {
    stats[q.source] = (stats[q.source] || 0) + 1;
    return stats;
  }, {});

  console.log('📊 Source statistics:', sourceStats);

  return questions;
}

export async function checkAIServices() {
  console.log('🔍 Checking AI services...');

  const results = {
    OpenRouter: { available: false, reason: 'Not tested', currentModel: null, workingModels: [] },
    HuggingFace: { available: false, reason: 'Not tested', workingModel: null },
    LocalQuestions: { available: true, reason: 'Always available' }
  };

  // 1. PRIMERO: Probar OpenRouter
  await testOpenRouter(results);

  // 2. SEGUNDO: Solo probar HuggingFace si OpenRouter no funcionó
  if (!results.OpenRouter.available) {
    await testHuggingFace(results);
  } else {
    console.log('⏩ Skipping HuggingFace test (OpenRouter is working)');
    results.HuggingFace.reason = 'Skipped (OpenRouter is available)';
  }

  console.log('📊 Services status:', results);
  return results;
}

async function testOpenRouter(results) {
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!openRouterKey || openRouterKey.length < 10) {
    results.OpenRouter.reason = 'No API key configured';
    return;
  }

  const workingModels = [];
  let currentWorkingModel = null;

  console.log('  Testing OpenRouter...');

  for (let i = 0; i < OPENROUTER_MODELS.length; i++) {
    try {
      const model = OPENROUTER_MODELS[i];
      console.log(`    Testing model: ${model}`);

      const testResult = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Say only "test"' }],
          max_tokens: 5
        }),
        signal: AbortSignal.timeout(3000)
      });

      if (testResult.ok) {
        console.log(`    ✅ Model ${model} is working`);
        workingModels.push(model);

        // Usar el primer modelo funcional como current
        if (!currentWorkingModel) {
          currentWorkingModel = model;
          results.OpenRouter.currentModel = model;

          // Opcional: Detener después del primer modelo exitoso
          if (workingModels.length === 1) {
            console.log(`    🎯 Found working model. Stopping OpenRouter tests.`);
            break;
          }
        }
      } else {
        console.log(`    ❌ Model ${model} failed (HTTP ${testResult.status})`);
      }
    } catch (error) {
      console.log(`    ❌ Model test error: ${error.message}`);
    }

    // Pequeña pausa entre tests
    if (i < OPENROUTER_MODELS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  results.OpenRouter = {
    available: workingModels.length > 0,
    reason: workingModels.length > 0
      ? `Found ${workingModels.length} working model(s)`
      : 'No models responded',
    currentModel: currentWorkingModel,
    workingModels: workingModels,
    totalModels: OPENROUTER_MODELS.length,
    optimization: workingModels.length > 0
      ? 'Stopped after first working model found'
      : 'Tested all models'
  };
}

async function testHuggingFace(results) {
  const huggingFaceKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  if (!huggingFaceKey || huggingFaceKey.length < 10) {
    results.HuggingFace.reason = 'No API key configured';
    return;
  }

  console.log('  Testing HuggingFace (fallback)...');
  let workingModel = null;

  // Probar múltiples modelos de HuggingFace
  for (let i = 0; i < HUGGINGFACE_MODELS.length; i++) {
    const model = HUGGINGFACE_MODELS[i];

    try {
      console.log(`    Testing HuggingFace model: ${model}`);

      const testResult = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'Say test'
        }),
        signal: AbortSignal.timeout(4000)
      });

      if (testResult.ok) {
        console.log(`    ✅ HuggingFace model ${model} is working`);
        workingModel = model;
        break; // Detener al primer modelo funcional
      } else {
        console.log(`    ❌ HuggingFace model ${model} failed (HTTP ${testResult.status})`);

        // Si es error 503 (model loading), continuar con siguiente modelo
        if (testResult.status === 503) {
          console.log(`    ⚠️ Model ${model} is loading. Trying next model...`);
          continue;
        }
      }
    } catch (error) {
      console.log(`    ❌ HuggingFace model ${model} error: ${error.message}`);
    }

    // Pausa entre intentos
    if (i < HUGGINGFACE_MODELS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  results.HuggingFace = {
    available: workingModel !== null,
    reason: workingModel ? `Model ${workingModel} is working` : 'No models responded',
    workingModel: workingModel,
    modelsTested: HUGGINGFACE_MODELS.length
  };
}

export function getAPIStats() {
  const openRouterUsed = rateLimiters.OpenRouter.maxRequests - rateLimiters.OpenRouter.getRemainingRequests();
  const huggingFaceUsed = rateLimiters.HuggingFace.maxRequests - rateLimiters.HuggingFace.getRemainingRequests();

  return {
    OpenRouter: {
      remaining: rateLimiters.OpenRouter.getRemainingRequests(),
      max: rateLimiters.OpenRouter.maxRequests,
      used: openRouterUsed,
      percentage: ((openRouterUsed / rateLimiters.OpenRouter.maxRequests) * 100).toFixed(1) + '%',
      status: import.meta.env.VITE_OPENROUTER_API_KEY ? 'Configured' : 'Not configured',
      currentModel: getCurrentOpenRouterModel(),
      modelTested: modelTested,
      failureCount: modelFailureCount,
      maxFailuresBeforeRotation: MAX_FAILURES_BEFORE_ROTATION,
      availableModels: OPENROUTER_MODELS.length,
      models: OPENROUTER_MODELS
    },
    HuggingFace: {
      remaining: rateLimiters.HuggingFace.getRemainingRequests(),
      max: rateLimiters.HuggingFace.maxRequests,
      used: huggingFaceUsed,
      percentage: ((huggingFaceUsed / rateLimiters.HuggingFace.maxRequests) * 100).toFixed(1) + '%',
      status: import.meta.env.VITE_HUGGINGFACE_API_KEY ? 'Configured' : 'Not configured'
    },
    LocalQuestions: {
      available: true,
      source: 'Built-in database'
    },
    timestamp: new Date().toISOString()
  };
}

export function getAPIConfig() {
  return {
    openrouter: {
      configured: !!import.meta.env.VITE_OPENROUTER_API_KEY,
      keyLength: import.meta.env.VITE_OPENROUTER_API_KEY?.length || 0,
      currentModel: getCurrentOpenRouterModel(),
      modelTested: modelTested,
      failureCount: modelFailureCount,
      availableModels: OPENROUTER_MODELS,
      modelStrategy: 'Persistent until failure',
      maxFailuresBeforeRotation: MAX_FAILURES_BEFORE_ROTATION,
      url: OPENROUTER_CONFIG.url
    },
    huggingface: {
      configured: !!import.meta.env.VITE_HUGGINGFACE_API_KEY,
      keyLength: import.meta.env.VITE_HUGGINGFACE_API_KEY?.length || 0,
      model: 'google/flan-t5-base',
      url: HUGGINGFACE_CONFIG.url
    },
    fallback: {
      strategy: 'OpenRouter (persistent model) → HuggingFace → Local Questions',
      localQuestions: 'Always available'
    },
    timestamp: new Date().toISOString()
  };
}

export function resetRateLimiters() {
  Object.values(rateLimiters).forEach(limiter => limiter.reset());
  currentWorkingModelIndex = 0;
  modelTested = false;
  modelFailureCount = 0;
  console.log('🔄 API rate limiters and model state reset');
  return {
    success: true,
    timestamp: new Date().toISOString(),
    currentModel: getCurrentOpenRouterModel(),
    modelTested: modelTested,
    failureCount: modelFailureCount
  };
}

export function setOpenRouterModel(modelName) {
  const index = OPENROUTER_MODELS.indexOf(modelName);
  if (index !== -1) {
    currentWorkingModelIndex = index;
    modelTested = true;
    modelFailureCount = 0;
    console.log(`🎯 Manually set OpenRouter model to: ${modelName}`);
    return { success: true, model: modelName, modelTested: true };
  } else {
    console.log(`❌ Model not found: ${modelName}`);
    return { success: false, error: 'Model not found', availableModels: OPENROUTER_MODELS };
  }
}

export function forceModelRotation() {
  const oldModel = getCurrentOpenRouterModel();
  rotateToNextModel();
  console.log(`🔄 Forced model rotation from "${oldModel}" to "${getCurrentOpenRouterModel()}"`);
  return {
    success: true,
    oldModel,
    newModel: getCurrentOpenRouterModel(),
    modelTested: modelTested
  };
}

export function getRateLimiterStatus() {
  return {
    OpenRouter: {
      canMakeRequest: rateLimiters.OpenRouter.canMakeRequest(),
      remaining: rateLimiters.OpenRouter.getRemainingRequests(),
      max: rateLimiters.OpenRouter.maxRequests,
      currentModel: getCurrentOpenRouterModel(),
      modelTested: modelTested,
      failureCount: modelFailureCount
    },
    HuggingFace: {
      canMakeRequest: rateLimiters.HuggingFace.canMakeRequest(),
      remaining: rateLimiters.HuggingFace.getRemainingRequests(),
      max: rateLimiters.HuggingFace.maxRequests
    }
  };
}

export function getAvailableModels() {
  return {
    OpenRouter: OPENROUTER_MODELS,
    HuggingFace: [HUGGINGFACE_CONFIG.url.split('/models/')[1]],
    currentOpenRouterModel: getCurrentOpenRouterModel(),
    modelTested: modelTested,
    failureCount: modelFailureCount
  };
}

// Para debugging
if (process.env.NODE_ENV === 'development') {
  window.apiService = {
    generateAIQuestion,
    generateAIQuestions, // ⭐ AHORA SÍ ESTÁ INCLUIDA ⭐
    checkAIServices,
    getAPIStats,
    getAPIConfig,
    resetRateLimiters,
    setOpenRouterModel,
    forceModelRotation,
    getRateLimiterStatus,
    getAvailableModels,
    getRandomQuestion,
    rateLimiters,
    OPENROUTER_MODELS,
    getCurrentOpenRouterModel,
    rotateToNextModel,
    testCurrentModel,
    findNewWorkingModel
  };

  console.log('🔧 API Service loaded in development mode');
  console.log('📋 Available functions:', Object.keys(window.apiService).filter(k => typeof window.apiService[k] === 'function'));
  console.log('🎯 Current model:', getCurrentOpenRouterModel());
  console.log('✅ Model tested:', modelTested);
  console.log('❌ Failure count:', modelFailureCount);
}

export {
  rateLimiters,
  OPENROUTER_MODELS,
  getCurrentOpenRouterModel,
  rotateToNextModel,
};
