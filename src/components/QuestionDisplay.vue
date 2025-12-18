
<template>
  <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl text-gray-600">
            {{ language === 'es' ? 'Equipo actual:' : 'Current team:' }}
          </h3>
          <div class="flex items-center mt-2">
            <div :class="['w-4 h-4 rounded-full mr-3', currentTeam.color]"></div>
            <span class="text-3xl font-bold text-gray-800">{{ currentTeam.name }}</span>
          </div>
        </div>

        <div class="text-center">
          <div class="text-lg text-gray-600 mb-2">
            {{ language === 'es' ? 'Tiempo restante:' : 'Time remaining:' }}
          </div>
          <div class="relative">
            <div class="text-6xl font-bold pb-4 transition-all duration-300"
              :class="[timerColor, !timerRunning ? 'opacity-30 scale-90' : 'scale-100']">
              {{ internalTimer }}
            </div>
            <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 mt-4">
              {{ language === 'es' ? 'segundos' : 'seconds' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <div class="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-semibold">
        {{ language === 'es' ? 'Categoría:' : 'Category:' }} {{ getCategoryName(currentCategory) }}
      </div>
    </div>

    <div class="mb-10">
      <div
        class="text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-200">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
          {{ currentQuestion }}
        </h2>
      </div>
    </div>

    <div v-if="!timerRunning" class="mb-8 flex justify-center">
      <button @click="startTimer"
        class="group relative inline-flex items-center justify-center px-10 py-6 font-bold text-white transition-all duration-200 bg-orange-500 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-xl hover:bg-orange-600 scale-110">
        <svg class="w-8 h-8 mr-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clip-rule="evenodd" />
        </svg>
        <span class="text-2xl">{{ language === 'es' ? '¡EMPEZAR TIEMPO!' : 'START TIMER!' }}</span>
      </button>
    </div>

    <div v-else class="flex flex-col sm:flex-row gap-4 mb-8">
      <button @click="handleAnswer(true)" type="button"
        class="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-lg transition duration-200 shadow-lg">
        <div class="flex items-center justify-center">
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {{ language === 'es' ? '¡Respuesta Correcta!' : 'Correct Answer!' }}
        </div>
      </button>

      <button @click="handleAnswer(false)" type="button"
        class="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-lg transition duration-200 shadow-lg">
        <div class="flex items-center justify-center">
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          {{ language === 'es' ? 'Sin Respuesta' : 'No Answer' }}
        </div>
      </button>
    </div>

    <div class="text-center pt-4 border-t border-gray-100">
      <button @click="nextQuestion" type="button"
        class="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-md transition duration-200">
        <div class="flex items-center justify-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
          </svg>
          {{ language === 'es' ? 'Saltar / Siguiente' : 'Skip / Next' }}
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { getCategoryName } from '../utils/questionGenerator'

const props = defineProps({
  currentQuestion: String,
  currentTeam: Object,
  language: String,
  categories: Array,
  currentCategory: String
})

const emit = defineEmits(['next-question', 'timer-end', 'update-score'])

// --- CONFIGURACIÓN DE AUDIO ---
const audioStart = new Audio('/sounds/start-timer.mp3')
const audioTick = new Audio('/sounds/tick.mp3')

const playSound = (audio) => {
  audio.currentTime = 0
  audio.play().catch(() => {
    console.warn("Audio play blocked: requires user interaction first.")
  })
}

const internalTimer = ref(5)
const timerRunning = ref(false)
let timerInterval = null

const timerColor = computed(() => {
  if (internalTimer.value > 3) return 'text-green-500'
  if (internalTimer.value > 1) return 'text-yellow-500'
  return 'text-red-500'
})

const startTimer = () => {
  clearInterval(timerInterval)
  internalTimer.value = 5
  timerRunning.value = true

  // 1. Sonido al presionar el botón (Inicio)
  playSound(audioStart)

  timerInterval = setInterval(() => {
    if (internalTimer.value > 0) {
      internalTimer.value--
      // 2. Sonido por cada segundo que baja (Tick)
      playSound(audioTick)
    } else {
      stopTimer()
      emit('timer-end')
    }
  }, 1000)
}

const stopTimer = () => {
  clearInterval(timerInterval)
  timerRunning.value = false
  // Opcional: pausar los ticks si se detiene antes de tiempo
  audioTick.pause()
}

const handleAnswer = (update = false) => {
  timerRunning.value = false
  emit('update-score', update)
  stopTimer()
}

const nextQuestion = () => {
  timerRunning.value = false
  stopTimer()
  internalTimer.value = 5
  emit('next-question')
}

watch(() => props.currentQuestion, () => {
  stopTimer()
  internalTimer.value = 5
})

onUnmounted(() => {
  clearInterval(timerInterval)
  // Limpiar memoria de los audios
  audioStart.pause()
  audioTick.pause()
})
</script>

