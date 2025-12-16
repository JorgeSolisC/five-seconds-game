// Lista de categorías divertidas
export const categories = [
  {
    id: 'funny',
    name: { es: 'Divertido', en: 'Funny' },
    description: { 
      es: 'Preguntas graciosas para reírse', 
      en: 'Funny questions to laugh' 
    }
  },
  {
    id: 'pop-culture',
    name: { es: 'Cultura Pop', en: 'Pop Culture' },
    description: { 
      es: 'Celebridades, películas y series', 
      en: 'Celebrities, movies and series' 
    }
  },
  {
    id: 'what-if',
    name: { es: '¿Qué pasaría si...?', en: 'What if...?' },
    description: { 
      es: 'Situaciones hipotéticas divertidas', 
      en: 'Funny hypothetical situations' 
    }
  },
  {
    id: 'personal',
    name: { es: 'Personal', en: 'Personal' },
    description: { 
      es: 'Preguntas personales divertidas', 
      en: 'Funny personal questions' 
    }
  },
  {
    id: 'challenge',
    name: { es: 'Desafío', en: 'Challenge' },
    description: { 
      es: 'Retos y desafíos divertidos', 
      en: 'Funny challenges and dares' 
    }
  },
  {
    id: 'food',
    name: { es: 'Comida', en: 'Food' },
    description: { 
      es: 'Preguntas sobre comida divertida', 
      en: 'Funny food questions' 
    }
  },
  {
    id: 'travel',
    name: { es: 'Viajes', en: 'Travel' },
    description: { 
      es: 'Preguntas sobre viajes divertidos', 
      en: 'Funny travel questions' 
    }
  },
  {
    id: 'random',
    name: { es: 'Aleatorio', en: 'Random' },
    description: { 
      es: 'Preguntas completamente aleatorias', 
      en: 'Completely random questions' 
    }
  }
]

// Banco de preguntas predeterminadas (para cuando la API no esté disponible)
const defaultQuestions = {
  es: {
    funny: [
      "¿Qué harías si tu perro empezara a hablar?",
      "Si fueras un superhéroe, ¿cuál sería tu poder más inútil?",
      "¿Qué comida representaría tu personalidad?",
      "Si pudieras tener cualquier animal como mascota, ¿cuál elegirías?",
      "¿Cuál es el chiste más malo que conoces?"
    ],
    'pop-culture': [
      "¿Qué personaje de película serías en una situación apocalíptica?",
      "Si pudieras ser amigo de cualquier celebridad, ¿quién sería?",
      "¿Qué canción de los 90's describe mejor tu vida?",
      "Si tu vida fuera una serie de Netflix, ¿cómo se llamaría?"
    ],
    'what-if': [
      "¿Qué pasaría si los humanos tuvieran cola?",
      "¿Y si los pájaros pudieran hablar?",
      "¿Qué harías si fueras invisible por un día?",
      "¿Y si el dinero creciera en los árboles?"
    ],
    personal: [
      "¿Cuál es tu habilidad más inútil?",
      "¿Qué cosa rara haces cuando estás solo?",
      "¿Cuál ha sido tu momento más vergonzoso?",
      "¿Qué apodo te pondrías a ti mismo?"
    ],
    challenge: [
      "Di el abecedario al revés en 5 segundos",
      "Nombra 5 países que empiecen con la letra 'C'",
      "Imita a un animal en 3 segundos",
      "Di 3 palabras que rimen con 'gato'"
    ],
    food: [
      "¿Qué comida podrías comer todos los días?",
      "Si tuvieras que comer solo un alimento por el resto de tu vida, ¿cuál sería?",
      "¿Cuál es la combinación de comida más rara que has probado?",
      "¿Pizza con piña: sí o no?"
    ],
    travel: [
      "¿A dónde viajarías si el dinero no fuera problema?",
      "¿Qué país tiene la comida más rara?",
      "Si pudieras vivir en cualquier época histórica, ¿cuál elegirías?",
      "¿Cuál es el peor viaje que has tenido?"
    ],
    random: [
      "Si fueras un mueble, ¿cuál serías?",
      "¿Qué emoji usas más?",
      "Si tu vida tuviera soundtrack, ¿qué canción sonaría ahora?",
      "¿Qué objeto inanimado te describe mejor?"
    ]
  },
  en: {
    funny: [
      "What would you do if your dog started talking?",
      "If you were a superhero, what would be your most useless power?",
      "What food would represent your personality?",
      "If you could have any animal as a pet, which one would you choose?",
      "What's the worst joke you know?"
    ],
    'pop-culture': [
      "Which movie character would you be in an apocalyptic situation?",
      "If you could be friends with any celebrity, who would it be?",
      "What 90's song best describes your life?",
      "If your life was a Netflix series, what would it be called?"
    ],
    'what-if': [
      "What if humans had tails?",
      "What if birds could talk?",
      "What would you do if you were invisible for a day?",
      "What if money grew on trees?"
    ],
    personal: [
      "What's your most useless skill?",
      "What weird thing do you do when you're alone?",
      "What has been your most embarrassing moment?",
      "What nickname would you give yourself?"
    ],
    challenge: [
      "Say the alphabet backwards in 5 seconds",
      "Name 5 countries that start with the letter 'C'",
      "Imitate an animal in 3 seconds",
      "Say 3 words that rhyme with 'cat'"
    ],
    food: [
      "What food could you eat every day?",
      "If you had to eat only one food for the rest of your life, what would it be?",
      "What's the weirdest food combination you've tried?",
      "Pineapple on pizza: yes or no?"
    ],
    travel: [
      "Where would you travel if money wasn't an issue?",
      "Which country has the weirdest food?",
      "If you could live in any historical era, which would you choose?",
      "What's the worst trip you've ever had?"
    ],
    random: [
      "If you were a piece of furniture, what would you be?",
      "What emoji do you use the most?",
      "If your life had a soundtrack, what song would be playing now?",
      "What inanimate object best describes you?"
    ]
  }
}

