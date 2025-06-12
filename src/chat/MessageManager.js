export class MessageManager {
  constructor() {
    this.currentChat = null
    this.currentUser = null
    this.apiService = null
    this.messages = []
    this.messageUpdateInterval = null
  }

  showChatInterface(chat, currentUser, apiService) {
    this.currentChat = chat
    this.currentUser = currentUser
    this.apiService = apiService
    
    const mainChatArea = document.getElementById('mainChatArea')
    const welcomeScreen = document.getElementById('welcomeScreen')
    
    if (welcomeScreen) {
      welcomeScreen.style.display = 'none'
    }
    
    mainChatArea.innerHTML = `
      <!-- Chat Header -->
      <div class="bg-white border-b border-gray-200 p-4 flex items-center">
        <button class="md:hidden mr-3 text-gray-600" id="backToSidebar">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="w-10 h-10 ${chat.type === 'group' ? 'bg-blue-500' : 'bg-whatsapp-green'} rounded-full flex items-center justify-center mr-3">
          ${chat.type === 'group' 
            ? '<i class="fas fa-users text-white"></i>' 
            : `<span class="text-white font-medium">${chat.name.charAt(0).toUpperCase()}</span>`
          }
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">${chat.name}</h3>
          <p class="text-sm text-gray-500" id="chatStatus">
            ${chat.type === 'group' 
              ? `${chat.members.length} membres` 
              : (chat.isOnline ? 'En ligne' : 'Hors ligne')
            }
          </p>
        </div>
        <div class="flex space-x-2">
          <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <i class="fas fa-video"></i>
          </button>
          <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <i class="fas fa-phone"></i>
          </button>
          <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      
      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-2" id="messagesContainer" style="background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23f0f0f0"><circle cx="20" cy="20" r="2"/><circle cx="80" cy="20" r="2"/><circle cx="20" cy="80" r="2"/><circle cx="80" cy="80" r="2"/></svg>'); background-size: 50px 50px;">
        <!-- Messages will be loaded here -->
      </div>
      
      <!-- Message Input -->
      <div class="bg-white border-t border-gray-200 p-4">
        <div class="flex items-center space-x-2">
          <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-full" id="attachBtn">
            <i class="fas fa-paperclip"></i>
          </button>
          <div class="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input 
              type="text" 
              placeholder="Tapez votre message..."
              class="flex-1 bg-transparent outline-none"
              id="messageInput"
            >
            <button class="p-1 text-gray-600 hover:text-gray-800" id="emojiBtn">
              <i class="far fa-smile"></i>
            </button>
          </div>
          <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-full" id="micBtn">
            <i class="fas fa-microphone"></i>
          </button>
          <button class="p-2 bg-whatsapp-green text-white rounded-full hover:bg-whatsapp-green-dark" id="sendBtn">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        
        <!-- Attachment Options -->
        <div class="hidden mt-2 p-3 bg-gray-50 rounded-lg" id="attachmentOptions">
          <div class="grid grid-cols-3 gap-3">
            <button class="flex flex-col items-center p-3 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors" id="attachDocument">
              <i class="fas fa-file text-purple-600 mb-1"></i>
              <span class="text-xs text-purple-600">Document</span>
            </button>
            <button class="flex flex-col items-center p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors" id="attachPhoto">
              <i class="fas fa-camera text-blue-600 mb-1"></i>
              <span class="text-xs text-blue-600">Photo</span>
            </button>
            <button class="flex flex-col items-center p-3 bg-green-100 rounded-lg hover:bg-green-200 transition-colors" id="attachAudio">
              <i class="fas fa-music text-green-600 mb-1"></i>
              <span class="text-xs text-green-600">Audio</span>
            </button>
          </div>
        </div>
      </div>
    `
    
    this.bindMessageEvents()
    this.loadMessages()
    this.startMessageSync()
  }

  bindMessageEvents() {
    // Back to sidebar (mobile)
    const backBtn = document.getElementById('backToSidebar')
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open')
      })
    }
    
    // Send message
    const sendBtn = document.getElementById('sendBtn')
    const messageInput = document.getElementById('messageInput')
    
    const sendMessage = async () => {
      const text = messageInput.value.trim()
      if (!text) return
      
      await this.sendTextMessage(text)
      messageInput.value = ''
    }
    
    sendBtn.addEventListener('click', sendMessage)
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage()
      }
    })
    
    // Attachment options
    const attachBtn = document.getElementById('attachBtn')
    const attachmentOptions = document.getElementById('attachmentOptions')
    
    attachBtn.addEventListener('click', () => {
      attachmentOptions.classList.toggle('hidden')
    })
    
    // File attachments
    document.getElementById('attachDocument').addEventListener('click', () => {
      this.handleFileAttachment('document')
    })
    
    document.getElementById('attachPhoto').addEventListener('click', () => {
      this.handleFileAttachment('image')
    })
    
    document.getElementById('attachAudio').addEventListener('click', () => {
      this.handleFileAttachment('audio')
    })
    
    // Emoji button
    document.getElementById('emojiBtn').addEventListener('click', () => {
      // Simple emoji picker
      const emojis = ['😀', '😂', '😍', '🥰', '😊', '👍', '❤️', '🎉', '🔥', '💯']
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      messageInput.value += randomEmoji
    })
    
    // Voice message
    document.getElementById('micBtn').addEventListener('click', () => {
      this.handleVoiceMessage()
    })
  }

  async loadMessages() {
    try {
      const chatId = this.getChatId()
      this.messages = await this.apiService.getMessagesByChat(chatId)
      this.renderMessages()
      this.scrollToBottom()
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  renderMessages() {
    const container = document.getElementById('messagesContainer')
    
    if (this.messages.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-comments text-4xl mb-2"></i>
          <p>Aucun message pour le moment</p>
          <p class="text-sm">Envoyez votre premier message !</p>
        </div>
      `
      return
    }
    
    container.innerHTML = this.messages.map(message => this.renderMessage(message)).join('')
  }

  renderMessage(message) {
    const isOwn = message.senderId === this.currentUser.id
    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    return `
      <div class="flex ${isOwn ? 'justify-end' : 'justify-start'} message-bubble">
        <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-whatsapp-green text-white' 
            : 'bg-white text-gray-800 shadow-sm'
        }">
          ${!isOwn && this.currentChat.type === 'group' ? `
            <p class="text-xs font-medium text-blue-600 mb-1">${message.senderName}</p>
          ` : ''}
          
          ${this.renderMessageContent(message)}
          
          <div class="flex items-center justify-end mt-1 space-x-1">
            <span class="text-xs opacity-75">${time}</span>
            ${isOwn ? this.renderMessageStatus(message.status) : ''}
          </div>
        </div>
      </div>
    `
  }

  renderMessageContent(message) {
    switch (message.type) {
      case 'text':
        return `<p class="text-sm">${message.content}</p>`
      
      case 'image':
        return `
          <div class="mb-2">
            <img src="${message.content}" alt="Image" class="max-w-full rounded-lg cursor-pointer" onclick="this.requestFullscreen()">
          </div>
        `
      
      case 'audio':
        return `
          <div class="flex items-center space-x-2 py-2">
            <button class="play-audio-btn p-2 bg-white bg-opacity-20 rounded-full">
              <i class="fas fa-play text-sm"></i>
            </button>
            <div class="flex-1 h-8 bg-white bg-opacity-20 rounded-full flex items-center px-2">
              <div class="w-full h-1 bg-white bg-opacity-40 rounded-full">
                <div class="h-1 bg-white rounded-full" style="width: 0%"></div>
              </div>
            </div>
            <span class="text-xs">0:00</span>
          </div>
        `
      
      case 'document':
        return `
          <div class="flex items-center space-x-3 py-2">
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <i class="fas fa-file text-lg"></i>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">${message.fileName || 'Document'}</p>
              <p class="text-xs opacity-75">${message.fileSize || 'Taille inconnue'}</p>
            </div>
          </div>
        `
      
      default:
        return `<p class="text-sm">${message.content}</p>`
    }
  }

  renderMessageStatus(status) {
    switch (status) {
      case 'sent':
        return '<i class="fas fa-check text-xs message-status-sent"></i>'
      case 'delivered':
        return '<i class="fas fa-check-double text-xs message-status-delivered"></i>'
      case 'read':
        return '<i class="fas fa-check-double text-xs message-status-read"></i>'
      default:
        return '<i class="fas fa-clock text-xs text-gray-400"></i>'
    }
  }

  async sendTextMessage(text) {
    const message = {
      chatId: this.getChatId(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.username,
      type: 'text',
      content: text,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    
    try {
      await this.apiService.createMessage(message)
      await this.loadMessages()
      
      // Simuler la livraison du message
      setTimeout(async () => {
        await this.updateMessageStatus(message, 'delivered')
      }, 1000)
      
      // Simuler la lecture si le destinataire est en ligne
      if (this.currentChat.isOnline && this.currentChat.type === 'contact') {
        setTimeout(async () => {
          await this.updateMessageStatus(message, 'read')
        }, 3000)
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      this.showMessageNotification('Erreur lors de l\'envoi du message')
    }
  }

  async updateMessageStatus(message, status) {
    try {
      // Dans une vraie application, on utiliserait l'ID du message
      // Ici on simule en mettant à jour tous les messages récents de l'utilisateur
      const recentMessages = await this.apiService.getRecentMessagesByUser(this.currentUser.id)
      for (const msg of recentMessages) {
        if (msg.status !== 'read') {
          await this.apiService.updateMessage(msg.id, { status })
        }
      }
      await this.loadMessages()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  handleFileAttachment(type) {
    const input = document.createElement('input')
    input.type = 'file'
    
    switch (type) {
      case 'image':
        input.accept = 'image/*'
        break
      case 'audio':
        input.accept = 'audio/*'
        break
      case 'document':
        input.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx'
        break
    }
    
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      // Simuler l'upload du fichier
      const fileUrl = URL.createObjectURL(file)
      
      const message = {
        chatId: this.getChatId(),
        senderId: this.currentUser.id,
        senderName: this.currentUser.username,
        type: type === 'document' ? 'document' : type,
        content: fileUrl,
        fileName: file.name,
        fileSize: this.formatFileSize(file.size),
        timestamp: new Date().toISOString(),
        status: 'sent'
      }
      
      try {
        await this.apiService.createMessage(message)
        await this.loadMessages()
        document.getElementById('attachmentOptions').classList.add('hidden')
      } catch (error) {
        console.error('Erreur lors de l\'envoi du fichier:', error)
        this.showMessageNotification('Erreur lors de l\'envoi du fichier')
      }
    })
    
    input.click()
  }

  handleVoiceMessage() {
    // Simuler l'enregistrement vocal
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.showMessageNotification('L\'enregistrement vocal n\'est pas supporté sur ce navigateur')
      return
    }
    
    const micBtn = document.getElementById('micBtn')
    const isRecording = micBtn.classList.contains('recording')
    
    if (!isRecording) {
      // Commencer l'enregistrement
      micBtn.classList.add('recording', 'text-red-500')
      micBtn.innerHTML = '<i class="fas fa-stop"></i>'
      
      // Simuler l'enregistrement pendant 3 secondes
      setTimeout(() => {
        micBtn.classList.remove('recording', 'text-red-500')
        micBtn.innerHTML = '<i class="fas fa-microphone"></i>'
        
        // Créer un message audio simulé
        this.sendVoiceMessage()
      }, 3000)
    }
  }

  async sendVoiceMessage() {
    const message = {
      chatId: this.getChatId(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.username,
      type: 'audio',
      content: 'data:audio/wav;base64,simulated-audio-data',
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    
    try {
      await this.apiService.createMessage(message)
      await this.loadMessages()
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message vocal:', error)
      this.showMessageNotification('Erreur lors de l\'envoi du message vocal')
    }
  }

  showMessageNotification(message) {
    // Créer une notification temporaire dans l'interface de chat
    const container = document.getElementById('messagesContainer')
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    notification.textContent = message
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)
  }

  getChatId() {
    if (this.currentChat.type === 'group') {
      return `group_${this.currentChat.id}`
    } else {
      // Pour les contacts, créer un ID unique basé sur les deux utilisateurs
      const ids = [this.currentUser.id, this.currentChat.contactUserId].sort()
      return `contact_${ids[0]}_${ids[1]}`
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  scrollToBottom() {
    const container = document.getElementById('messagesContainer')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }

  startMessageSync() {
    // Arrêter la synchronisation précédente si elle existe
    if (this.messageUpdateInterval) {
      clearInterval(this.messageUpdateInterval)
    }
    
    // Synchroniser les messages toutes les 2 secondes
    this.messageUpdateInterval = setInterval(() => {
      this.loadMessages()
    }, 2000)
  }

  stopMessageSync() {
    if (this.messageUpdateInterval) {
      clearInterval(this.messageUpdateInterval)
      this.messageUpdateInterval = null
    }
  }
}