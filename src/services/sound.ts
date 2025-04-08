
export enum SoundEffect {
  ELEVATOR_MOVE = 'elevator-move',
  ELEVATOR_ARRIVE = 'elevator-arrive',
  DOOR_OPEN = 'door-open',
  DOOR_CLOSE = 'door-close',
  BUTTON_CLICK = 'button-click',
  ALARM = 'alarm',
  VOICE_COMMAND = 'voice-command',
  CONNECTION = 'connection',
}

class SoundService {
  private soundEffects: Map<SoundEffect, HTMLAudioElement> = new Map();
  private muted: boolean = false;

  constructor() {
    // Initialize sound effects
    this.loadSoundEffect(SoundEffect.ELEVATOR_MOVE, 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3');
    this.loadSoundEffect(SoundEffect.ELEVATOR_ARRIVE, 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3');
    this.loadSoundEffect(SoundEffect.DOOR_OPEN, 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
    this.loadSoundEffect(SoundEffect.DOOR_CLOSE, 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
    this.loadSoundEffect(SoundEffect.BUTTON_CLICK, 'https://assets.mixkit.co/active_storage/sfx/1705/1705-preview.mp3');
    this.loadSoundEffect(SoundEffect.ALARM, 'https://assets.mixkit.co/active_storage/sfx/1662/1662-preview.mp3');
    this.loadSoundEffect(SoundEffect.VOICE_COMMAND, 'https://assets.mixkit.co/active_storage/sfx/232/232-preview.mp3');
    this.loadSoundEffect(SoundEffect.CONNECTION, 'https://assets.mixkit.co/active_storage/sfx/146/146-preview.mp3');
  }

  private loadSoundEffect(type: SoundEffect, url: string): void {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.soundEffects.set(type, audio);
  }

  play(type: SoundEffect): void {
    if (this.muted) return;
    
    const sound = this.soundEffects.get(type);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.error(`Failed to play sound ${type}:`, error);
      });
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }
}

export const soundService = new SoundService();
export default soundService;
