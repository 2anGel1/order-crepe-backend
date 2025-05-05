const venom = require('venom-bot');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.isConnected = false;
    this.initialize(); // Auto-initialize on instantiation
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Initializing WhatsApp client...');
      this.client = await venom.create({
        session: 'orna-creperie',
        multidevice: true,
        headless: false, // Show browser window
        logQR: true, // Show QR code in terminal
        browserArgs: ['--no-sandbox'],
        createOptions: {
          browserWSEndpoint: undefined,
          browserArgs: ['--no-sandbox']
        }
      });

      this.isInitialized = true;
      this.isConnected = true;
      console.log('WhatsApp client initialized successfully');

      // Add event listeners
      this.client.onStateChange((state) => {
        this.isConnected = state === 'CONNECTED';
        console.log(`WhatsApp connection state changed to: ${state}`);
      });

      // Add QR code event listener
      this.client.onQR((qr) => {
        console.log('QR Code received. Please scan with your WhatsApp app:');
        console.log(qr);
      });

    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async checkConnection() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.isConnected;
  }

  async sendStatusUpdateMessage(phoneNumber, orderReference, newStatus) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isConnected) {
      throw new Error('WhatsApp client is not connected');
    }

    const statusMessages = {
      processing: 'Votre commande est en cours de traitement.',
      preparing: 'Votre commande est en cours de préparation.',
      delivering: 'Votre commande est en cours de livraison.',
      delivered: 'Votre commande a été livrée avec succès.'
    };

    const message = `Bonjour,\n\nVotre commande #${orderReference} a été mise à jour.\n${statusMessages[newStatus]}\n\nMerci de votre confiance !\nL'équipe Orna Crêperie`;

    try {
      // Format phone number to include country code (CI)
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+225${phoneNumber}`;
      
      await this.client.sendText(formattedNumber, message);
      console.log(`WhatsApp message sent successfully to ${formattedNumber}`);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }
}

module.exports = new WhatsAppService(); 