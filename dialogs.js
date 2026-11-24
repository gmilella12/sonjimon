export const DIALOGS = {
    bar: {
        text: "Prendi una Peroni?",
        choices: [
            { label: "Si, da portare", action: "give", item: "peroni", reply: "(Birra -> zaino)." },
            { label: "Si, bevo ora", action: "use", reply: "Alla saluuut!", item: "peroni"},
            { label: "No, grazie", action: null, reply: "E c si vnut a fa?" }
        ],
    },
    focacciaro: {
        text: "Cosa le serve?",
        choices: [
            { label: "Focaccia.", action: "give", item: "focaccia", reply: "Ecco, a lei! (Focaccia -> zaino)." },
            { label: "Pane senza glutine.", action: "give", item: "gfBread", reply: "Ecco, a lei (Pane -> zaino)." },
            { label: "Niente, grazie.", action: null, reply: "E c si vnut a fa?" }
        ],
    },
    luke: {
        text: "Amo, andiamo alla falegnameria?",
        choices: [
            { label: "Sii, sono gasata!", action: "changeLocation", reply: "Top!", newLocation: "falegnameria" },
            { label: "No amo... non mi va.", action: null, reply: "Lame..." }
        ],
    },
    lukeFal: {
        text: "Torniamo a casa?",
        choices: [
            { label: "Si amo, sono stanca.", action: "goHome" },
            { label: "No, rimaniamo un po'.", action: null, reply: "Quando vuoi, dimmelo." }
        ],
    },
    robertoFal: {
        text: "Vuoi fumare Sonia cara?",
        choices: [
            { label: "Dai, fammelo fare un tiro", action: "use", item: "joint" },
            { label: "No Roberto, grazie mille!", action: null, reply: "Tranquilla, quando vuoi dimmelo." }
        ],
    },
    building: {
        text: "Very cool building. Carlo Ratti wouldn't be able to do something like this...",
    },
    wallFalPaints: {
        text: "Questi sono i quadri di Giuseppe Scarangelli!",
    },
    sea: {
        text: "Ahh, lovely smell of seaweed.",
    },
    bed: {
        text: "Mi faccio un riposino?",
        choices: [
            { label: "Si", action: "sleep" },
            { label: "Nahh...", action: null, reply: "Forse posso coccolare Mina...o suonare?" }
        ],
    },
    mina: {
        text: "Ma sei un gattino pelosone?!?",
        choices: [
            { label: "Coccola", action: "stats", stats: {energy: 30, happiness: 20}, reply: "Purrrr..."},
            { label: "Mina si arrabbia", action: "stats", stats: {energy: -10, happiness: -10}, reply: "Ahia! Graffio!"},
        ]
    },
    desk: {
        text: "Potrei suonare! Cosa suono?",
        choices: [
            { label: "Jazz", action: "music", genre: "jazz", reply: "Smooth..." },
            { label: "Pop", action: "music", genre: "pop", reply: "Si balla!" },
            { label: "Bass", action: "music", genre: "bass", reply: "MO E DO!!" },
            { label: "Classica", action: "music", genre: "classica", reply: "Brividi." },
            { label: "Ambient", action: "music", genre: "ambient", reply: "Brividi." },
            { label: "Basta musica", action: "stopMusic", reply: null },
            { label: "Niente", action: null, reply: "Forse coccolo Mina..." },
        ],
    },
    cinema: {
        text: "Potrei guardarmi un film...",
        choices: [
            { label: "Si, cosa c'e' al cinema?", action: "selectShow", venue: "cinema" },
            { label: "No", action: null, reply: "Mi faccio un giro." },
        ]
    },
    theater: { 
        text: "Mi va di andare a teatro?",
        choices: [
            { label: "Si, cosa c'e' in programma?", action: "selectShow", venue: "theater" },
            { label: "No", action: null, reply: "Mi faccio un giro." },
        ]
    },
    peppeLerario: {
        text: "Ciao Sonia, ho trovato questa vecchia macchina fotografica che non uso piu'. Te la regalo se vuoi.",
        choices: [
            { label: "Wow, che bel regalo!", action: "give", item: "camera", reply: "Ecco a te! Non ho controllato le foto... spero non siano strambe (Camera -> zaino)!" },
            { label: "No peppe, non posso accettare!", action: null, reply: "Ok, quando vuoi ripassa da qui." }
        ],
        ifHas: "camera",
        ifHasText: "Allora, com'erano le foto? Spero niente di troppo strano!",
    },
    tonyL: {
        text: "Amo, vuoi fumare uno grosso?",
        choices: [
            { label: "Dai, fammelo fare un tiro", action: "use", item: "joint", reply: "Eccolo lo sbombolones." },
            { label: "No amo, sto gia' squagliata di mio", action: null, reply: "Tranqui, quando vuoi sta fatto." }
        ],
    },
    gym: {
        text: "Mi alleno?",
        choices: [
            { label: "Sala pesi", action: "stats", stats: {energy: -10, satiety: -10}, reply: "Minchia, che fatica!" },
            { label: "Yoga", action: "stats", stats: {energy: -5, happiness: 10}, reply: "Mi sento rigenerata." }
        ],
    }
};