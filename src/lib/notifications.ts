// AutoCom Web Audio & Haptic Notification Synthesizer
// Provides synthesized cybernetic alert tones and haptics for deals without external MP3 dependencies.

class NotificationManager {
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Synthesize a celebratory cybernetic chime for High-Value (+50% OFF) deals
   */
  public playHighValueDealSound() {
    try {
      const ctx = this.initAudio();
      if (!ctx) return;

      const now = ctx.currentTime;
      // High-value deal: 4-note ascending shimmer (C5, E5, G5, C6) with harmonic resonance
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        // Quick attack, smooth decay
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.38);
      });
    } catch {
      // Audio playback silently guarded
    }
  }

  /**
   * Synthesize a subtle soft chime for standard deals
   */
  public playStandardDealSound() {
    try {
      const ctx = this.initAudio();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Audio guarded
    }
  }

  /**
   * Fire haptic vibration pulses
   */
  public vibrate(isHighValue: boolean) {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    try {
      if (isHighValue) {
        // High-intensity multi-pulse for +50% off deals
        navigator.vibrate?.([120, 50, 120, 50, 240]);
      } else {
        // Standard pleasant pulse
        navigator.vibrate?.([50, 30, 80]);
      }
    } catch {
      // Haptics guarded
    }
  }
}

export const notificationManager = new NotificationManager();
