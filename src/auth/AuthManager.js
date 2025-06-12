export class AuthManager {
  renderLoginPage() {
    return `
      <div class="min-h-screen bg-gradient-to-br from-whatsapp-teal to-whatsapp-green-dark flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md animate-bounce-in">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-whatsapp-green rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fab fa-whatsapp text-white text-3xl"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">WhatsApp Clone</h1>
            <p class="text-gray-600">Connectez-vous avec votre numéro de téléphone</p>
          </div>
          
          <!-- Notification area -->
          <div id="loginNotificationArea" class="mb-4 hidden">
            <div class="p-3 rounded-lg" id="loginNotificationContent">
              <p id="loginNotificationMessage"></p>
            </div>
          </div>
          
          <form id="loginForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input 
                type="text" 
                id="username" 
                placeholder="Votre nom"
                class="input-field"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input 
                type="tel" 
                id="phoneNumber" 
                placeholder="+33 6 12 34 56 78"
                class="input-field"
                required
              >
            </div>
            
            <button 
              type="submit" 
              class="btn-primary w-full"
              id="loginBtn"
            >
              <i class="fas fa-sign-in-alt mr-2"></i>
              Se connecter
            </button>
          </form>
          
          <div class="mt-6 text-center text-sm text-gray-500">
            <p>En vous connectant, vous acceptez nos conditions d'utilisation</p>
          </div>
        </div>
      </div>
    `
  }

  bindLoginEvents(onLogin) {
    const form = document.getElementById('loginForm')
    const loginBtn = document.getElementById('loginBtn')
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const username = document.getElementById('username').value.trim()
      const phoneNumber = document.getElementById('phoneNumber').value.trim()
      
      if (!username || !phoneNumber) {
        this.showLoginNotification('Veuillez remplir tous les champs', 'error')
        return
      }
      
      loginBtn.disabled = true
      loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Connexion...'
      
      try {
        await onLogin(phoneNumber, username)
      } catch (error) {
        this.showLoginNotification('Erreur lors de la connexion', 'error')
      } finally {
        loginBtn.disabled = false
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Se connecter'
      }
    })
  }
  
  showLoginNotification(message, type) {
    const notificationArea = document.getElementById('loginNotificationArea')
    const notificationContent = document.getElementById('loginNotificationContent')
    const notificationMessage = document.getElementById('loginNotificationMessage')
    
    if (!notificationArea) return
    
    notificationMessage.textContent = message
    
    // Reset classes
    notificationContent.className = 'p-3 rounded-lg'
    
    // Add type-specific classes
    if (type === 'success') {
      notificationContent.classList.add('bg-green-100', 'text-green-800', 'border', 'border-green-200')
    } else if (type === 'error') {
      notificationContent.classList.add('bg-red-100', 'text-red-800', 'border', 'border-red-200')
    } else {
      notificationContent.classList.add('bg-blue-100', 'text-blue-800', 'border', 'border-blue-200')
    }
    
    notificationArea.classList.remove('hidden')
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      notificationArea.classList.add('hidden')
    }, 3000)
  }
}