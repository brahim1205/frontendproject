export class ContactManager {
  showAddContactModal(currentUser, apiService, onContactAdded) {
    const modalContainer = document.getElementById("modalContainer");

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 animate-slide-up">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Ajouter un contact</h2>
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
          
          <form id="addContactForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nom du contact
              </label>
              <input 
                type="text" 
                id="contactName" 
                placeholder="Nom du contact"
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
                id="contactPhone" 
                placeholder="+33 6 12 34 56 78"
                class="input-field"
                required
              >
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button type="button" class="btn-secondary flex-1" id="cancelBtn">
                Annuler
              </button>
              <button type="submit" class="btn-primary flex-1" id="saveContactBtn">
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Bind events
    const closeModal = () => (modalContainer.innerHTML = "");

    document.getElementById("closeModal").addEventListener("click", closeModal);
    document.getElementById("cancelBtn").addEventListener("click", closeModal);

    document
      .getElementById("addContactForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const phoneNumber = document
          .getElementById("contactPhone")
          .value.trim()
          .replace(/\s+/g, "");

        if (!name || !phoneNumber) {
          this.showNotification("Veuillez remplir tous les champs", "error");
          return;
        }

        const saveBtn = document.getElementById("saveContactBtn");
        saveBtn.disabled = true;
        saveBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin mr-2"></i>Ajout...';

        try {
          // Vérifier si le contact n'existe pas déjà
          const existingContacts = await apiService.getContactsByUser(
            currentUser.id
          );
          const contactExists = existingContacts.some(
            (contact) => contact.phoneNumber === phoneNumber
          );

          if (contactExists) {
            this.showNotification("Ce contact existe déjà", "error");
            return;
          }

          // Créer le contact sans vérifier l'existence de l'utilisateur
          await apiService.createContact({
            userId: currentUser.id,
            contactUserId: null, // ou undefined si pas d'utilisateur existant
            name: name,
            phoneNumber: phoneNumber,
            addedAt: new Date().toISOString(),
          });

          this.showNotification("Contact ajouté avec succès !", "success");

          setTimeout(() => {
            closeModal();
            onContactAdded();
          }, 1500);
        } catch (error) {
          console.error("Erreur lors de l'ajout du contact:", error);
          this.showNotification("Erreur lors de l'ajout du contact", "error");
        } finally {
          saveBtn.disabled = false;
          saveBtn.innerHTML = "Ajouter";
        }
      });
  }

  showNotification(message, type) {
    const notificationArea = document.getElementById("notificationArea");
    const notificationContent = document.getElementById("notificationContent");
    const notificationMessage = document.getElementById("notificationMessage");

    if (!notificationArea) return;

    notificationMessage.textContent = message;

    // Reset classes
    notificationContent.className = "p-3 rounded-lg";

    // Add type-specific classes
    if (type === "success") {
      notificationContent.classList.add(
        "bg-green-100",
        "text-green-800",
        "border",
        "border-green-200"
      );
    } else if (type === "error") {
      notificationContent.classList.add(
        "bg-red-100",
        "text-red-800",
        "border",
        "border-red-200"
      );
    } else {
      notificationContent.classList.add(
        "bg-blue-100",
        "text-blue-800",
        "border",
        "border-blue-200"
      );
    }

    notificationArea.classList.remove("hidden");

    // Auto-hide after 3 seconds for non-success messages
    if (type !== "success") {
      setTimeout(() => {
        notificationArea.classList.add("hidden");
      }, 3000);
    }
  }
}
