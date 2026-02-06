import { Howl } from 'howler';

// Athan audio sources
const ATHAN_AUDIO_SOURCES = {
  'makkah': {
    id: 'makkah',
    name: 'أذان الحرم المكي',
    arabicName: 'أذان الحرم المكي',
    source: '/athan-audio/019--1.mp3',
    description: 'Athan from the Holy Mosque in Makkah'
  },
  'abdulbasit': {
    id: 'abdulbasit',
    name: 'Abdulbasit Abdul Samad',
    arabicName: 'أذان بصوت عبدالباسط عبد الصمد',
    source: '/athan-audio/052-.mp3',
    description: 'Athan by Abdulbasit Abdul Samad'
  },
  'mishari_fajr': {
    id: 'mishari_fajr',
    name: 'Mishari Al-Afasy (Fajr)',
    arabicName: 'أذان الفجر الشيخ مشاري بن راشد العفاسي',
    source: '/athan-audio/038-1.mp3',
    description: 'Fajr Athan by Mishari Rashid Al-Afasy'
  },
  'cairo': {
    id: 'cairo',
    name: 'Mohamed Refaat (Cairo)',
    arabicName: 'أذان القاهرة محمد رفعت',
    source: '/athan-audio/042--.mp3',
    description: 'Cairo Athan by Mohamed Refaat'
  }
};

// Current playing athan
let currentAthan: Howl | null = null;

export class PrayerNotificationManager {
  private enabled: boolean = false;
  private selectedAthan: keyof typeof ATHAN_AUDIO_SOURCES = 'makkah';
  private prayerTimes: Map<string, string> = new Map();
  private scheduledNotifications: NodeJS.Timeout[] = [];
  private lastNotifiedPrayer: string = '';
  private notificationVolume: number = 0.7;
  private notifyBeforeMinutes: number = 5;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const settings = localStorage.getItem('prayerNotificationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.enabled || false;
        this.selectedAthan = parsed.athanSource || 'makkah';
        this.notificationVolume = parsed.volume || 0.7;
        this.notifyBeforeMinutes = parsed.notifyBefore || 5;
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  private saveSettings() {
    try {
      const settings = {
        enabled: this.enabled,
        athanSource: this.selectedAthan,
        volume: this.notificationVolume,
        notifyBefore: this.notifyBeforeMinutes
      };
      localStorage.setItem('prayerNotificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  setPrayerTimes(prayerTimes: Record<string, string>) {
    this.prayerTimes.clear();
    Object.entries(prayerTimes).forEach(([prayer, time]) => {
      if (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(prayer)) {
        this.prayerTimes.set(prayer, time);
      }
    });
    this.scheduleNotifications();
  }

  private scheduleNotifications() {
    // Clear existing notifications
    this.scheduledNotifications.forEach(timeout => clearTimeout(timeout));
    this.scheduledNotifications = [];

    if (!this.enabled || this.prayerTimes.size === 0) {
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    this.prayerTimes.forEach((timeString, prayer) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      const prayerTimeInMinutes = hours * 60 + minutes;
      
      // Calculate time until prayer
      let timeUntilPrayer = prayerTimeInMinutes - currentTime;
      
      // If prayer already passed today, schedule for tomorrow
      if (timeUntilPrayer < 0) {
        timeUntilPrayer += 24 * 60;
      }

      // Schedule notification X minutes before prayer
      const notificationTime = timeUntilPrayer - this.notifyBeforeMinutes;
      if (notificationTime > 0) {
        const timeout = setTimeout(() => {
          this.sendNotification(prayer, timeString);
        }, notificationTime * 60 * 1000);

        this.scheduledNotifications.push(timeout);
        console.log(`Scheduled notification for ${prayer} at ${timeString} (in ${notificationTime} minutes)`);
      }
    });
  }

  private async sendNotification(prayerName: string, prayerTime: string) {
    if (this.lastNotifiedPrayer === prayerName) {
      return; // Avoid duplicate notifications
    }

    this.lastNotifiedPrayer = prayerName;

    // Browser notification
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      if (Notification.permission === 'granted') {
        const prayerNamesAr = {
          Fajr: 'الفجر',
          Dhuhr: 'الظهر',
          Asr: 'العصر',
          Maghrib: 'المغرب',
          Isha: 'العشاء'
        };

        const notification = new Notification('🕌 موعد الصلاة', {
          body: `حان الآن وقت صلاة ${prayerNamesAr[prayerName as keyof typeof prayerNamesAr]} (${prayerTime})`,
          icon: '/icon.png',
          tag: `prayer-${prayerName}-${Date.now()}`,
          requireInteraction: true,
          silent: false
        });

        // Auto close after 30 seconds
        setTimeout(() => {
          notification.close();
        }, 30000);

        notification.onclick = () => {
          window.focus();
          this.stopAthan(); // Stop athan when user clicks notification
        };
      }
    }

    // Play athan audio
    this.playAthanAudio();
  }

  private playAthanAudio() {
    // Stop any currently playing athan
    if (currentAthan) {
      currentAthan.stop();
      currentAthan.unload();
    }

    const audioSource = ATHAN_AUDIO_SOURCES[this.selectedAthan];
    
    try {
      currentAthan = new Howl({
        src: [audioSource.source],
        html5: true,
        volume: this.notificationVolume,
        preload: true,
        onloaderror: (id, error) => {
          console.error('Error loading athan audio:', error);
          this.showFallbackNotification();
        },
        onplayerror: (id, error) => {
          console.error('Error playing athan audio:', error);
          this.showFallbackNotification();
        },
        onend: () => {
          console.log('Athan audio finished playing');
          currentAthan = null;
        }
      });

      currentAthan.play();
      console.log(`Playing athan: ${audioSource.name}`);
    } catch (error) {
      console.error('Error creating Howl instance:', error);
      this.showFallbackNotification();
    }
  }

  private showFallbackNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🕌 موعد الصلاة', {
        body: 'حان وقت الصلاة. التكبير 🔊',
        icon: '/icon.png',
        tag: 'prayer-fallback'
      });
    }
  }

  stopAthan() {
    if (currentAthan) {
      currentAthan.stop();
      currentAthan.unload();
      currentAthan = null;
      console.log('Athan stopped by user');
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.saveSettings();
    if (enabled) {
      this.scheduleNotifications();
    } else {
      this.scheduledNotifications.forEach(timeout => clearTimeout(timeout));
      this.scheduledNotifications = [];
      this.stopAthan();
    }
  }

  setAthanSource(source: keyof typeof ATHAN_AUDIO_SOURCES) {
    this.selectedAthan = source;
    this.saveSettings();
  }

  setVolume(volume: number) {
    this.notificationVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setNotifyBefore(minutes: number) {
    this.notifyBeforeMinutes = Math.max(1, Math.min(30, minutes));
    this.saveSettings();
    if (this.enabled) {
      this.scheduleNotifications();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getAthanSource(): string {
    return this.selectedAthan;
  }

  getVolume(): number {
    return this.notificationVolume;
  }

  getNotifyBefore(): number {
    return this.notifyBeforeMinutes;
  }

  getAvailableAthanSources() {
    return ATHAN_AUDIO_SOURCES;
  }

  destroy() {
    this.scheduledNotifications.forEach(timeout => clearTimeout(timeout));
    this.scheduledNotifications = [];
    this.stopAthan();
  }
}

// Singleton instance
export const prayerNotificationManager = new PrayerNotificationManager();