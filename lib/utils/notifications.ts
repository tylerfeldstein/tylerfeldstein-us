// Audio context for playing sounds
let audioContext: AudioContext | null = null;

// Declare webkitAudioContext type
interface WebkitWindow extends Window {
  webkitAudioContext: typeof AudioContext;
}

// Function to play notification sound
export async function playNotificationSound() {
  try {
    // Initialize audio context if not already done
    if (!audioContext) {
      audioContext = new (window.AudioContext || ((window as unknown) as WebkitWindow).webkitAudioContext)();
    }

    // Create oscillator for a simple "ding" sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set up sound parameters
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    // Play sound
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

// Function to show browser notification
export async function showNotification(title: string, body: string) {
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  // Check if we have permission
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification(title, { body });
    }
  }
}

// Combined function to handle both sound and notification
export async function notify(title: string, body: string) {
  await Promise.all([
    playNotificationSound(),
    showNotification(title, body)
  ]);
} 