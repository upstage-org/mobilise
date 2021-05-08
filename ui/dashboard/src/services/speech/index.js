export const avatarSpeak = (avatar, message) => {
    speechSynthesis.cancel();
    let utterance = new SpeechSynthesisUtterance(message ?? avatar.speak.message);
    if (avatar.voice) {
        const { volume, pitch, rate, voice } = avatar.voice
        utterance.volume = volume
        utterance.pitch = pitch
        utterance.rate = Math.pow(Math.abs(rate) + 1, rate < 0 ? -1 : 1);
        utterance.voice = speechSynthesis.getVoices().find(v => v.voiceURI === voice) ?? speechSynthesis.getVoices[0] // Default to first voice found
    }
    speechSynthesis.speak(utterance);
}
