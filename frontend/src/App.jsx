import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Loader2, Send, FileText, User, Bot, AlertCircle, Building2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans text-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Plan de Desarrollo Estatal
          </h1>
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            Asistente de Consulta
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Consulte información sobre políticas públicas, programas gubernamentales, objetivos estratégicos y metas del plan de desarrollo
          </p>
        </header>

        <Card className="shadow-lg border border-slate-200 bg-white rounded-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <Bot className="h-5 w-5 text-blue-600" /> Consulta de Información
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[500px] p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'bot' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-slate-50 border border-slate-200 text-slate-800'
                    }`}>
                      <ReactMarkdown className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </ReactMarkdown>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-opacity-20 border-current">
                        <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                        {message.passagesUsed && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {message.passagesUsed} referencias
                          </Badge>
                        )}
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-slate-600">Consultando información...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <div className="border-t border-slate-200 p-4 bg-slate-50 flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escriba su consulta sobre el plan de desarrollo..."
              className="flex-1 border-slate-300 focus:border-blue-500 bg-white"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>

        <footer className="text-center mt-6 text-xs text-slate-500">
          Sistema de Consulta del Plan de Desarrollo Estatal • Gobierno del Estado
        </footer>
      </div>
    </div>
  )
}

export default App