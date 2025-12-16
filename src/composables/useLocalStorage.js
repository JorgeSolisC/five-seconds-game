import { ref, watch } from 'vue'

export function useLocalStorage(key, initialValue = null) {
  // Leer del localStorage al inicializar
  const storedValue = localStorage.getItem(key)
  const data = ref(storedValue ? JSON.parse(storedValue) : initialValue)

  // Función para guardar en localStorage
  const saveToStorage = (value) => {
    try {
      const valueToStore = JSON.stringify(value)
      localStorage.setItem(key, valueToStore)
      data.value = value
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  // Función para cargar desde localStorage
  const loadFromStorage = () => {
    try {
      const storedValue = localStorage.getItem(key)
      if (storedValue) {
        data.value = JSON.parse(storedValue)
        return data.value
      }
      return initialValue
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return initialValue
    }
  }

  // Función para limpiar localStorage
  const clearStorage = () => {
    try {
      localStorage.removeItem(key)
      data.value = initialValue
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  // Observar cambios en los datos y guardar automáticamente
  watch(data, (newValue) => {
    saveToStorage(newValue)
  }, { deep: true })

  return {
    data,
    saveToStorage,
    loadFromStorage,
    clearStorage
  }
}