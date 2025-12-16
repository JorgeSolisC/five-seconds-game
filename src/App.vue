<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="text-center mb-8 md:mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-purple-800 mb-2">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            {{ language === 'es' ? 'Juego Cinco Segundos' : 'Five Seconds Game' }}
          </span>
        </h1>
      </header>

      <!-- Pantalla de configuración -->
      <div v-if="gamePhase === 'setup'">
        <GameSetup @start-game="startGame" :language="language" @update-language="updateLanguage" />
      </div>

      <!-- Pantalla de carga (generando preguntas) -->
      <div v-else-if="gamePhase === 'loading'" class="flex justify-center items-center min-h-[400px]">
        <div class="text-center">
          <!-- Spinner con animación -->
          <div class="relative mb-6">
            <div class="inline-block animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="h-12 w-12 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 animate-pulse"></div>
            </div>
          </div>

          <!-- Mensaje de carga -->
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            {{ loadingMessage }}
          </h2>
          <p class="text-gray-600 mb-6">
            {{ language === 'es'
              ? `${totalQuestions} preguntas para ${totalRounds} rondas`
              : `${totalQuestions} questions for ${totalRounds} rounds` }}
          </p>

          <!-- Barra de progreso -->
          <div class="w-64 mx-auto mb-4">
            <div class="flex justify-between text-sm text-gray-500 mb-1">
              <span>0%</span>
              <span>{{ loadingProgress }}%</span>
              <span>100%</span>
            </div>
            <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all duration-300"
                :style="{ width: `${loadingProgress}%` }"></div>
            </div>
          </div>

          <!-- Indicador de que se está usando almacenamiento -->
          <p class="text-xs text-gray-400 mt-6">
            {{ language === 'es'
              ? 'Las preguntas se guardan localmente para jugar sin conexión'
              : 'Questions are saved locally for offline play' }}
          </p>
        </div>
      </div>

      <!-- Juego en curso -->
      <div v-else-if="gamePhase === 'playing'" class="flex flex-col lg:flex-row gap-6">
        <!-- Panel de puntuaciones -->
        <div class="lg:w-1/4">
          <ScoreBoard :teams="teams" :current-team-index="currentTeamIndex" :language="language"
            :current-round="currentRound" :total-rounds="totalRounds" :current-question-index="currentQuestionIndex"
            :questions-per-round="questionsPerRound" @update-score="updateScore" />
        </div>

        <!-- Panel principal del juego -->
        <div class="lg:w-3/4">
          <QuestionDisplay :current-question="currentQuestion" :current-team="teams[currentTeamIndex]" :timer="timer"
            :language="language" :current-category="currentCategory" :current-round="currentRound"
            :total-rounds="totalRounds" :current-question-number="currentQuestionIndex + 1"
            :total-questions-in-round="questionsPerRound" @next-question="nextQuestion" @timer-end="handleTimerEnd"
            @update-score="handleAnswer" />
        </div>
      </div>

      <!-- Pantalla de resultados finales -->
      <div v-else-if="gamePhase === 'results'" class="max-w-4xl mx-auto">
        <GameResults :teams="teams" :language="language" :total-rounds="totalRounds"
          :questions-per-round="questionsPerRound" @play-again="resetGame" @new-game="newGame" />
      </div>

      <!-- Botón de reinicio (solo durante el juego) -->
      <div v-if="gamePhase === 'playing'" class="mt-8 text-center">
        <button @click="confirmReset"
          class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-md transition duration-200">
          {{ language === 'es' ? 'Reiniciar Juego' : 'Reset Game' }}
        </button>
        <button @click="newGame"
          class="flex-1 py-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold rounded-xl text-lg transition duration-300 shadow-lg">
          <div class="flex items-center justify-center">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6">
              </path>
            </svg>
            {{ language === 'es' ? 'Nuevo Juego' : 'New Game' }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import GameSetup from './components/GameSetup.vue'
import QuestionDisplay from './components/QuestionDisplay.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import GameResults from './components/GameResults.vue'
import { generateQuestionsBatch } from './utils/questionGenerator'
import { useGameStorage } from './composables/useGameStorage'

// Fases del juego: 'setup' | 'loading' | 'playing' | 'results'
const gamePhase = ref('setup')
const language = ref('es')
const teams = ref([])
const currentTeamIndex = ref(0)
const currentQuestion = ref('')
const currentCategory = ref('')
const timer = ref(5)

// Configuración de rondas
const totalRounds = ref(3)
const questionsPerRound = ref(5)
const currentRound = ref(1)
const currentQuestionIndex = ref(0)

// Almacenamiento de preguntas
const allQuestions = ref([]) // Array de arrays: [ronda][pregunta]
const loadingProgress = ref(0)
const loadingMessage = ref('')

// Sistema de almacenamiento mejorado
const {
  saveGameState,
  loadGameState,
  clearGameState,
  saveQuestionsToStorage,
  loadQuestionsFromStorage,
  getStorageStats
} = useGameStorage()

// Calcular total de preguntas
const totalQuestions = computed(() => totalRounds.value * questionsPerRound.value)

// Cargar datos guardados al iniciar
onMounted(async () => {
  console.log('Loading game state from storage...')

  try {
    const savedGame = await loadGameState()

    if (savedGame) {
      console.log('Game state loaded:', savedGame)

      gamePhase.value = savedGame.gamePhase || 'setup'
      language.value = savedGame.language || 'es'

      // Asegurar que teams sea un array válido
      if (Array.isArray(savedGame.teams)) {
        teams.value = savedGame.teams.map(team => ({
          name: team.name || 'Equipo',
          score: typeof team.score === 'number' ? team.score : 0,
          color: team.color || getRandomColor(),
          roundScores: Array.isArray(team.roundScores) ? team.roundScores : new Array(savedGame.totalRounds || 3).fill(0)
        }))
      } else {
        teams.value = []
      }

      currentTeamIndex.value = savedGame.currentTeamIndex || 0
      currentRound.value = savedGame.currentRound || 1
      currentQuestionIndex.value = savedGame.currentQuestionIndex || 0
      totalRounds.value = savedGame.totalRounds || 3
      questionsPerRound.value = savedGame.questionsPerRound || 5

      // Solo intentar cargar preguntas si el juego estaba en curso
      if (gamePhase.value === 'playing' || gamePhase.value === 'loading') {
        loadingMessage.value = language.value === 'es'
          ? 'Cargando preguntas guardadas...'
          : 'Loading saved questions...'

        const savedQuestions = await loadQuestionsFromStorage()
        if (savedQuestions && savedQuestions.length > 0) {
          allQuestions.value = savedQuestions
          console.log(`Loaded ${savedQuestions.length} rounds of questions`)

          if (gamePhase.value === 'playing') {
            loadCurrentQuestion()
          }
        } else {
          // Si no hay preguntas guardadas pero el juego estaba en curso, volver a setup
          console.log('No saved questions found, returning to setup')
          gamePhase.value = 'setup'
          teams.value = []
          await clearGameState()
        }
      }
    }
  } catch (error) {
    console.error('Error loading game state:', error)
    // En caso de error, empezar desde cero
    gamePhase.value = 'setup'
    teams.value = []
  }

  // Ver estadísticas de almacenamiento (opcional, para debugging)
  const stats = await getStorageStats()
  console.log('Storage stats:', stats)
})

// Guardar estado del juego cuando cambie
watch([
  gamePhase, language, teams, currentTeamIndex,
  currentRound, currentQuestionIndex, totalRounds, questionsPerRound
], async () => {
  await saveGameToStorage()
}, { deep: true })

// Iniciar el juego con configuración
const startGame = async (gameConfig) => {
  console.log('Starting game with config:', gameConfig)

  language.value = gameConfig.language
  teams.value = gameConfig.teams.map(teamName => ({
    name: teamName,
    score: 0,
    color: getRandomColor(),
    roundScores: new Array(gameConfig.totalRounds).fill(0)
  }))
  totalRounds.value = gameConfig.totalRounds
  questionsPerRound.value = gameConfig.questionsPerRound

  // Guardar categorías seleccionadas
  const selectedCategories = gameConfig.selectedCategories || ['random']
  console.log('Selected categories:', selectedCategories)

  // Cambiar a fase de carga
  gamePhase.value = 'loading'
  loadingProgress.value = 0
  loadingMessage.value = language.value === 'es'
    ? 'Preparando juego...'
    : 'Preparing game...'

  try {
    // Generar todas las preguntas para todas las rondas
    await generateAllQuestions(selectedCategories)

    // Iniciar juego
    gamePhase.value = 'playing'
    currentRound.value = 1
    currentQuestionIndex.value = 0
    currentTeamIndex.value = 0
    loadCurrentQuestion()

    console.log('Game started successfully')

  } catch (error) {
    console.error('Error generating questions:', error)
    alert(language.value === 'es'
      ? 'Error generando preguntas. Por favor, intenta de nuevo.'
      : 'Error generating questions. Please try again.')
    gamePhase.value = 'setup'
    teams.value = []
  }
}

// Actualizar generateAllQuestions para aceptar categorías:
const generateAllQuestions = async (selectedCategories = ['random']) => {
  allQuestions.value = []
  loadingMessage.value = language.value === 'es'
    ? 'Generando preguntas...'
    : 'Generating questions...'

  console.log(`Generating ${totalRounds.value} rounds with ${questionsPerRound.value} questions each`)
  console.log('Using categories:', selectedCategories)

  for (let round = 0; round < totalRounds.value; round++) {
    const roundQuestions = []

    for (let q = 0; q < questionsPerRound.value; q++) {
      loadingMessage.value = language.value === 'es'
        ? `Generando pregunta ${q + 1} de la ronda ${round + 1}...`
        : `Generating question ${q + 1} of round ${round + 1}...`

      try {
        // Seleccionar categoría aleatoria de las seleccionadas
        const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)]

        // Generar pregunta
        const questionData = await generateQuestionsBatch(1, language.value, randomCategory)

        if (questionData && questionData.length > 0) {
          roundQuestions.push({
            id: questionData[0].id || `question-${round}-${q}`,
            text: questionData[0].text,
            category: questionData[0].category,
            language: questionData[0].language,
            difficulty: questionData[0].difficulty || 'medium',
            timestamp: new Date().toISOString()
          })
        } else {
          // Fallback si no se generó pregunta
          roundQuestions.push({
            id: `question-${round}-${q}`,
            text: language.value === 'es'
              ? `Pregunta ${q + 1} de la ronda ${round + 1}`
              : `Question ${q + 1} of round ${round + 1}`,
            category: randomCategory,
            language: language.value,
            difficulty: 'medium',
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error(`Error generating question for round ${round}, question ${q}:`, error)
        // Pregunta de respaldo
        const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)]
        roundQuestions.push({
          id: `backup-${round}-${q}`,
          text: language.value === 'es'
            ? `¿Cuál es tu color favorito? (${q + 1})`
            : `What is your favorite color? (${q + 1})`,
          category: randomCategory,
          language: language.value,
          difficulty: 'easy',
          timestamp: new Date().toISOString()
        })
      }

      // Actualizar progreso
      const currentIndex = round * questionsPerRound.value + q
      loadingProgress.value = Math.round(
        ((currentIndex + 1) / totalQuestions.value) * 100
      )

      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    allQuestions.value.push(roundQuestions)
    console.log(`Round ${round + 1} completed: ${roundQuestions.length} questions`)
  }

  // Guardar preguntas en almacenamiento
  const saved = await saveQuestionsToStorage(allQuestions.value)
  if (saved) {
    console.log('Questions saved to storage successfully')
  } else {
    console.warn('Failed to save questions to storage')
  }

  loadingMessage.value = language.value === 'es'
    ? '¡Todo listo!'
    : 'All set!'
}


// Cargar pregunta actual
const loadCurrentQuestion = () => {
  if (allQuestions.value[currentRound.value - 1] &&
    allQuestions.value[currentRound.value - 1][currentQuestionIndex.value]) {

    const questionData = allQuestions.value[currentRound.value - 1][currentQuestionIndex.value]
    currentQuestion.value = questionData.text
    currentCategory.value = questionData.category
    timer.value = 5

    console.log(`Loading question ${currentQuestionIndex.value + 1} of round ${currentRound.value}: ${currentQuestion.value.substring(0, 50)}...`)
  } else {
    // Fallback si no hay pregunta
    currentQuestion.value = language.value === 'es'
      ? 'Pregunta no disponible. ¡Suerte!'
      : 'Question not available. Good luck!'
    currentCategory.value = 'random'
    timer.value = 5
  }
}

// Siguiente pregunta
const nextQuestion = () => {
  currentQuestionIndex.value++

  if (currentQuestionIndex.value >= questionsPerRound.value) {
    // Fin de la ronda
    currentQuestionIndex.value = 0
    currentRound.value++

    if (currentRound.value > totalRounds.value) {
      // Fin del juego
      gamePhase.value = 'results'
      console.log('Game finished, showing results')
      return
    }
  }

  // Cambiar al siguiente equipo
  currentTeamIndex.value = (currentTeamIndex.value + 1) % teams.value.length
  loadCurrentQuestion()
}

// Manejar respuesta correcta
const handleAnswer = (updateScore = false) => {
  if (teams.value[currentTeamIndex.value] && updateScore) {
    teams.value[currentTeamIndex.value].score++
    // Actualizar puntuación de la ronda actual
    if (teams.value[currentTeamIndex.value].roundScores) {
      teams.value[currentTeamIndex.value].roundScores[currentRound.value - 1]++
    }
  }
  nextQuestion()
}

// Actualizar puntuación manualmente
const updateScore = (teamIndex, increment) => {
  if (teams.value[teamIndex]) {
    if (increment) {
      teams.value[teamIndex].score++
      if (teams.value[teamIndex].roundScores) {
        teams.value[teamIndex].roundScores[currentRound.value - 1]++
      }
    } else if (teams.value[teamIndex].score > 0) {
      teams.value[teamIndex].score--
      if (teams.value[teamIndex].roundScores && teams.value[teamIndex].roundScores[currentRound.value - 1] > 0) {
        teams.value[teamIndex].roundScores[currentRound.value - 1]--
      }
    }
  }
}

// Guardar estado del juego
const saveGameToStorage = async () => {
  const gameState = {
    gamePhase: gamePhase.value,
    language: language.value,
    teams: teams.value.map(team => ({
      name: team.name,
      score: team.score,
      color: team.color,
      roundScores: [...team.roundScores] // Crear copia del array
    })),
    currentTeamIndex: currentTeamIndex.value,
    currentRound: currentRound.value,
    currentQuestionIndex: currentQuestionIndex.value,
    totalRounds: totalRounds.value,
    questionsPerRound: questionsPerRound.value,
    timestamp: new Date().getTime()
  }

  const saved = await saveGameState(gameState)
  if (!saved) {
    console.warn('Failed to save game state')
  }
}

// Confirmar reinicio
const confirmReset = () => {
  if (confirm(language.value === 'es'
    ? '¿Estás seguro de que quieres reiniciar el juego? Se perderá el progreso actual.'
    : 'Are you sure you want to reset the game? Current progress will be lost.')) {
    resetGame()
  }
}

// Reiniciar juego
const resetGame = async () => {
  // Mantener configuración, reiniciar puntuaciones
  teams.value = teams.value.map(team => ({
    ...team,
    score: 0,
    roundScores: new Array(totalRounds.value).fill(0)
  }))
  currentTeamIndex.value = 0
  currentRound.value = 1
  currentQuestionIndex.value = 0
  loadCurrentQuestion()
  gamePhase.value = 'playing'

  // Guardar estado reiniciado
  await saveGameToStorage()
}

// Nuevo juego
const newGame = async () => {
  await clearGameState()
  gamePhase.value = 'setup'
  teams.value = []
  allQuestions.value = []
  console.log('New game started, storage cleared')
}

// Generar color aleatorio
const getRandomColor = () => {
  const colors = [
    'bg-gradient-to-r from-blue-500 to-blue-600',
    'bg-gradient-to-r from-red-500 to-red-600',
    'bg-gradient-to-r from-green-500 to-green-600',
    'bg-gradient-to-r from-yellow-500 to-yellow-600',
    'bg-gradient-to-r from-purple-500 to-purple-600',
    'bg-gradient-to-r from-pink-500 to-pink-600',
    'bg-gradient-to-r from-indigo-500 to-indigo-600',
    'bg-gradient-to-r from-teal-500 to-teal-600'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Actualizar idioma
const updateLanguage = (newLanguage) => {
  language.value = newLanguage
}

// Manejar fin del temporizador
const handleTimerEnd = () => {
  console.log('Timer ended for question:', currentQuestion.value.substring(0, 50))
}
</script>
