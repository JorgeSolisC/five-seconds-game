import { generateAIQuestions } from "./apiService"

// En questionGenerator.js, versión optimizada:
export async function generateQuestionsBatch(count, language = 'es', category = null) {
  console.log(`🚀 Generating ${count} questions in ${language} for category: ${category || 'random'}`)

  // Función para generar ID único
  const generateUniqueId = () => {
    return `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Función para obtener categoría aleatoria
  const getRandomCategory = () => {
    const allCategories = ['funny', 'pop-culture', 'what-if', 'personal', 'challenge', 'food', 'travel', 'random']
    return allCategories[Math.floor(Math.random() * allCategories.length)]
  }

  // Función para obtener dificultad aleatoria
  const getRandomDifficulty = () => {
    const difficulties = ['easy', 'medium', 'hard']
    return difficulties[Math.floor(Math.random() * difficulties.length)]
  }

  // Determinar la categoría a usar
  let categoryToUse = category || 'random'
  const useRandomCategory = category === 'random' || !category

  try {
    // ⭐⭐ USAR generateAIQuestions EN LUGAR DE MULTIPLES LLAMADAS ⭐⭐
    let aiQuestions = []

    if (useRandomCategory) {
      // Si necesitamos categorías aleatorias, generar todo como 'random'
      // y luego asignar categorías aleatorias después
      aiQuestions = await generateAIQuestions(count, 'random', language)
    } else {
      // Usar la categoría específica
      aiQuestions = await generateAIQuestions(count, categoryToUse, language)
    }

    console.log(`✅ Received ${aiQuestions.length} AI-generated questions`)

    // Transformar a nuestro formato
    const questions = aiQuestions.map((aiQ, index) => {
      let finalCategory = categoryToUse

      // Si estamos usando categorías aleatorias, asignar una diferente a cada pregunta
      if (useRandomCategory) {
        finalCategory = getRandomCategory()
      }

      return {
        id: generateUniqueId(),
        text: aiQ.text,
        category: finalCategory,
        language: language,
        difficulty: getRandomDifficulty(),
        timestamp: aiQ.timestamp || new Date().toISOString(),
        source: aiQ.source || 'AI',
        model: aiQ.model || null,
        index: index + 1
      }
    })

    // Estadísticas
    const sourceStats = questions.reduce((stats, q) => {
      stats[q.source] = (stats[q.source] || 0) + 1
      return stats
    }, {})

    console.log(`✅ Generated ${questions.length} questions successfully`)
    console.log('📊 Sources:', sourceStats)

    return questions

  } catch (error) {
    console.error('❌ Error generating questions batch:', error)

    // Fallback: generar preguntas locales manualmente
    console.log('🔄 Using local fallback questions')
    return generateLocalQuestionsFallback(count, language, category, getRandomCategory, getRandomDifficulty, generateUniqueId)
  }
}

// Función de fallback local
function generateLocalQuestionsFallback(count, language, category, getRandomCategory, getRandomDifficulty, generateUniqueId) {
  const localQuestions = {
    es: {
      funny: [
        "Nombra 3 cosas que harías si fueras invisible por un día",
        "Nombra 3 superhéroes con poderes ridículos",
        "Nombra 3 excusas creativas para llegar tarde"
      ],
      'pop-culture': [
        "Nombra 3 películas de Marvel o DC",
        "Nombra 3 cantantes de reggaetón actuales",
        "Nombra 3 series de Netflix populares"
      ],
      personal: [
        "Nombra 3 de tus comidas favoritas",
        "Nombra 3 países que quieres visitar",
        "Nombra 3 cosas que te hagan feliz"
      ],
      challenge: [
        "Nombra 3 países de América del Sur",
        "Nombra 3 animales que empiecen con 'E'",
        "Nombra 3 capitales europeas"
      ]
    },
    en: {
      funny: [
        "Name 3 things you would do if you were invisible for a day",
        "Name 3 superheroes with ridiculous powers",
        "Name 3 creative excuses for being late"
      ],
      'pop-culture': [
        "Name 3 Marvel or DC movies",
        "Name 3 current reggaeton singers",
        "Name 3 popular Netflix series"
      ],
      personal: [
        "Name 3 of your favorite foods",
        "Name 3 countries you want to visit",
        "Name 3 things that make you happy"
      ],
      challenge: [
        "Name 3 South American countries",
        "Name 3 animals starting with 'E'",
        "Name 3 European capitals"
      ]
    }
  }

  const questions = []
  let categoryToUse = category || 'random'
  const useRandomCategory = category === 'random' || !category

  for (let i = 0; i < count; i++) {
    let finalCategory = categoryToUse

    if (useRandomCategory) {
      finalCategory = getRandomCategory()
    }

    // Obtener preguntas de la categoría o usar random como fallback
    const categoryQuestions = localQuestions[language]?.[finalCategory] ||
                             localQuestions[language]?.random ||
                             localQuestions[language]?.funny ||
                             ["Pregunta de ejemplo"]

    const randomIndex = Math.floor(Math.random() * categoryQuestions.length)
    const questionText = categoryQuestions[randomIndex]

    questions.push({
      id: generateUniqueId(),
      text: questionText,
      category: finalCategory,
      language: language,
      difficulty: getRandomDifficulty(),
      timestamp: new Date().toISOString(),
      source: 'local-fallback',
      index: i + 1
    })
  }

  console.log(`📚 Generated ${questions.length} local fallback questions`)
  return questions
}

// Función para obtener nombre de categoría (se mantiene igual)
export function getCategoryName(categoryId, language = 'es') {
  const categoryNames = {
    es: {
      funny: 'Divertido',
      'pop-culture': 'Cultura Pop',
      'what-if': '¿Qué pasaría si...?',
      personal: 'Personal',
      challenge: 'Desafío',
      food: 'Comida',
      travel: 'Viajes',
      random: 'Aleatorio'
    },
    en: {
      funny: 'Funny',
      'pop-culture': 'Pop Culture',
      'what-if': 'What if...?',
      personal: 'Personal',
      challenge: 'Challenge',
      food: 'Food',
      travel: 'Travel',
      random: 'Random'
    }
  }

  return categoryNames[language]?.[categoryId] || categoryNames[language]?.random || 'Random'
}

// Función para obtener todas las categorías disponibles
export function getAvailableCategories(language = 'es') {
  return [
    { id: 'funny', name: getCategoryName('funny', language) },
    { id: 'pop-culture', name: getCategoryName('pop-culture', language) },
    { id: 'what-if', name: getCategoryName('what-if', language) },
    { id: 'personal', name: getCategoryName('personal', language) },
    { id: 'challenge', name: getCategoryName('challenge', language) },
    { id: 'food', name: getCategoryName('food', language) },
    { id: 'travel', name: getCategoryName('travel', language) },
    { id: 'random', name: getCategoryName('random', language) }
  ]
}
