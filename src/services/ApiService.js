export class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3001'
  }

  // Users
  async getUserByPhone(phoneNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/users?phoneNumber=${phoneNumber}`)
      const users = await response.json()
      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      throw error
    }
  }

  async createUser(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error)
      throw error
    }
  }

  async updateUser(userId, updates) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
      throw error
    }
  }

  // Contacts
  async getContactsByUser(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/contacts?userId=${userId}`)
      const contacts = await response.json()
      
      // Enrichir avec les informations utilisateur
      const enrichedContacts = await Promise.all(
        contacts.map(async (contact) => {
          const user = await this.getUserById(contact.contactUserId)
          return {
            ...contact,
            isOnline: user?.isOnline || false,
            lastSeen: user?.lastSeen
          }
        })
      )
      
      return enrichedContacts
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts:', error)
      throw error
    }
  }

  async getUserById(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`)
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur par ID:', error)
      return null
    }
  }

  async getContactByPhones(userPhone, contactPhone) {
    try {
      const response = await fetch(`${this.baseUrl}/contacts?phoneNumber=${contactPhone}`)
      const contacts = await response.json()
      return contacts.find(c => c.userId === userPhone) || null
    } catch (error) {
      console.error('Erreur lors de la vérification du contact:', error)
      return null
    }
  }

  async createContact(contactData) {
    try {
      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la création du contact:', error)
      throw error
    }
  }

  // Groups
  async getGroupsByUser(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/groups`)
      const groups = await response.json()
      return groups.filter(group => group.members.includes(userId))
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes:', error)
      throw error
    }
  }

  async createGroup(groupData) {
    try {
      const response = await fetch(`${this.baseUrl}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupData)
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error)
      throw error
    }
  }

  // Messages
  async getMessagesByChat(chatId) {
    try {
      const response = await fetch(`${this.baseUrl}/messages?chatId=${chatId}`)
      const messages = await response.json()
      return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error)
      throw error
    }
  }

  async createMessage(messageData) {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la création du message:', error)
      throw error
    }
  }

  async updateMessage(messageId, updates) {
    try {
      const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error)
      throw error
    }
  }

  async getRecentMessagesByUser(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/messages?senderId=${userId}`)
      const messages = await response.json()
      return messages.slice(-10) // Retourner les 10 derniers messages
    } catch (error) {
      console.error('Erreur lors de la récupération des messages récents:', error)
      throw error
    }
  }
}