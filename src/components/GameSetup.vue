<template>
  <div class="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-bold text-gray-800 mb-2">
        {{ language === 'es' ? 'Configuración del Juego' : 'Game Setup' }}
      </h2>
      <p class="text-gray-600">
        {{ language === 'es'
           ? 'Configura los detalles de tu partida'
           : 'Set up your game details' }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- SECCIÓN DE ESTADO DE APIS DE IA -->
        <div class="col-span-full mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <h4 class="font-bold text-blue-800 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {{ selectedLanguage === 'es' ? 'Generación de Preguntas con IA' : 'AI Question Generation' }}
          </h4>

          <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-700">
                {{ selectedLanguage === 'es' ? 'APIs Disponibles:' : 'Available APIs:' }}
              </span>
              <button
                @click="checkAPIStatus"
                :disabled="checkingAPI"
                :class="[
                  'text-xs px-3 py-1 rounded transition duration-200 flex items-center',
                  checkingAPI
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                ]"
              >
                <svg v-if="checkingAPI" class="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ checkingAPI
                   ? (selectedLanguage === 'es' ? 'Verificando...' : 'Checking...')
                   : (selectedLanguage === 'es' ? 'Verificar APIs' : 'Check APIs') }}
              </button>
            </div>

            <!-- Estado de APIs -->
            <div v-if="apiStatus" class="space-y-3">
              <div v-for="service in apiStatus" :key="service.name"
                   :class="[
                     'p-3 rounded-lg border transition-all',
                     service.available
                       ? 'border-blue-200 bg-white'
                       : 'border-gray-200 bg-gray-50'
                   ]">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <!-- Icono del servicio -->
                    <div :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center mr-3',
                      service.name === 'HuggingFace' ? 'bg-yellow-100' :
                      service.name === 'Cohere' ? 'bg-pink-100' :
                      service.name === 'OpenRouter' ? 'bg-indigo-100' :
                      'bg-gray-100'
                    ]">
                      <span class="text-xs font-bold text-gray-800">{{ service.name.charAt(0) }}</span>
                    </div>

                    <div>
                      {{ service.name }}
                      <div class="text-xs text-gray-500">
                        {{ service.name === 'Cohere' ? '100 créditos gratis' :
                           service.name === 'HuggingFace' ? 'Completamente gratis' :
                           service.name === 'OpenRouter' ? 'Modelos gratuitos' :
                           'Preguntas locales' }}
                      </div>
                    </div>
                  </div>

                  <div class="text-right">
                    <div :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      service.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    ]">
                      {{ service.available
                         ? (selectedLanguage === 'es' ? 'Disponible' : 'Available')
                         : (selectedLanguage === 'es' ? 'No disponible' : 'Unavailable') }}
                    </div>
                    <div v-if="!service.available && service.reason" class="text-xs text-gray-500 mt-1">
                      {{ service.reason }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-4">
              <div class="text-gray-400 mb-2">
                <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p class="text-sm text-gray-500">
                {{ selectedLanguage === 'es'
                   ? 'Haz clic en "Verificar APIs" para comprobar la disponibilidad'
                   : 'Click "Check APIs" to verify availability' }}
              </p>
            </div>
          </div>
        </div>
      <!-- Columna izquierda: Configuración básica -->
      <div>
        <!-- Selección de idioma -->
        <div class="mb-8">
          <label class="block text-gray-700 font-semibold mb-3">
            {{ language === 'es' ? 'Idioma del juego:' : 'Game language:' }}
          </label>
          <div class="flex space-x-4">
            <button
              @click="setLanguage('es')"
              :class="[
                'flex-1 px-4 py-3 rounded-lg font-semibold transition duration-200 flex items-center justify-center',
                selectedLanguage === 'es'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <span class="mr-2">🇪🇸</span> Español
            </button>
            <button
              @click="setLanguage('en')"
              :class="[
                'flex-1 px-4 py-3 rounded-lg font-semibold transition duration-200 flex items-center justify-center',
                selectedLanguage === 'en'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <span class="mr-2">🇺🇸</span> English
            </button>
          </div>
        </div>

        <!-- Número de equipos -->
        <div class="mb-8">
          <label class="block text-gray-700 font-semibold mb-3">
            {{ selectedLanguage === 'es'
               ? 'Número de equipos:'
               : 'Number of teams:' }}
          </label>
          <div class="flex items-center space-x-4">
            <button
              @click="decreaseTeamCount"
              :disabled="teamCount <= 2"
              :class="[
                'w-12 h-12 rounded-full text-2xl font-bold transition duration-200',
                teamCount <= 2
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              ]"
            >
              -
            </button>
            <div class="flex flex-col items-center">
              <span class="text-4xl font-bold text-gray-800 w-12 text-center">{{ teamCount }}</span>
              <span class="text-sm text-gray-500 mt-1">
                {{ selectedLanguage === 'es' ? 'equipos' : 'teams' }}
              </span>
            </div>
            <button
              @click="increaseTeamCount"
              :disabled="teamCount >= 8"
              :class="[
                'w-12 h-12 rounded-full text-2xl font-bold transition duration-200',
                teamCount >= 8
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              ]"
            >
              +
            </button>
          </div>
        </div>

        <!-- Nombres de equipos -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">
            {{ selectedLanguage === 'es' ? 'Nombres de los equipos:' : 'Team names:' }}
          </h3>
          <div class="space-y-3">
            <div v-for="index in teamCount" :key="index" class="mb-3">
              <label class="block text-gray-600 mb-2 text-sm">
                {{ selectedLanguage === 'es' ? 'Equipo' : 'Team' }} {{ index }}
              </label>
              <input
                v-model="teamNames[index - 1]"
                type="text"
                :placeholder="selectedLanguage === 'es' ? `Nombre equipo ${index}` : `Team ${index} name`"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                @input="validateTeamNames"
              />
            </div>
          </div>
          <p v-if="teamNamesError" class="text-red-500 text-sm mt-2">{{ teamNamesError }}</p>
        </div>

        <!-- Selección de Categorías -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">
            {{ selectedLanguage === 'es' ? 'Categorías de Preguntas:' : 'Question Categories:' }}
          </h3>

          <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-700">
                {{ selectedLanguage === 'es' ? 'Selecciona categorías:' : 'Select categories:' }}
              </span>
              <div class="flex space-x-2">
                <button
                  @click="selectAllCategories"
                  class="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition duration-200"
                >
                  {{ selectedLanguage === 'es' ? 'Todas' : 'All' }}
                </button>
                <button
                  @click="deselectAllCategories"
                  class="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition duration-200"
                >
                  {{ selectedLanguage === 'es' ? 'Ninguna' : 'None' }}
                </button>
              </div>
            </div>

            <div class="text-xs text-gray-500 mb-3">
              {{ selectedLanguage === 'es'
                 ? `Seleccionadas: ${selectedCategoriesCount} de ${categories.length} categorías`
                 : `Selected: ${selectedCategoriesCount} of ${categories.length} categories` }}
            </div>
          </div>

          <!-- Grid de categorías -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div
              v-for="category in categories"
              :key="category.id"
              @click="toggleCategory(category.id)"
              :class="[
                'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]',
                selectedCategories.includes(category.id)
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center">
                <div :class="[
                  'w-6 h-6 rounded-full mr-3 flex items-center justify-center',
                  selectedCategories.includes(category.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                ]">
                  <svg v-if="selectedCategories.includes(category.id)" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-800 text-sm">
                    {{ selectedLanguage === 'es' ? category.name.es : category.name.en }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ selectedLanguage === 'es' ? category.description.es : category.description.en }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="categoriesError" class="text-red-500 text-sm mt-3">
            {{ categoriesError }}
          </div>
        </div>
      </div>

      <!-- Columna derecha: Configuración de rondas + APIs -->
      <div>
        <!-- Número de rondas -->
        <div class="mb-8">
          <label class="block text-gray-700 font-semibold mb-3">
            {{ selectedLanguage === 'es'
               ? 'Número de rondas:'
               : 'Number of rounds:' }}
          </label>
          <div class="flex items-center space-x-4">
            <button
              @click="decreaseRounds"
              :disabled="rounds <= 1"
              :class="[
                'w-12 h-12 rounded-full text-2xl font-bold transition duration-200',
                rounds <= 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              ]"
            >
              -
            </button>
            <div class="flex flex-col items-center">
              <span class="text-4xl font-bold text-gray-800 w-12 text-center">{{ rounds }}</span>
              <span class="text-sm text-gray-500 mt-1">
                {{ selectedLanguage === 'es' ? 'rondas' : 'rounds' }}
              </span>
            </div>
            <button
              @click="increaseRounds"
              :disabled="rounds >= 10"
              :class="[
                'w-12 h-12 rounded-full text-2xl font-bold transition duration-200',
                rounds >= 10
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              ]"
            >
              +
            </button>
          </div>
          <p class="text-sm text-gray-500 mt-2">
            {{ selectedLanguage === 'es'
               ? 'Cada equipo jugará una vez por ronda'
               : 'Each team will play once per round' }}
          </p>
        </div>

        <!-- Preguntas por ronda -->
        <div class="mb-8">
          <label class="block text-gray-700 font-semibold mb-3">
            {{ selectedLanguage === 'es'
               ? 'Preguntas por ronda:'
               : 'Questions per round:' }}
          </label>
          <div class="flex items-center space-x-4">
            <button
              @click="decreaseQuestionsPerRound"
              :disabled="questionsPerRound <= 1"
              :class="[
                'w-12 h-12 rounded-full text-2xl font-bold transition duration-200',
                questionsPerRound <= 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              ]"
            >
              -
            </button>
            <div class="flex flex-col items-center">
              <span class="text-4xl font-bold text-gray-800 w-12 text-center">{{ questionsPerRound }}</span>
              <span class="text-sm text-gray-500 mt-1">
                {{ selectedLanguage === 'es' ? 'preguntas' : 'questions' }}
              </span>
            </div>
            <button
              @click="increaseQuestionsPerRound"
              :disabled="questionsPerRound >= 20"
              :class="[
                'w-12 h-12 rounded-full text-2xl font-bold transition duration-200',
                questionsPerRound >= 20
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              ]"
            >
              +
            </button>
          </div>
          <p class="text-sm text-gray-500 mt-2">
            {{ selectedLanguage === 'es'
               ? `Total: ${totalQuestions} preguntas`
               : `Total: ${totalQuestions} questions` }}
          </p>
        </div>

        <!-- Resumen del juego -->
        <div class="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 class="font-bold text-blue-800 mb-3">
            {{ selectedLanguage === 'es' ? 'Resumen del juego:' : 'Game summary:' }}
          </h4>
          <ul class="space-y-2 text-sm text-blue-700">
            <li class="flex justify-between">
              <span>{{ selectedLanguage === 'es' ? 'Equipos:' : 'Teams:' }}</span>
              <span class="font-semibold">{{ teamCount }}</span>
            </li>
            <li class="flex justify-between">
              <span>{{ selectedLanguage === 'es' ? 'Rondas:' : 'Rounds:' }}</span>
              <span class="font-semibold">{{ rounds }}</span>
            </li>
            <li class="flex justify-between">
              <span>{{ selectedLanguage === 'es' ? 'Preguntas por ronda:' : 'Questions per round:' }}</span>
              <span class="font-semibold">{{ questionsPerRound }}</span>
            </li>
            <li class="flex justify-between">
              <span>{{ selectedLanguage === 'es' ? 'Categorías:' : 'Categories:' }}</span>
              <span class="font-semibold">{{ selectedCategoriesCount }}</span>
            </li>
            <li class="flex justify-between border-t border-blue-200 pt-2">
              <span class="font-semibold">{{ selectedLanguage === 'es' ? 'Total preguntas:' : 'Total questions:' }}</span>
              <span class="font-bold text-blue-800">{{ totalQuestions }}</span>
            </li>
            <li class="flex justify-between">
              <span class="font-semibold">{{ selectedLanguage === 'es' ? 'Tiempo estimado:' : 'Estimated time:' }}</span>
              <span class="font-bold text-blue-800">{{ estimatedTime }}</span>
            </li>
          </ul>

          <!-- Vista previa de categorías seleccionadas -->
          <div v-if="selectedCategoriesCount > 0" class="mt-4 pt-4 border-t border-blue-200">
            <div class="text-xs font-medium text-blue-800 mb-2">
              {{ selectedLanguage === 'es' ? 'Categorías seleccionadas:' : 'Selected categories:' }}
            </div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="catId in selectedCategories.slice(0, 5)"
                :key="`preview-${catId}`"
                class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {{ getCategoryName(catId) }}
              </span>
              <span
                v-if="selectedCategoriesCount > 5"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                +{{ selectedCategoriesCount - 5 }} más
              </span>
            </div>
          </div>
        </div>

        <!-- Botón para iniciar -->
        <button
          type="button"
          @click="startGame"
          :disabled="!canStart"
          :class="[
            'w-full py-4 rounded-xl font-bold text-lg transition duration-300 shadow-lg',
            canStart
              ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white transform hover:scale-[1.02]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <div class="flex items-center justify-center">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ selectedLanguage === 'es' ? '¡Comenzar Juego!' : 'Start Game!' }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkAIServices } from '@/utils/apiService'

