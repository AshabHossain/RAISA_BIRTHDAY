/* =========================================================================
   ✏️  EDIT EVERYTHING PERSONAL HERE
   All text, photos and the unlock time live in this one file.
   ========================================================================= */
window.CONFIG = {
  name: "Raisa",
  from: "Ashab",

  // The exact moment the site unlocks — Bangladesh time (UTC+06:00).
  unlockAt: "2026-10-26T00:00:00+06:00",

  // SHA-256 of your secret preview key. Open the site with
  //   ?preview=ashab-sneakpeek
  // to skip the lock and test everything before her birthday.
  previewHash: "57e8e71690dd3a69ac119db6cb6eee1c13feb896aaa7f195477248246c946c34",

  /* ---------------- LOCK SCREEN (before 12:00 AM) ---------------- */
  lock: {
    eyebrow: "a little surprise · for Raisa",
    title: "Shhh… <em>not yet.</em>",
    lead: "This site will open at 12:00 AM on your birthday — make sure to visit it. 🤍",
    taunts: [
      "Ei je Raisa, eto taratari? 😤",
      "Phone er clock ghuriye labh nai — ami server er time dekhi 😌",
      "Shobur e mewa phole. Literally.",
      "No spoilers. Not even for the birthday girl.",
      "Ami jani tumi curious. Etai to plan chhilo 😏",
      "12:00 AM e esho, website ta wait korche. ⏰",
      "Envelope ta tap kore labh nai, eta sealed. 🔒"
    ],
    sealTaunts: [
      "Sealed! 🔒",
      "Ei, haat sorao 😤",
      "Ekhono na, Raisa.",
      "Tap korte thakle o khulbe na 😂",
      "Okay ekhon tumi just moja nichho."
    ],
    fleeLabels: [
      "Open it anyway 👀",
      "Nope 😛",
      "Too slow!",
      "Dhorte parba na 🏃‍♂️",
      "Raisa, behave 🙄",
      "Still no.",
      "Haat e byatha hocche na? 😂",
      "Okay okay…"
    ],
    gaveUpLabel: "Fine 🙄 click",
    gaveUpToast: "Hehe, nice try 😌 12:00 AM e esho — make sure to visit it then!",
    unlockedTitle: "It's time <em>✨</em>"
  },

  /* ---------------- GATE (after unlock) ---------------- */
  gate: {
    eyebrow: "26 · 10 · it's finally here",
    title: "For Raisa",
    hint: "Tap the letter to open 💌",
    small: "turn your sound on 🔊"
  },

  /* ---------------- HERO ---------------- */
  hero: {
    photo: "assets/photos/03-saree-orange.jpg",
    script: "Happy Birthday",
    date: "26 · 10 · 2026"
  },

  statement: "Aaj ekta khub special din. The day the universe decided it needed a little more <em>you</em>.",

  /* ---------------- PHOTO STORY (horizontal) ---------------- */
  storyTitle: "The many moods of <em>Raisa</em>",
  story: [
    { src: "assets/photos/01-garden.jpg",        title: "Sunlit",           text: "Shobcheye shundor candid gulo emon peaceful moment e ashe." },
    { src: "assets/photos/02-cake.jpg",          title: "Last year",        text: "Last year a cake said your name. This year, a whole website does. Level up 😌" },
    { src: "assets/photos/05-rooftop.jpg",       title: "Lost in thought",  text: "Oi look-away-and-smile face ta. Ki eto bhabo, bolo to?" },
    { src: "assets/photos/06-red.jpg",           title: "Main character",   text: "Background ta blur, obviously. Ar keu focus e thakbe kivabe?" },
    { src: "assets/photos/07-jersey.jpg",        title: "Vamos 🇦🇷",         text: "Duijon-i Argentina supporter 🤝 (at least ekta jinish e pura agree, zero debate)" },
    { src: "assets/photos/04-saree-purple.jpg",  title: "After dark",       text: "Some people glow in daylight. You just… do it at night too." }
  ],
  storyEnd: "& every version of you in between <em>♡</em>",

  /* ---------------- CINEMATIC REEL ---------------- */
  reel: [
    { src: "assets/photos/08-eyes.jpg",    line: "Those eyes.",      sub: "that's it. that's the caption." },
    { src: "assets/photos/09-smile.jpg",   line: "Ar ei hashi ta…",  sub: "please, never lose it." }
  ],
  reelEnd: ["Some smiles fix", "entire days.", "<em>Yours is one of them.</em>"],

  /* ---------------- MEMORY ---------------- */
  memory: {
    src: "assets/photos/10-cafe.jpg",
    note: "Shoot day 🎬",
    eyebrow: "09 · 09 · 2026 — Dhaka",
    title: "Behind the scenes 🎬",
    text: "Oidin amra shoot kortesilam, video gulor majhe ekta candid frame. That day felt really special."
  },

  /* ---------------- THE LETTER ---------------- */
  letterTitle: "Dear Raisa,",
  letter: [
    "Ami tomake etotuku chinsi if someone wishes you on your birthday; you get happiest the most; its just a little effort from me to make you happy on your birthday.",
    "Though we dont talk anymore; and i couldnt make some gift from you; even if i meet you maybe because of time; i wouldnt be able to gift you something thoughtful;",
    "but i was working on this website even before we stopped talking; because what if your birthday falls in first of october.",
    "Im just too much sad about the fact that we couldnt work on; but i want you to know i really loved the moment where i was with you.",
    "Happy Birthday, Raisa. 🤍"
  ],

  /* ---------------- THE GAME ---------------- */
  game: {
    eyebrow: "ekta shotti kotha bolo",
    question: "Admit it… you missed me a little, right? 🙄",
    yes: "Hmm… yes 🙈",
    noTexts: [
      "No",
      "Sure? 🤨",
      "Birthday te mittha? 😳",
      "Button o tomake bishshash kore na",
      "Eto try korcho keno? 😂",
      "Raisa. Behave.",
      "Okay this is embarrassing",
      "Just press yes 🙄"
    ],
    subTexts: [
      "Choose wisely 😌",
      "Hmm, interesting choice…",
      "Website ta tomar mittha dhore felche 👀",
      "Yes button ta boro hocche, notice korecho?",
      "Ar koto? 😌",
      "Ami wait korte pari. Shara raat.",
      "…",
      "Tumi jano answer ta 🙂"
    ],
    yesReply: "Ami jantam 😌",
    yesSub: "Ami o. Onek beshi. 🤍"
  },

  /* ---------------- FINALE ---------------- */
  finale: {
    eyebrow: "last thing, promise",
    title: "Make a wish, <em>Raisa</em>",
    hint: "Chokh bondho koro, mone mone ekta wish koro… tarpor candle gulo te tap koro 🕯️",
    afterTitle: "Happy Birthday",
    afterText: "May this year be as soft, as bright, and as beautiful as you are. Ar tomar shob wish puron hok — especially the one you just made. 🤍"
  },

  footer: "made with way too much love, for exactly one person. 🤍"
};
