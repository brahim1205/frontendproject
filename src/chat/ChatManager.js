import { ContactManager } from './ContactManager.js'
import { MessageManager } from './MessageManager.js'
import { GroupManager } from './GroupManager.js'

export class ChatManager {
  constructor() {
    this.contactManager = new ContactManager()
    this.messageManager = new MessageManager()
    this.groupManager = new GroupManager()
    this.currentUser = null
    this.apiService = null
    this.activeChat = null
    this.contacts = []
    this.groups = []
  }

  async init(currentUser, apiService) {
    this.currentUser = currentUser
    this.apiService = apiService
    
    await this.loadContacts()
    await this.loadGroups()
    this.bindEvents()
  }

  renderChatInterface() {
    return `
      <div class="h-screen flex bg-gray-100">
        <!-- Sidebar -->
        <div class="w-full md:w-1/3 bg-white border-r border-gray-200 sidebar" id="sidebar">
          <!-- Header -->
          <div class="bg-whatsapp-teal text-white p-4 flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-user text-white"></i>
              </div>
              <div>
                <h3 class="font-medium" id="userProfileName"></h3>
                <p class="text-sm opacity-75">En ligne</p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button class="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors" id="addContactBtn">
                <i class="fas fa-user-plus"></i>
              </button>
              <button class="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors" id="createGroupBtn">
                <i class="fas fa-users"></i>
              </button>
              <button class="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
          
          <!-- Search -->
          <div class="p-4 border-b border-gray-200">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Rechercher..." 
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-green"
                id="searchInput"
              >
            </div>
          </div>
          
          <!-- Tabs -->
          <div class="flex border-b border-gray-200">
            <button class="flex-1 py-3 px-4 text-center font-medium border-b-2 border-whatsapp-green text-whatsapp-green" id="chatsTab">
              Discussions
            </button>
            <button class="flex-1 py-3 px-4 text-center font-medium text-gray-500 hover:text-gray-700" id="groupsTab">
              Groupes
            </button>
          </div>
          
          <!-- Chat List -->
          <div class="flex-1 overflow-y-auto" id="chatList">
            <!-- Les chats seront injectés ici -->
          </div>
        </div>
        
        <!-- Main Chat Area -->
        <div class="flex-1 flex flex-col bg-gray-50" id="mainChatArea">
          <div class="flex-1 flex items-center justify-center text-gray-500" id="welcomeScreen">
            <div class="text-center">
              <div class="w-32 h-32 bg-whatsapp-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fab fa-whatsapp text-whatsapp-green text-5xl"></i>
              </div>
              <h2 class="text-2xl font-medium mb-2">WhatsApp Clone</h2>
              <p class="text-gray-400">Sélectionnez une discussion pour commencer</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modals -->
      <div id="modalContainer"></div>
    `
  }