const props = defineProps({
  language: {
    type: String,
    default: 'es'
  }
})

const emit = defineEmits(['start-game', 'update-language'])

const selectedLanguage = ref(props.language)
const teamCount = ref(2)
const teamNames = ref(['', ''])
const teamNamesError = ref('')
const rounds = ref(3)
const questionsPerRound = ref(5)
const apiStatus = ref(null)
const checkingAPI = ref(false)

// Categorías disponibles
const categories = [
  {
    id: 'funny',
    name: { es: 'Divertido', en: 'Funny' },
    description: {
      es: 'Preguntas graciosas para reírse',
      en: 'Funny questions to laugh'
    },
    icon: '😄'
  },
  {
    id: 'pop-culture',
    name: { es: 'Cultura Pop', en: 'Pop Culture' },
    description: {
      es: 'Celebridades, películas y series',
      en: 'Celebrities, movies and series'
    },
    icon: '🎬'
  },
  {
    id: 'what-if',
    name: { es: '¿Qué pasaría si...?', en: 'What if...?' },
    description: {
      es: 'Situaciones hipotéticas divertidas',
      en: 'Funny hypothetical situations'
    },
    icon: '🤔'
  },
  {
    id: 'personal',
    name: { es: 'Personal', en: 'Personal' },
    description: {
      es: 'Preguntas personales divertidas',
      en: 'Funny personal questions'
    },
    icon: '👤'
  },
  {
    id: 'challenge',
    name: { es: 'Desafío', en: 'Challenge' },
    description: {
      es: 'Retos y desafíos divertidos',
      en: 'Funny challenges and dares'
    },
    icon: '🎯'
  },
  {
    id: 'food',
    name: { es: 'Comida', en: 'Food' },
    description: {
      es: 'Preguntas sobre comida divertida',
      en: 'Funny food questions'
    },
    icon: '🍕'
  },
  {
    id: 'travel',
    name: { es: 'Viajes', en: 'Travel' },
    description: {
      es: 'Preguntas sobre viajes divertidos',
      en: 'Funny travel questions'
    },
    icon: '✈️'
  },
  {
    id: 'random',
    name: { es: 'Aleatorio', en: 'Random' },
    description: {
      es: 'Preguntas completamente aleatorias',
      en: 'Completely random questions'
    },
    icon: '🎲'
  }
]

