<template>
  <div class="bg-white rounded-2xl shadow-2xl p-8">
    <!-- Encabezado -->
    <div class="text-center mb-10">
      <h2 class="text-4xl font-bold text-gray-800 mb-4">
        {{ language === 'es' ? '¡Fin del Juego!' : 'Game Over!' }}
      </h2>
      <div
        class="inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-bold text-xl">
        {{ language === 'es' ? 'Resultados Finales' : 'Final Results' }}
      </div>
    </div>

    <!-- Ganador -->
    <div class="mb-10 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
      <div class="flex flex-col md:flex-row items-center justify-between">
        <div class="mb-4 md:mb-0">
          <div class="text-yellow-600 font-semibold mb-2">
            {{ language === 'es' ? '🏆 GANADOR' : '🏆 WINNER' }}
          </div>
          <h3 class="text-3xl font-bold text-gray-800">{{ winningTeam.name }}</h3>
          <div class="flex items-center mt-2">
            <div class="text-4xl font-bold text-yellow-600 mr-3">{{ winningTeam.score }}</div>
            <span class="text-gray-600">
              {{ language === 'es' ? 'puntos totales' : 'total points' }}
            </span>
          </div>
        </div>
        <div class="text-center">
          <div class="text-6xl">🏆</div>
          <div class="text-lg font-semibold text-yellow-700 mt-2">
            {{ language === 'es' ? '¡Felicidades!' : 'Congratulations!' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de posiciones -->
    <div class="mb-10">
      <h3 class="text-2xl font-bold text-gray-800 mb-6">
        {{ language === 'es' ? 'Tabla de Posiciones' : 'Leaderboard' }}
      </h3>
      <div class="space-y-4">
        <div v-for="(team, index) in sortedTeams" :key="team.name" :class="[
          'p-4 rounded-xl border-2 transition-all duration-300',
          index === 0
            ? 'border-yellow-300 bg-yellow-50 transform scale-[1.02]'
            : index === 1
              ? 'border-gray-300 bg-gray-50'
              : index === 2
                ? 'border-amber-200 bg-amber-50'
                : 'border-gray-200 hover:border-gray-300'
        ]">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 mr-4">
                <div v-if="index === 0"
                  class="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <div v-else-if="index === 1"
                  class="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <div v-else-if="index === 2"
                  class="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <div v-else
                  class="w-10 h-10 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-xl font-bold">
                  {{ index + 1 }}
                </div>
              </div>
              <div>
                <h4 class="font-bold text-gray-800 text-lg">{{ team.name }}</h4>
                <div class="flex items-center mt-1">
                  <div
                    :class="['w-3 h-3 rounded-full mr-2', team.color.replace('bg-gradient-to-r ', 'bg-').split('-')[0]]">
                  </div>
                  <span class="text-gray-600 text-sm">
                    {{ language === 'es' ? 'Puntuación:' : 'Score:' }}
                    <span class="font-semibold">{{ team.score }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-800">{{ team.score }}</div>
              <div class="text-sm text-gray-500">
                {{ language === 'es' ? 'puntos' : 'points' }}
              </div>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="mt-4">
            <div class="flex justify-between text-sm text-gray-600 mb-1">
              <span>0</span>
              <span>{{ maxScore }}</span>
            </div>
            <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div :class="[team.color.replace('bg-gradient-to-r', 'bg-green-400')]"
                class="h-full transition-all duration-1000" :style="{ width: `${(team.score / maxScore) * 100}%` }">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas del juego -->
    <div class="mb-10">
      <h3 class="text-2xl font-bold text-gray-800 mb-6">
        {{ language === 'es' ? 'Estadísticas del Juego' : 'Game Statistics' }}
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-xl text-center">
          <div class="text-3xl font-bold text-blue-600">{{ totalRounds }}</div>
          <div class="text-gray-700">
            {{ language === 'es' ? 'Rondas' : 'Rounds' }}
          </div>
        </div>
        <div class="bg-green-50 p-4 rounded-xl text-center">
          <div class="text-3xl font-bold text-green-600">{{ totalQuestions }}</div>
          <div class="text-gray-700">
            {{ language === 'es' ? 'Preguntas' : 'Questions' }}
          </div>
        </div>
        <div class="bg-purple-50 p-4 rounded-xl text-center">
          <div class="text-3xl font-bold text-purple-600">{{ teams.length }}</div>
          <div class="text-gray-700">
            {{ language === 'es' ? 'Equipos' : 'Teams' }}
          </div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-xl text-center">
          <div class="text-3xl font-bold text-yellow-600">{{ totalPoints }}</div>
          <div class="text-gray-700">
            {{ language === 'es' ? 'Puntos Totales' : 'Total Points' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="flex flex-col sm:flex-row gap-4">
      <button @click="playAgain"
        class="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl text-lg transition duration-300 shadow-lg">
        <div class="flex items-center justify-center">
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
            </path>
          </svg>
          {{ language === 'es' ? 'Jugar Otra Vez' : 'Play Again' }}
        </div>
      </button>
      <button @click="newGame"
        class="flex-1 py-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold rounded-xl text-lg transition duration-300 shadow-lg">
        <div class="flex items-center justify-center">
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          {{ language === 'es' ? 'Nuevo Juego' : 'New Game' }}
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  teams: Array,
  language: String,
  totalRounds: Number,
  questionsPerRound: Number
})

const emit = defineEmits(['play-again', 'new-game'])

// Calcular estadísticas
const sortedTeams = computed(() => {
  return [...props.teams].sort((a, b) => b.score - a.score)
})

const winningTeam = computed(() => {
  return sortedTeams.value[0] || { name: '', score: 0 }
})

const maxScore = computed(() => {
  return Math.max(...props.teams.map(team => team.score))
})

const totalQuestions = computed(() => {
  return props.totalRounds * props.questionsPerRound
})

const totalPoints = computed(() => {
  return props.teams.reduce((sum, team) => sum + team.score, 0)
})

// Acciones
const playAgain = () => {
  emit('play-again')
}

const newGame = () => {
  emit('new-game')
}
</script>
