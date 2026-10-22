/** Prononciation espagnole via l'API Web Speech, avec repli silencieux. */
let cachedVoice = null;
let warned = false;

export function audioAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice() {
  if (cachedVoice) return cachedVoice;
  if (!audioAvailable()) return null;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => v.lang?.toLowerCase() === "es-es") ||
    voices.find((v) => v.lang?.toLowerCase().startsWith("es")) ||
    null;
  return cachedVoice;
}

if (audioAvailable()) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = null;
    pickVoice();
  });
}

export function speak(text, { rate = 0.92, force = false } = {}) {
  if (!audioAvailable()) {
    if (!warned) {
      warned = true;
      console.info("La synthèse vocale n'est pas disponible dans ce navigateur.");
    }
    return false;
  }
  try {
    if (!force) {
      const { store } = window.__violetaStore || {};
      if (store && store.get().settings.audio === false) return false;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = "es-ES";
    utterance.rate = rate;
    utterance.pitch = 1;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  if (audioAvailable()) window.speechSynthesis.cancel();
}