// Categorías seleccionadas (por defecto: todas)
const selectedCategories = ref(categories.map(cat => cat.id))
const categoriesError = ref('')

// Calcular total de preguntas
const totalQuestions = computed(() => rounds.value * questionsPerRound.value * teamCount.value)

// Calcular tiempo estimado (30 segundos por pregunta en promedio)
const estimatedTime = computed(() => {
  const totalMinutes = Math.ceil((totalQuestions.value * 0.5) / 60)
  return `${totalMinutes} ${selectedLanguage.value === 'es' ? 'minutos' : 'minutes'}`
})

// Contador de categorías seleccionadas
const selectedCategoriesCount = computed(() => selectedCategories.value.length)

onMounted(() => {
  setTimeout(() => {
    checkAPIStatus()
  }, 1000)
})

// Inicializar nombres de equipos
const initializeTeamNames = () => {
  teamNames.value = Array.from({ length: teamCount.value }, (_, i) =>
    selectedLanguage.value === 'es'
      ? `Equipo ${i + 1}`
      : `Team ${i + 1}`
  )
}

// Aumentar/disminuir número de equipos
const increaseTeamCount = () => {
  if (teamCount.value < 8) {
    teamCount.value++
    initializeTeamNames()
  }
}

const decreaseTeamCount = () => {
  if (teamCount.value > 2) {
    teamCount.value--
    initializeTeamNames()
  }
}

