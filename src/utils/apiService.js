// Servicio para llamadas API reales a servicios de IA gratuitos
// IMPORTANTE: Necesitarás registrarte en estos servicios para obtener API keys

// Ejemplo con OpenAI (versión gratuita limitada)
export async function generateQuestionWithOpenAI(category, language) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found')
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a fun game master creating questions for a 5-second game.'
          },
          {
            role: 'user',
            content: `Create a fun, quick question about ${category} in ${language}. The question should be answerable in 5 seconds.`
          }
        ],
        max_tokens: 60,
        temperature: 0.8
      })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

// Alternativa: Hugging Face Inference API (más gratuita)
export async function generateQuestionWithHuggingFace(category, language) {
  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY
  
  if (!apiKey) {
    throw new Error('Hugging Face API key not found')
  }
  
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Create a fun 5-second game question about ${category} in ${language}:`,
          parameters: {
            max_length: 50,
            temperature: 0.9
          }
        })
      }
    )
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data[0]?.generated_text || null
  } catch (error) {
    console.error('Hugging Face API error:', error)
    throw error
  }
}

// API gratuita alternativa: TextCortex
export async function generateQuestionWithTextCortex(category, language) {
  const apiKey = import.meta.env.VITE_TEXTCORTEX_API_KEY
  
  if (!apiKey) {
    throw new Error('TextCortex API key not found')
  }
  
  try {
    const response = await fetch('https://api.textcortex.com/v1/texts/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        max_tokens: 60,
        model: 'gpt-3.5-turbo',
        n: 1,
        temperature: 0.8,
        text: `Create a fun 5-second game question about ${category} in ${language}`
      })
    })
    
    if (!response.ok) {
      throw new Error(`TextCortex API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data?.outputs[0]?.text || null
  } catch (error) {
    console.error('TextCortex API error:', error)
    throw error
  }
}