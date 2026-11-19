export const DIALOGS = {
    bar: {
        text: "Prendi una Peroni?",
        choices: [
            { label: "Si, damm na birr da portare", action: "give", item: "peroni", reply: "Alla saluuut!" },
            { label: "Si, damm na birr ghiacchiat mo proprj", action: "use", reply: "Alla saluuut!", item: "peroni"},
            { label: "No, grazie", action: null, reply: "E c si vnut a fa?" }
        ],
    },
    focacciaro: {
        text: "Cosa le serve?",
        choices: [
            { label: "Focaccia", action: "give", item: "focaccia", reply: "Ecco, a lei!" },
            { label: "Pane senza glutine", action: "give", item: "gfBread", reply: "Ecco, a lei!" },
            { label: "Niente, grazie", action: null, reply: "E c si vnut a fa?" }
        ],
    },
    luke: {
        text: "Amo andiamo alla falegnameria?",
        choices: [
            { label: "Sii, sono gasata", action: null, reply: "Top!" },
            { label: "No amo... non mi va", action: null, reply: "Lame..." }
        ],
    },
    building: {
        text: "Very cool building. Carlo Ratti wouldn't be able to do something like this...",
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
            { label: "Si, cosa c'e' al cinema?", action: "selectMovie", venue: "cinema" },
            { label: "No", action: null, reply: "Mi faccio un giro." },
        ]
    },
    theater: { 
        text: "Mi va di andare a teatro?",
        choices: [
            { label: "Si, cosa c'e' in programma?", action: "selectMovie", venue: "theater" },
            { label: "No", action: null, reply: "Mi faccio un giro." },
        ]
    }
};