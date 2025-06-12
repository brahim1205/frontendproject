export class GroupManager {
  showCreateGroupModal(currentUser, contacts, apiService, onGroupCreated) {
    const modalContainer = document.getElementById('modalContainer')
    
    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Créer un groupe</h2>
            <button class="text-gray-500 hover:text-gray-700" id="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Notification area -->
          <div id="notificationArea" class="mb-4 hidden">
            <div class="p-3 rounded-lg" id="notificationContent">
              <p id="notificationMessage"></p>
            </div>
          </div>
          
          <form id="createGroupForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nom du groupe
              </label>
              <input 
                type="text" 
                id="groupName" 
                placeholder="Nom du groupe"
                class="input-field"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description du groupe
              </label>
              <textarea 
                id="groupDescription" 
                placeholder="Description du groupe (optionnel)"
                class="input-field h-20 resize-none"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sélectionnez les membres
              </label>
              <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                ${contacts.map(contact => `
                  <label class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" value="${contact.contactUserId}" class="contact-checkbox">
                    <div class="w-8 h-8 bg-whatsapp-green rounded-full flex items-center justify-center">
                      <span class="text-white text-sm font-medium">${contact.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p class="font-medium text-sm">${contact.name}</p>
                      <p class="text-xs text-gray-500">${contact.phoneNumber}</p>
                    </div>
                  </label>
                `).join('')}
              </div>
              ${contacts.length === 0 ? '<p class="text-sm text-gray-500">Aucun contact disponible</p>' : ''}
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button type="button" class="btn-secondary flex-1" id="cancelBtn">
                Annuler
              </button>
              <button type="submit" class="btn-primary flex-1" id="createGroupBtn">
                Créer le groupe
              </button>
            </div>
          </form>
        </div>
      </div>
    `
    
    // Bind events
    const closeModal = () => modalContainer.innerHTML = ''
    
    document.getElementById('closeModal').addEventListener('click', closeModal)
    document.getElementById('cancelBtn').addEventListener('click', closeModal)
    
    document.getElementById('createGroupForm').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const name = document.getElementById('groupName').value.trim()
      const description = document.getElementById('groupDescription').value.trim()
      const selectedContacts = Array.from(document.querySelectorAll('.contact-checkbox:checked'))
        .map(cb => parseInt(cb.value))
      
      if (!name) {
        this.showNotification('Veuillez saisir un nom pour le groupe', 'error')
        return
      }
      
      if (selectedContacts.length === 0) {
        this.showNotification('Veuillez sélectionner au moins un membre', 'error')
        return
      }
      
      const createBtn = document.getElementById('createGroupBtn')
      createBtn.disabled = true
      createBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Création...'
      
      try {
        // Ajouter l'utilisateur actuel aux membres
        const members = [currentUser.id, ...selectedContacts]
        
        await apiService.createGroup({
          name,
          description,
          members,
          createdBy: currentUser.id,
          createdAt: new Date().toISOString()
        })
        
        this.showNotification('Groupe créé avec succès !', 'success')
        
        setTimeout(() => {
          closeModal()
          onGroupCreated()
        }, 1500)
        
      } catch (error) {
        console.error('Erreur lors de la création du groupe:', error)
        this.showNotification('Erreur lors de la création du groupe', 'error')
      } finally {
        createBtn.disabled = false
        createBtn.innerHTML = 'Créer le groupe'
      }
    })
  }
  
  showNotification(message, type) {
    const notificationArea = document.getElementById('notificationArea')
    const notificationContent = document.getElementById('notificationContent')
    const notificationMessage = document.getElementById('notificationMessage')
    
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
    
    // Auto-hide after 3 seconds for non-success messages
    if (type !== 'success') {
      setTimeout(() => {
        notificationArea.classList.add('hidden')
      }, 3000)
    }
  }
}