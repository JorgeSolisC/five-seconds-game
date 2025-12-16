<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <header class="text-center mb-8 md:mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-purple-800 mb-2">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Five Seconds Game
          </span>
        </h1>
        <p class="text-gray-600 text-lg">
          {{ language === 'es' ? '¡Responde rápido, solo tienes 5 segundos!' : 'Answer fast, you only have 5 seconds!' }}
        </p>
      </header>

      <div v-if="!gameStarted" class="flex justify-center">
        <GameSetup 
          @start-game="startGame"
          :language="language"
          @update-language="updateLanguage"
        />
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-6">
        <!-- Panel de puntuaciones -->
        <div class="lg:w-1/4">
          <ScoreBoard 
            :teams="teams"
            :current-team-index="currentTeamIndex"
            :language="language"
            @update-score="updateScore"
          />
        </div>

        <!-- Panel principal del juego -->
        <div class="lg:w-3/4">
          <QuestionDisplay
            :current-question="currentQuestion"
            :current-team="teams[currentTeamIndex]"
            :timer="timer"
            :language="language"
            :categories="categories"
            :current-category="currentCategory"
            @next-question="getNextQuestion"
            @timer-end="handleTimerEnd"
          />
        </div>
      </div>

      <!-- Botón de reinicio -->
      <div v-if="gameStarted" class="mt-8 text-center">
        <button
          @click="resetGame"
          class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-md transition duration-200"
        >
          {{ language === 'es' ? 'Reiniciar Juego' : 'Reset Game' }}
        </button>
      </div>

      <!-- Instrucciones -->
      <div class="mt-12 max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-lg">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          {{ language === 'es' ? '¿Cómo jugar?' : 'How to play?' }}
        </h2>
        <ul class="space-y-3 text-gray-600">
          <li v-if="language === 'es'" class="flex items-start">
            <span class="inline-block w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-center mr-3 flex-shrink-0">1</span>
            <span>Un jugador de cada equipo responde preguntas aleatorias en 5 segundos</span>
          </li>
          <li v-if="language === 'es'" class="flex items-start">
            <span class="inline-block w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-center mr-3 flex-shrink-0">2</span>
            <span>Si responde correctamente dentro del tiempo, su equipo gana un punto</span>
          </li>
          <li v-if="language === 'es'" class="flex items-start">
            <span class="inline-block w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-center mr-3 flex-shrink-0">3</span>
            <span>El equipo con más puntos al final gana</span>
          </li>
          
          <li v-if="language === 'en'" class="flex items-start">
            <span class="inline-block w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-center mr-3 flex-shrink-0">1</span>
            <span>One player from each team answers random questions in 5 seconds</span>
          </li>
          <li v-if="language === 'en'" class="flex items-start">
            <span class="inline-block w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-center mr-3 flex-shrink-0">2</span>
            <span>If they answer correctly within the time, their team gets a point</span>
          </li>
          <li v-if="language === 'en'" class="flex items-start">
            <span class="inline-block w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-center mr-3 flex-shrink-0">3</span>
            <span>The team with the most points at the end wins</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import GameSetup from './components/GameSetup.vue'
import QuestionDisplay from './components/QuestionDisplay.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import { generateQuestion, getRandomCategory, categories } from './utils/questionGenerator'
import { useLocalStorage } from './composables/useLocalStorage'

// Configuración del juego
const language = ref('es')
const teams = ref([])
const gameStarted = ref(false)
const currentTeamIndex = ref(0)
const currentQuestion = ref('')
const currentCategory = ref('')
const timer = ref(5)
//const categoriesList = ref(categories)

// Usar localStorage para persistencia
const { 
  saveToStorage, 
  loadFromStorage, 
  clearStorage 
} = useLocalStorage('fiveSecondsGame')

// Cargar datos guardados al iniciar
onMounted(() => {
  const savedData = loadFromStorage()
  if (savedData) {
    language.value = savedData.language || 'es'
    teams.value = savedData.teams || []
    gameStarted.value = savedData.gameStarted || false
    currentTeamIndex.value = savedData.currentTeamIndex || 0
    currentQuestion.value = savedData.currentQuestion || ''
    currentCategory.value = savedData.currentCategory || ''
  }
})

// Guardar datos cuando cambien
watch([language, teams, gameStarted, currentTeamIndex, currentQuestion, currentCategory], () => {
  saveGameState()
}, { deep: true })

// Función para guardar el estado del juego
const saveGameState = () => {
  const gameState = {
    language: language.value,
    teams: teams.value,
    gameStarted: gameStarted.value,
    currentTeamIndex: currentTeamIndex.value,
    currentQuestion: currentQuestion.value,
    currentCategory: currentCategory.value,
    timestamp: new Date().getTime()
  }
  saveToStorage(gameState)
}

// Iniciar el juego
const startGame = (gameConfig) => {
  language.value = gameConfig.language
  teams.value = gameConfig.teams.map(teamName => ({
    name: teamName,
    score: 0,
    color: getRandomColor()
  }))
  gameStarted.value = true
  currentTeamIndex.value = 0
  getNextQuestion()
}

// Actualizar idioma
const updateLanguage = (newLanguage) => {
  language.value = newLanguage
}

// Obtener la siguiente pregunta
const getNextQuestion = async () => {
  currentCategory.value = getRandomCategory(language.value)
  currentQuestion.value = await generateQuestion(currentCategory.value, language.value)
  
  // Reiniciar el temporizador
  timer.value = 5
}

// Manejar cuando el temporizador llega a 0
const handleTimerEnd = () => {
  // Puedes agregar lógica aquí para cuando se acaba el tiempo
  console.log(language.value === 'es' ? '¡Tiempo agotado!' : 'Time\'s up!')
}

// Actualizar puntuación
const updateScore = (teamIndex, increment) => {
  if (teams.value[teamIndex]) {
    teams.value[teamIndex].score += increment ? 1 : 0
    // Cambiar al siguiente equipo
    currentTeamIndex.value = (currentTeamIndex.value + 1) % teams.value.length
    getNextQuestion()
  }
}

// Reiniciar el juego
const resetGame = () => {
  if (confirm(language.value === 'es' 
    ? '¿Estás seguro de que quieres reiniciar el juego?' 
    : 'Are you sure you want to reset the game?')) {
    teams.value = []
    gameStarted.value = false
    currentTeamIndex.value = 0
    currentQuestion.value = ''
    clearStorage()
  }
}

// Generar color aleatorio para los equipos
const getRandomColor = () => {
  const colors = [
    'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>