  async loadContacts() {
    try {
      this.contacts = await this.apiService.getContactsByUser(this.currentUser.id)
      this.updateChatList()
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error)
    }
  }

  async loadGroups() {
    try {
      this.groups = await this.apiService.getGroupsByUser(this.currentUser.id)
      this.updateChatList()
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error)
    }
  }

  updateChatList() {
    const chatList = document.getElementById('chatList')
    const isGroupsTab = document.getElementById('groupsTab').classList.contains('border-whatsapp-green')
    
    if (isGroupsTab) {
      chatList.innerHTML = this.renderGroupsList()
    } else {
      chatList.innerHTML = this.renderContactsList()
    }
    
    this.bindChatListEvents()
  }

  renderContactsList() {
    if (this.contacts.length === 0) {
      return `
        <div class="p-8 text-center text-gray-500">
          <i class="fas fa-address-book text-4xl mb-4"></i>
          <p>Aucun contact trouvé</p>
          <p class="text-sm mt-2">Ajoutez des contacts pour commencer à discuter</p>
        </div>
      `
    }
    
    return this.contacts.map(contact => `
      <div class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors chat-item" data-type="contact" data-id="${contact.id}">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-whatsapp-green rounded-full flex items-center justify-center mr-3">
            <span class="text-white font-medium">${contact.name.charAt(0).toUpperCase()}</span>
          </div>
          <div class="flex-1">
            <h4 class="font-medium text-gray-900">${contact.name}</h4>
            <p class="text-sm text-gray-500">${contact.phoneNumber}</p>
          </div>
          <div class="text-right">
            <div class="w-2 h-2 bg-whatsapp-green rounded-full ${contact.isOnline ? '' : 'opacity-30'}"></div>
          </div>
        </div>
      </div>
    `).join('')
  }

  renderGroupsList() {
    if (this.groups.length === 0) {
      return `
        <div class="p-8 text-center text-gray-500">
          <i class="fas fa-users text-4xl mb-4"></i>
          <p>Aucun groupe trouvé</p>
          <p class="text-sm mt-2">Créez un groupe pour discuter à plusieurs</p>
        </div>
      `
    }
    
    return this.groups.map(group => `
      <div class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors chat-item" data-type="group" data-id="${group.id}">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <i class="fas fa-users text-white"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-medium text-gray-900">${group.name}</h4>
            <p class="text-sm text-gray-500">${group.members.length} membres</p>
          </div>
        </div>
      </div>
    `).join('')
  }

  bindEvents() {
    // Profil utilisateur
    document.getElementById('userProfileName').textContent = this.currentUser.username
    
    // Tabs
    document.getElementById('chatsTab').addEventListener('click', () => {
      this.switchTab('chats')
    })
    
    document.getElementById('groupsTab').addEventListener('click', () => {
      this.switchTab('groups')
    })
    
    // Boutons d'action
    document.getElementById('addContactBtn').addEventListener('click', () => {
      this.contactManager.showAddContactModal(this.currentUser, this.apiService, () => {
        this.loadContacts()
      })
    })
    
    document.getElementById('createGroupBtn').addEventListener('click', () => {
      this.groupManager.showCreateGroupModal(this.currentUser, this.contacts, this.apiService, () => {
        this.loadGroups()
      })
    })
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.logout()
    })
    
    // Recherche
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.searchChats(e.target.value)
    })
  }

  bindChatListEvents() {
    const chatItems = document.querySelectorAll('.chat-item')
    chatItems.forEach(item => {
      item.addEventListener('click', () => {
        const type = item.dataset.type
        const id = item.dataset.id
        this.openChat(type, id)
      })
    })
  }

  switchTab(tab) {
    const chatsTab = document.getElementById('chatsTab')
    const groupsTab = document.getElementById('groupsTab')
    
    if (tab === 'chats') {
      chatsTab.classList.add('border-whatsapp-green', 'text-whatsapp-green')
      chatsTab.classList.remove('text-gray-500')
      groupsTab.classList.remove('border-whatsapp-green', 'text-whatsapp-green')
      groupsTab.classList.add('text-gray-500')
    } else {
      groupsTab.classList.add('border-whatsapp-green', 'text-whatsapp-green')
      groupsTab.classList.remove('text-gray-500')
      chatsTab.classList.remove('border-whatsapp-green', 'text-whatsapp-green')
      chatsTab.classList.add('text-gray-500')
    }
    
    this.updateChatList()
  }

  async openChat(type, id) {
    try {
      if (type === 'contact') {
        const contact = this.contacts.find(c => c.id == id)
        this.activeChat = { type: 'contact', ...contact }
      } else {
        const group = this.groups.find(g => g.id == id)
        this.activeChat = { type: 'group', ...group }
      }
      
      await this.messageManager.showChatInterface(this.activeChat, this.currentUser, this.apiService)
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du chat:', error)
    }
  }

  async loadMessages(chatId) {
    if (this.messageManager) {
      await this.messageManager.loadMessages(chatId)
    }
  }

  searchChats(query) {
    const chatItems = document.querySelectorAll('.chat-item')
    chatItems.forEach(item => {
      const name = item.querySelector('h4').textContent.toLowerCase()
      if (name.includes(query.toLowerCase())) {
        item.style.display = 'block'
      } else {
        item.style.display = 'none'
      }
    })
  }

  logout() {
    const result = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')
    if (result) {
      // Mettre à jour le statut hors ligne
      this.apiService.updateUser(this.currentUser.id, {
        isOnline: false,
        lastSeen: new Date().toISOString()
      })
      
      localStorage.removeItem('whatsapp_user')
      window.location.reload()
    }
  }
}