import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Loader2, Send, FileText, User, Bot, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown';
import logo from '../dist/assets/footer.png'
import MorelosLogo from '../dist/assets/Morelos.svg'
import ATDLogo from '../dist/assets/ATD-removebg-preview.png'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Bienvenido al Asistente de Consulta del Plan de Desarrollo Estatal. Estoy aquí para ayudarte a encontrar información específica sobre políticas, programas, objetivos y estrategias del plan. ¿En qué puedo asistirte hoy?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/status')
      const status = await response.json()
      setSystemStatus(status)

      if (!status.embeddings_model_loaded || !status.chain_loaded) {
        await initializeSystem()
      }
    } catch (error) {
      console.error('Error checking system status:', error)
    }
  }

  const initializeSystem = async () => {
    try {
      const response = await fetch('/api/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        await checkSystemStatus()
      }
    } catch (error) {
      console.error('Error initializing system:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content, top_k: 10 })
      })

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`)

      const data = await response.json()

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        passagesUsed: data.passages_used
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Disculpe, he tenido un problema técnico. Por favor, verifique que el sistema esté configurado correctamente.',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <nav className="w-full bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={MorelosLogo} alt="Morelos" className="h-10 w-auto" />
            <div>
              <div className="text-lg font-semibold text-gray-900">Plan de Desarrollo Estatal</div>
              <div className="text-sm text-gray-600">Asistente de Consulta</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-700 hover:underline">Inicio</a>
            <a href="/tramites" className="text-sm text-gray-700 hover:underline">Trámites y servicios</a>
            <a href="/noticias" className="text-sm text-gray-700 hover:underline">Noticias</a>
            <a href="/contacto" className="text-sm text-gray-700 hover:underline">Contacto</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="text-center mb-4">
          <h2 className="text-lg font-medium text-gray-700 mb-1">Consulta rápida sobre el Plan</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">Consulte información sobre políticas públicas, programas gubernamentales, objetivos estratégicos y metas del plan de desarrollo</p>
        </header>

        <Card className="shadow-lg border border-gray-200 bg-white rounded-lg">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <Bot className="h-5 w-5 text-gray-600" /> Consulta de Información
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[500px] p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'bot' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                          <img src={ATDLogo} alt="ATD" className="w-7 h-7 object-cover" />
                        </div>
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-lg px-4 py-3 ${message.type === 'user'
                      ? 'bg-gray-800 text-white'
                      : message.isError
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-gray-50 border border-gray-200 text-gray-800'
                      }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-opacity-20 border-current">
                        <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                        {message.passagesUsed && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                            {message.passagesUsed} referencias
                          </Badge>
                        )}
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">Consultando información...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escriba su consulta sobre el plan de desarrollo..."
              className="flex-1 border-gray-300 focus:border-gray-500 bg-white"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>

        <footer className="border-t mt-8 relative" role="contentinfo" aria-label="Pie de página">
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <img
              src={logo}
              alt="Gobierno del Estado"
              className="w-full h-auto block"
              loading="lazy"
            />
          </div>
          <div className="mx-auto max-w-7xl px-4 py-4 text-center">
            <p className="text-xs text-gray-500">
              Sistema de Consulta del Plan de Desarrollo Estatal • Gobierno del Estado
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App