<template>
  <div class="bg-white rounded-2xl shadow-2xl p-6 h-full">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">
      {{ language === 'es' ? 'Marcador' : 'Scoreboard' }}
    </h2>
    
    <div class="space-y-4">
      <div
        v-for="(team, index) in teams"
        :key="index"
        :class="[
          'p-4 rounded-xl border-2 transition duration-200',
          index === currentTeamIndex
            ? 'border-blue-500 bg-blue-50 transform scale-105'
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div :class="['w-4 h-4 rounded-full mr-3', team.color]"></div>
            <div>
              <h3 class="font-bold text-lg text-gray-800">{{ team.name }}</h3>
              <div v-if="index === currentTeamIndex" class="text-sm text-blue-600 font-semibold">
                {{ language === 'es' ? '¡Turno actual!' : 'Current turn!' }}
              </div>
            </div>
          </div>
          
          <div class="flex items-center">
            <div class="text-3xl font-bold text-gray-800 mr-4">{{ team.score }}</div>
            <div class="flex space-x-2">
              <button
                @click="addPoint(index)"
                class="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-700 rounded-full flex items-center justify-center transition duration-200"
                :title="language === 'es' ? 'Añadir punto' : 'Add point'"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </button>
              <button
                @click="removePoint(index)"
                class="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-700 rounded-full flex items-center justify-center transition duration-200"
                :title="language === 'es' ? 'Quitar punto' : 'Remove point'"
                :disabled="team.score <= 0"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Barra de progreso -->
        <div class="mt-4">
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              :class="['h-full transition-all duration-500', team.color.replace('bg-', 'bg-')]" 
              :style="{ width: calculateScorePercentage(team.score) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          <h4 class="font-semibold text-gray-700">
            {{ language === 'es' ? 'Puntuación total' : 'Total score' }}
          </h4>
          <div class="text-2xl font-bold text-gray-800">{{ totalScore }}</div>
        </div>
        
        <div v-if="winningTeam" class="text-right">
          <div class="text-sm text-gray-600">
            {{ language === 'es' ? 'Equipo líder:' : 'Leading team:' }}
          </div>
          <div class="flex items-center justify-end mt-1">
            <div :class="['w-3 h-3 rounded-full mr-2', winningTeam.color]"></div>
            <span class="font-bold text-gray-800">{{ winningTeam.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="mt-6 grid grid-cols-2 gap-4">
      <div class="bg-gray-50 p-4 rounded-xl">
        <div class="text-sm text-gray-600">
          {{ language === 'es' ? 'Ronda actual' : 'Current round' }}
        </div>
        <div class="text-xl font-bold text-gray-800">{{ currentRound }}</div>
      </div>
      <div class="bg-gray-50 p-4 rounded-xl">
        <div class="text-sm text-gray-600">
          {{ language === 'es' ? 'Preguntas totales' : 'Total questions' }}
        </div>
        <div class="text-xl font-bold text-gray-800">{{ totalQuestions }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  teams: Array,
  currentTeamIndex: Number,
  language: String
})

const emit = defineEmits(['update-score'])

// Estadísticas
const totalQuestions = ref(0)
const currentRound = ref(1)

// Calcular porcentaje de puntuación
const calculateScorePercentage = (score) => {
  const maxScore = Math.max(...props.teams.map(t => t.score))
  if (maxScore === 0) return 0
  return (score / maxScore) * 100
}

// Puntuación total
const totalScore = computed(() => {
  return props.teams.reduce((sum, team) => sum + team.score, 0)
})

// Equipo ganador
const winningTeam = computed(() => {
  if (props.teams.length === 0) return null
  
  let maxScore = -1
  let winningTeam = null
  
  props.teams.forEach(team => {
    if (team.score > maxScore) {
      maxScore = team.score
      winningTeam = team
    }
  })
  
  return winningTeam
})

// Añadir punto
const addPoint = (teamIndex) => {
  totalQuestions.value++
  emit('update-score', teamIndex, true)
}

// Quitar punto
const removePoint = (teamIndex) => {
  if (props.teams[teamIndex].score > 0) {
    totalQuestions.value++
    emit('update-score', teamIndex, false)
  }
}

// Actualizar ronda
watch(() => props.currentTeamIndex, (newIndex, oldIndex) => {
  if (newIndex === 0 && oldIndex === props.teams.length - 1) {
    currentRound.value++
  }
})
</script>