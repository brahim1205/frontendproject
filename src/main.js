import './style.css'
import { AuthManager } from './auth/AuthManager.js'
import { ChatManager } from './chat/ChatManager.js'
import { ApiService } from './services/ApiService.js'
import { Utils } from './utils/Utils.js'

class WhatsAppClone {
  constructor() {
    this.app = document.getElementById('app')
    this.authManager = new AuthManager()
    this.chatManager = new ChatManager()
    this.apiService = new ApiService()
    this.currentUser = null
    
    this.init()
  }

  async init() {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('whatsapp_user')
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser)
      await this.showChatInterface()
    } else {
      this.showLoginPage()
    }
  }

  showLoginPage() {
    this.app.innerHTML = this.authManager.renderLoginPage()
    this.authManager.bindLoginEvents(this.handleLogin.bind(this))
  }

  async handleLogin(phoneNumber, username) {
    try {
      // Créer ou récupérer l'utilisateur
      let user = await this.apiService.getUserByPhone(phoneNumber)
      
      if (!user) {
        user = await this.apiService.createUser({
          phoneNumber,
          username,
          lastSeen: new Date().toISOString(),
          isOnline: true
        })
      } else {
        // Mettre à jour le statut en ligne
        await this.apiService.updateUser(user.id, {
          isOnline: true,
          lastSeen: new Date().toISOString()
        })
      }
      
      this.currentUser = user
      localStorage.setItem('whatsapp_user', JSON.stringify(user))
      
      await this.showChatInterface()
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      this.showConnectionError()
    }
  }

  showConnectionError() {
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        <span>Erreur de connexion. Vérifiez que le serveur est démarré.</span>
      </div>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 5000)
  }

  async showChatInterface() {
    this.app.innerHTML = this.chatManager.renderChatInterface()
    await this.chatManager.init(this.currentUser, this.apiService)
    
    // Démarrer la synchronisation en temps réel
    this.startRealTimeSync()
  }

  startRealTimeSync() {
    // Synchronisation des messages toutes les 2 secondes
    setInterval(async () => {
      if (this.chatManager.activeChat) {
        await this.chatManager.loadMessages(this.chatManager.activeChat.id)
      }
      await this.chatManager.loadContacts()
    }, 2000)
    
    // Mettre à jour le statut en ligne toutes les 30 secondes
    setInterval(async () => {
      if (this.currentUser) {
        await this.apiService.updateUser(this.currentUser.id, {
          lastSeen: new Date().toISOString()
        })
      }
    }, 30000)
  }
}

// Démarrer l'application
new WhatsAppClone()