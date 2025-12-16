<template>
  <div class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-800 mb-4">
        {{ language === 'es' ? 'Configuración del Juego' : 'Game Setup' }}
      </h2>
      
      <!-- Selección de idioma -->
      <div class="mb-8">
        <label class="block text-gray-700 font-semibold mb-3">
          {{ language === 'es' ? 'Selecciona el idioma:' : 'Select language:' }}
        </label>
        <div class="flex space-x-4">
          <button
            @click="setLanguage('es')"
            :class="[
              'px-6 py-3 rounded-lg font-semibold transition duration-200',
              selectedLanguage === 'es' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Español
          </button>
          <button
            @click="setLanguage('en')"
            :class="[
              'px-6 py-3 rounded-lg font-semibold transition duration-200',
              selectedLanguage === 'en' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            English
          </button>
        </div>
      </div>

      <!-- Número de equipos -->
      <div class="mb-8">
        <label class="block text-gray-700 font-semibold mb-3">
          {{ selectedLanguage === 'es' 
             ? 'Número de equipos (2-8):' 
             : 'Number of teams (2-8):' }}
        </label>
        <div class="flex items-center space-x-4">
          <button 
            @click="decreaseTeamCount"
            class="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full text-2xl font-bold text-gray-700"
            :disabled="teamCount <= 2"
          >
            -
          </button>
          <span class="text-3xl font-bold text-gray-800 w-12 text-center">{{ teamCount }}</span>
          <button 
            @click="increaseTeamCount"
            class="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full text-2xl font-bold text-gray-700"
            :disabled="teamCount >= 8"
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="index in teamCount" :key="index" class="mb-4">
            <label class="block text-gray-600 mb-2">
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

      <!-- Botón para iniciar -->
      <button
        @click="startGame"
        :disabled="!canStart"
        :class="[
          'w-full py-4 rounded-xl font-bold text-lg transition duration-300',
          canStart
            ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg transform hover:scale-[1.02]'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        ]"
      >
        {{ selectedLanguage === 'es' ? '¡Comenzar Juego!' : 'Start Game!' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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

// Observar cambios en el idioma del padre
watch(() => props.language, (newLang) => {
  selectedLanguage.value = newLang
})

// Configurar nombres iniciales de equipos
const initializeTeamNames = () => {
  teamNames.value = Array.from({ length: teamCount.value }, (_, i) => 
    selectedLanguage.value === 'es' 
      ? `Equipo ${i + 1}` 
      : `Team ${i + 1}`
  )
}

// Aumentar número de equipos
const increaseTeamCount = () => {
  if (teamCount.value < 8) {
    teamCount.value++
    initializeTeamNames()
  }
}

// Disminuir número de equipos
const decreaseTeamCount = () => {
  if (teamCount.value > 2) {
    teamCount.value--
    initializeTeamNames()
  }
}

// Establecer idioma
const setLanguage = (lang) => {
  selectedLanguage.value = lang
  emit('update-language', lang)
  initializeTeamNames()
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
  return teamNames.value.every(name => name.trim() !== '') && 
         new Set(teamNames.value.map(name => name.trim().toLowerCase())).size === teamNames.value.length
})

// Iniciar el juego
const startGame = () => {
  if (validateTeamNames()) {
    emit('start-game', {
      language: selectedLanguage.value,
      teams: teamNames.value.map(name => name.trim())
    })
  }
}

// Inicializar nombres al cargar
initializeTeamNames()
</script>