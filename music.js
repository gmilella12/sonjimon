// music.js
export const SONGS = {
  jazz: ["music/jazz1.mp3", "music/jazz2.mp3"],
  pop: ["music/pop1.mp3", "music/pop2.mp3", "music/pop3.mp3"],
  classica: ["music/classica1.mp3"],
  bass: ["music/bass/Yunk - Lacking Input.mp3"],
  ambient: ["music/ambient/Various Artists - 22° Halo - 01 Genus Aix - Trickster.mp3"],
  reggae: [
    "music/reggae/Rockers International Records - King Tubby's Meets the Rockers Uptown - 01 Keep on Dubbing.mp3",
    "music/reggae/Rockers International Records - King Tubby's Meets the Rockers Uptown - 11 Frozen Dub.mp3"
  ]
};

let current = null; // the song playing right now

export function playMusic(genre) {
  stopMusic(); // only one song at a time
  const list = SONGS[genre];
  const file = list[Math.floor(Math.random() * list.length)];
  current = new Audio(file);
  current.onended = () => playMusic(genre); // when it ends, play another from the same genre
  current.play();
}

export function stopMusic() {
  if (current) {
    current.pause();
    current = null;
  }
}