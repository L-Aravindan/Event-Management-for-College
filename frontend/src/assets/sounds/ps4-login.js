// PS4 Login Sound Player
import ps4StartupSound from './ps4-startup.mp3';

export const playLoginSound = () => {
    // Create audio element
    const audio = new Audio(ps4StartupSound);
    
    // Set volume (optional, adjust as needed)
    audio.volume = 0.0;
    
    // Play the sound
    audio.play().catch(error => {
        console.warn('Error playing login sound:', error);
    });
};