// Aumentar/disminuir rondas
const increaseRounds = () => {
  if (rounds.value < 10) rounds.value++
}

const decreaseRounds = () => {
  if (rounds.value > 1) rounds.value--
}

// Aumentar/disminuir preguntas por ronda
const increaseQuestionsPerRound = () => {
  if (questionsPerRound.value < 20) questionsPerRound.value++
}

const decreaseQuestionsPerRound = () => {
  if (questionsPerRound.value > 1) questionsPerRound.value--
}

// Establecer idioma
const setLanguage = (lang) => {
  selectedLanguage.value = lang
  emit('update-language', lang)
  initializeTeamNames()
}

// Manejar selección de categorías
const toggleCategory = (categoryId) => {
  const index = selectedCategories.value.indexOf(categoryId)
  if (index === -1) {
    selectedCategories.value.push(categoryId)
  } else {
    selectedCategories.value.splice(index, 1)
  }
  validateCategories()
}

const selectAllCategories = () => {
  selectedCategories.value = categories.map(cat => cat.id)
  validateCategories()
}

const deselectAllCategories = () => {
  selectedCategories.value = []
  validateCategories()
}

// Validar categorías seleccionadas
const validateCategories = () => {
  if (selectedCategories.value.length === 0) {
    categoriesError.value = selectedLanguage.value === 'es'
      ? 'Debes seleccionar al menos una categoría'
      : 'You must select at least one category'
    return false
  }
  categoriesError.value = ''
  return true
}

