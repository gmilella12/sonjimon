const KEY = "sonji-save";

export function saveGame(sonji) {
    console.log("saving...");
    const data = { time: Date.now(), sonji: sonji };
    localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadGame() {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return null; // first time playing: nothing saved
    return JSON.parse(raw);
}