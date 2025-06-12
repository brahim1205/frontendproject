export class Utils {
  static formatTime(date) {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  static formatDate(date) {
    const today = new Date()
    const messageDate = new Date(date)
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hier'
    }
    
    return messageDate.toLocaleDateString('fr-FR')
  }

  static generateId() {
    return Math.random().toString(36).substr(2, 9)
  }

  static formatPhoneNumber(phone) {
    // Nettoyer le numéro de téléphone
    const cleaned = phone.replace(/\D/g, '')
    
    // Format français
    if (cleaned.startsWith('33')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`
    }
    
    return phone
  }

  static isValidPhoneNumber(phone) {
    const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  static truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  static getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase()
  }

  static getFileIcon(extension) {
    const icons = {
      pdf: 'fas fa-file-pdf',
      doc: 'fas fa-file-word',
      docx: 'fas fa-file-word',
      xls: 'fas fa-file-excel',
      xlsx: 'fas fa-file-excel',
      ppt: 'fas fa-file-powerpoint',
      pptx: 'fas fa-file-powerpoint',
      jpg: 'fas fa-file-image',
      jpeg: 'fas fa-file-image',
      png: 'fas fa-file-image',
      gif: 'fas fa-file-image',
      mp3: 'fas fa-file-audio',
      wav: 'fas fa-file-audio',
      mp4: 'fas fa-file-video',
      avi: 'fas fa-file-video'
    }
    
    return icons[extension] || 'fas fa-file'
  }

  static playNotificationSound() {
    // Créer un son de notification simple
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  static showNotification(title, body, icon = '/vite.svg') {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, icon })
        }
      })
    }
  }

  static detectLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.replace(urlRegex, '<a href="$1" target="_blank" class="text-blue-400 underline">$1</a>')
  }

  static escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}