// Obtener nombre de categoría
const getCategoryName = (categoryId) => {
  const category = categories.find(c => c.id === categoryId)
  if (!category) return ''
  return selectedLanguage.value === 'es' ? category.name.es : category.name.en
}

// Validar nombres de equipos
const validateTeamNames = () => {
  const emptyNames = teamNames.value.filter(name => !name.trim())
  if (emptyNames.length > 0) {
    teamNamesError.value = selectedLanguage.value === 'es'
      ? 'Todos los equipos deben tener un nombre'
      : 'All teams must have a name'
    return false
  }

  const uniqueNames = new Set(teamNames.value.map(name => name.trim().toLowerCase()))
  if (uniqueNames.size !== teamNames.value.length) {
    teamNamesError.value = selectedLanguage.value === 'es'
      ? 'Los nombres de los equipos deben ser diferentes'
      : 'Team names must be different'
    return false
  }

  teamNamesError.value = ''
  return true
}

// Comprobar si se puede iniciar el juego
const canStart = computed(() => {
  const validTeams = teamNames.value.every(name => name.trim() !== '') &&
         new Set(teamNames.value.map(name => name.trim().toLowerCase())).size === teamNames.value.length

  const validCategories = selectedCategories.value.length > 0

  return validTeams && validCategories
})

// Iniciar el juego
const startGame = () => {
  if (validateTeamNames() && validateCategories()) {
    emit('start-game', {
      language: selectedLanguage.value,
      teams: teamNames.value.map(name => name.trim()),
      totalRounds: rounds.value,
      questionsPerRound: questionsPerRound.value,
      selectedCategories: [...selectedCategories.value] // Enviar categorías seleccionadas
    })
  }
}

const checkAPIStatus = async () => {
  checkingAPI.value = true

  try {
    const services = await checkAIServices()

    // Ordenar: Gemini primero, luego otros, LocalFallback último
    apiStatus.value = Object.entries(services)
      .map(([name, status]) => ({
        name,
        available: status.available,
        reason: status.reason,
        priority: name === 'LocalFallback' ? 999 : 2
      }))
      .sort((a, b) => a.priority - b.priority)

    // Mostrar estadísticas
    const availableCount = apiStatus.value.filter(s => s.available).length

    console.log(`API Status: ${availableCount}/${apiStatus.value.length} available`)
  } catch (error) {
    console.error('Error checking API status:', error)
    apiStatus.value = null
  } finally {
    checkingAPI.value = false
  }
}

// Inicializar al cargar
initializeTeamNames()
</script>
