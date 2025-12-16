import localforage from 'localforage'

// Configurar localforage para usar IndexedDB
const gameStore = localforage.createInstance({
  name: 'FiveSecondsGame',
  storeName: 'game_data'
})

const questionsStore = localforage.createInstance({
  name: 'FiveSecondsGame',
  storeName: 'questions_data'
})

// Función para serializar arrays complejos
const serializeQuestions = (questions) => {
  if (!questions) return null

  try {
    // Convertir array de arrays a array plano con metadatos
    const serialized = questions.map((round, roundIndex) => ({
      round: roundIndex + 1,
      questions: round.map((q, qIndex) => ({
        id: q.id || `question-${roundIndex}-${qIndex}`,
        text: q.text,
        category: q.category,
        language: q.language,
        difficulty: q.difficulty || 'medium',
        timestamp: q.timestamp || new Date().toISOString()
      }))
    }))

    return JSON.parse(JSON.stringify(serialized)) // Doble serialización para asegurar
  } catch (error) {
    console.error('Error serializing questions:', error)
    return null
  }
}

// Función para deserializar
const deserializeQuestions = (serialized) => {
  if (!serialized) return null

  try {
    // Reconstruir array de arrays desde datos serializados
    return serialized.map(roundData =>
      roundData.questions.map(q => ({
        ...q,
        // Asegurar que tengamos todos los campos necesarios
        text: q.text || '',
        category: q.category || 'random',
        language: q.language || 'es'
      }))
    )
  } catch (error) {
    console.error('Error deserializing questions:', error)
    return null
  }
}

export function useGameStorage() {
  // Guardar estado del juego
  const saveGameState = async (gameState) => {
    try {
      // Serializar el estado del juego para IndexedDB
      const serializableState = {
        ...gameState,
        // Convertir teams a objetos simples
        teams: gameState.teams ? gameState.teams.map(team => ({
          name: team.name,
          score: team.score,
          color: team.color,
          roundScores: Array.isArray(team.roundScores) ? [...team.roundScores] : []
        })) : []
      }

      await gameStore.setItem('current_game', serializableState)
      console.log('Game state saved successfully')
      return true
    } catch (error) {
      console.error('Error saving game state:', error)
      return false
    }
  }

  // Cargar estado del juego
  const loadGameState = async () => {
    try {
      const gameState = await gameStore.getItem('current_game')

      if (!gameState) return null

      // Reconstruir objetos necesarios
      if (gameState.teams) {
        gameState.teams = gameState.teams.map(team => ({
          ...team,
          // Asegurar que roundScores sea un array válido
          roundScores: Array.isArray(team.roundScores) ? team.roundScores : []
        }))
      }

      return gameState
    } catch (error) {
      console.error('Error loading game state:', error)
      return null
    }
  }

  // Guardar preguntas
  const saveQuestionsToStorage = async (questions) => {
    try {
      // Serializar las preguntas
      const serializedQuestions = serializeQuestions(questions)

      if (!serializedQuestions) {
        throw new Error('Failed to serialize questions')
      }

      // Guardar preguntas actuales
      await questionsStore.setItem('current_questions', serializedQuestions)

      // También guardar en historial (mantener solo últimos 2 juegos)
      const existingGames = await questionsStore.getItem('games_history') || []

      const gameData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        questions: serializedQuestions,
        questionCount: questions.reduce((total, round) => total + round.length, 0)
      }

      // Mantener solo los últimos 2 juegos
      const updatedHistory = [gameData, ...existingGames.slice(0, 1)]
      await questionsStore.setItem('games_history', updatedHistory)

      console.log(`Questions saved: ${gameData.questionCount} total questions`)
      return true
    } catch (error) {
      console.error('Error saving questions:', error)
      return false
    }
  }

  // Cargar preguntas
  const loadQuestionsFromStorage = async () => {
    try {
      // Primero intentar cargar preguntas actuales
      const serializedQuestions = await questionsStore.getItem('current_questions')

      if (serializedQuestions) {
        const questions = deserializeQuestions(serializedQuestions)
        if (questions) {
          console.log(`Loaded ${questions.length} rounds with questions`)
          return questions
        }
      }

      // Si no hay preguntas actuales, intentar del historial
      const history = await questionsStore.getItem('games_history')
      if (history && history.length > 0 && history[0].questions) {
        const questions = deserializeQuestions(history[0].questions)
        if (questions) {
          console.log(`Loaded questions from history: ${questions.length} rounds`)
          return questions
        }
      }

      return null
    } catch (error) {
      console.error('Error loading questions:', error)
      return null
    }
  }

  // Limpiar almacenamiento
  const clearGameState = async () => {
    try {
      await gameStore.removeItem('current_game')
      await questionsStore.removeItem('current_questions')
      console.log('Game state cleared')
      return true
    } catch (error) {
      console.error('Error clearing storage:', error)
      return false
    }
  }

  // Limpiar todo
  const clearAllStorage = async () => {
    try {
      await gameStore.clear()
      await questionsStore.clear()
      console.log('All storage cleared')
      return true
    } catch (error) {
      console.error('Error clearing all storage:', error)
      return false
    }
  }

  // Obtener estadísticas
  const getStorageStats = async () => {
    try {
      const currentGame = await gameStore.getItem('current_game')
      const currentQuestions = await questionsStore.getItem('current_questions')

      let gameSize = 0
      let questionsSize = 0

      if (currentGame) {
        gameSize = new Blob([JSON.stringify(currentGame)]).size
      }

      if (currentQuestions) {
        questionsSize = new Blob([JSON.stringify(currentQuestions)]).size
      }

      return {
        hasCurrentGame: !!currentGame,
        hasCurrentQuestions: !!currentQuestions,
        gameSize: `${(gameSize / 1024).toFixed(2)} KB`,
        questionsSize: `${(questionsSize / 1024).toFixed(2)} KB`,
        totalSize: `${((gameSize + questionsSize) / 1024).toFixed(2)} KB`
      }
    } catch (error) {
      console.error('Error getting storage stats:', error)
      return null
    }
  }

  return {
    saveGameState,
    loadGameState,
    saveQuestionsToStorage,
    loadQuestionsFromStorage,
    clearGameState,
    clearAllStorage,
    getStorageStats
  }
}
