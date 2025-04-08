
export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private listeners: ((text: string) => void)[] = [];
  private statusListeners: ((isListening: boolean) => void)[] = [];
  private errorListeners: ((error: string) => void)[] = [];

  constructor() {
    // Check if browser supports SpeechRecognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionImpl();
      this.isSupported = true;
      this.configureRecognition();
    } else {
      console.warn('Speech recognition is not supported in this browser');
      this.isSupported = false;
    }
  }

  private configureRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.notifyTranscript(transcript);
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.notifyStatusChange(true);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.notifyStatusChange(false);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      this.notifyStatusChange(false);
      this.notifyError(event.error);
    };
  }

  start(): boolean {
    if (!this.isSupported || !this.recognition) {
      this.notifyError('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.notifyError('Failed to start speech recognition');
      return false;
    }
  }

  stop(): void {
    if (this.isListening && this.recognition) {
      this.recognition.stop();
    }
  }

  onTranscript(listener: (text: string) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  onStatusChange(listener: (isListening: boolean) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  onError(listener: (error: string) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  private notifyTranscript(text: string): void {
    this.listeners.forEach(listener => listener(text));
  }

  private notifyStatusChange(isListening: boolean): void {
    this.statusListeners.forEach(listener => listener(isListening));
  }

  private notifyError(error: string): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  get supported(): boolean {
    return this.isSupported;
  }

  get listening(): boolean {
    return this.isListening;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
export default speechRecognitionService;