// Función para obtener una categoría aleatoria
export function getRandomCategory(language = 'es') {
    console.log('Getting random category', language)
  const availableCategories = categories.map(cat => cat.id)
  const randomIndex = Math.floor(Math.random() * availableCategories.length)
  return availableCategories[randomIndex]
}

// Función para obtener el nombre de una categoría
export function getCategoryName(categoryId, language = 'es') {
  const category = categories.find(cat => cat.id === categoryId)
  if (!category) return 'Random'
  return language === 'es' ? category.name.es : category.name.en
}

// Función para generar una pregunta (simula API de IA)
export async function generateQuestion(category = 'random', language = 'es') {
  // En una implementación real, aquí llamarías a una API de IA gratuita
  // Por ejemplo: OpenAI API, Hugging Face, etc.
  // Por ahora, usaremos preguntas predeterminadas
  
  await simulateAPIDelay() // Simular delay de red
  
  try {
    // Intentar usar la API de IA si está disponible
    const aiQuestion = await fetchAIQuestion(category, language)
    if (aiQuestion) return aiQuestion
  } catch (error) {
    console.log('Using default questions instead of AI API', error)
  }
  
  // Usar preguntas predeterminadas como fallback
  const categoryQuestions = defaultQuestions[language]?.[category] || defaultQuestions[language]?.random
  const randomIndex = Math.floor(Math.random() * categoryQuestions.length)
  return categoryQuestions[randomIndex]
}

// Simular llamada a API de IA (implementación real requeriría una API key)
async function fetchAIQuestion(category, language) {
    console.log('Fetching AI question for', category, language)
  // NOTA: Necesitarías una API key real para esto
  // Esta es una implementación de ejemplo con una API gratuita hipotética
  
  // Ejemplo con OpenAI (requiere API key y no es completamente gratuita)
  // const response = await fetch('https://api.openai.com/v1/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer TU_API_KEY`
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-3.5-turbo',
  //     prompt: `Generate a fun 5-second game question about ${category} in ${language}.`,
  //     max_tokens: 50
  //   })
  // });
  
  // const data = await response.json();
  // return data.choices[0].text.trim();
  
  return null // Retornar null para usar preguntas predeterminadas
}

// Simular delay de red
function simulateAPIDelay() {
  return new Promise(resolve => setTimeout(resolve, 100))
}