
<template>
  <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
    <!-- Información del equipo actual -->
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
        
        <!-- Temporizador -->
        <div class="text-center">
          <div class="text-lg text-gray-600 mb-2">
            {{ language === 'es' ? 'Tiempo restante:' : 'Time remaining:' }}
          </div>
          <div class="relative">
            <div class="text-6xl font-bold pb-4" :class="timerColor">
              {{ internalTimer }}
            </div>
            <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 mt-4">
              {{ language === 'es' ? 'segundos' : 'seconds' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Categoría -->
    <div class="mb-6">
      <div class="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-semibold">
        {{ language === 'es' ? 'Categoría:' : 'Category:' }} {{ getCategoryName(currentCategory) }}
      </div>
    </div>

    <!-- Pregunta -->
    <div class="mb-10">
      <div class="text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-200">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
          {{ currentQuestion }}
        </h2>
      </div>
    </div>

    <!-- Controles del juego -->
    <div class="flex flex-col sm:flex-row gap-4 mb-8">
      <button
        @click="handleAnswer(true)" type="button"
        class="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-lg transition duration-200 shadow-lg"
      >
        <div class="flex items-center justify-center">
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {{ language === 'es' ? '¡Respuesta Correcta!' : 'Correct Answer!' }}
        </div>
      </button>
      
      <button
        @click="handleAnswer(false)" type="button"
        class="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-lg transition duration-200 shadow-lg"
      >
        <div class="flex items-center justify-center">
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          {{ language === 'es' ? 'Sin Respuesta' : 'No Answer' }}
        </div>
      </button>
    </div>

    <!-- Siguiente pregunta -->
    <div class="text-center">
      <button
        @click="nextQuestion"
        class="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl text-lg transition duration-200 shadow-lg"
      >
        <div class="flex items-center justify-center">
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
          </svg>
          {{ language === 'es' ? 'Siguiente Pregunta' : 'Next Question' }}
        </div>
      </button>
    </div>

    <!-- Secciones populares -->
    <div class="mt-12">
      <h3 class="text-2xl font-bold text-gray-800 mb-6">
        {{ language === 'es' ? 'Secciones Populares' : 'Popular Sections' }}
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="[
            'py-4 rounded-xl font-semibold transition duration-200',
            currentCategory === category.id
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          ]"
        >
          {{ language === 'es' ? category.name.es : category.name.en }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getCategoryName } from '../utils/questionGenerator'

const props = defineProps({
  currentQuestion: String,
  currentTeam: Object,
  language: String,
  categories: Array,
  currentCategory: String
})

const emit = defineEmits(['next-question', 'timer-end', 'update-score'])

// Temporizador interno
const internalTimer = ref(5)
let timerInterval = null

// Color del temporizador basado en el tiempo restante
const timerColor = computed(() => {
  if (internalTimer.value > 3) return 'text-green-500'
  if (internalTimer.value > 1) return 'text-yellow-500'
  return 'text-red-500'
})

// Iniciar temporizador
const startTimer = () => {
  clearInterval(timerInterval)
  internalTimer.value = 5
  
  timerInterval = setInterval(() => {
    if (internalTimer.value > 0) {
      internalTimer.value--
    } else {
      clearInterval(timerInterval)
      emit('timer-end')
    }
  }, 1000)
}

// Respuesta
const handleAnswer = (update = false) => {
  emit('update-score', update);
  clearInterval(timerInterval);
  startTimer();
}

// Siguiente pregunta
const nextQuestion = () => {
  clearInterval(timerInterval);
  emit('next-question');
  startTimer();
}

// Seleccionar categoría
const selectCategory = (categoryId) => {
  // En una implementación real, aquí se cambiaría la categoría
  console.log(`Selected category: ${categoryId}`)
}

// Obtener nombre de la categoría
// const getCategoryName = (categoryId) => {
//   const category = props.categories.find(c => c.id === categoryId)
//   if (!category) return ''
//   return props.language === 'es' ? category.name.es : category.name.en
// }

// Observar cambios en el temporizador externo
watch(() => props.timer, (newTimer) => {
   internalTimer.value = newTimer
})

// Iniciar temporizador al montar
onMounted(() => {
  startTimer()
})

// Limpiar intervalo al desmontar
onUnmounted(() => {
  clearInterval(timerInterval)
})
</script>