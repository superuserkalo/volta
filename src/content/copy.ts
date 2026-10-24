// Every string here is copied verbatim from volta.coffee
// (docs/research/volta-site/copy-verbatim.txt). Case is stored as written
// in their markup; uppercase styling is a CSS concern. Guarded by copy.test.ts.

export const copy = {
  nav: { cta: "Get early access" },

  hero: {
    eyebrow: "Founders Edition · Winter 2026",
    headline: ["Real espresso.", "9 bar.", "Anywhere."],
    body: "The first portable espresso machine that doesn't compromise. Pressure profiling, roast-matched temperature, and a 49 mm basket, the new standard. All on battery power.",
    cta: "Get early access",
    placeholder: "you@email.com",
    loading: "Loading…",
    success: "You're on the list. Talk soon.",
    note: "Early subscribers get first access to the limited Founders Edition. No spam, ever.",
    caption: "Prototype. Details might change.",
  },

  specs: [
    { value: "12 BAR", label: "Max pressure · profiled" },
    { value: "±0.5 °C", label: "PID temperature" },
    { value: "49 MM", label: "Basket · the new standard" },
    { value: "ANY", label: "Battery · modular power" },
  ],

  pressure: {
    kicker: "01 · Pressure",
    headline: "Profile the shot, not just pull it.",
    body: "Up to 12 bar, fully profiled. Flat 9 bar for classics, lever-style decay for sweetness, or draw your own curve. The pump follows it. Every shot, every location.",
    meta: "FLAT · LEVER · CUSTOM · 0.5 BAR RESOLUTION",
    legend: ["Flat 9 bar", "Lever", "Custom"],
    chartTitle: "PRESSURE PROFILE · BAR",
  },

  temperature: {
    kicker: "02 · Temperature",
    headline: "Roast-matched, and it holds.",
    body: "PID-controlled temperature. Set 88.0 °C for a dark roast or 96.0 °C for a bright light one, and it stays there. The 49 mm basket is the new standard: sized for the machine, open for your gear. No proprietary nonsense.",
    meta: "85.0 TO 99.0 °C · ±0.5 °C · 49 MM STANDARD",
    hold: "±0.5 °C hold",
    target: "TARGET",
    chartTitle: "BOILER SETPOINT · °C",
  },

  control: {
    kicker: "03 · Control",
    headline: "Simple on the machine. Everything in the app.",
    body: "The on-device UI stays deliberately simple: the essentials, readable at a glance. Full control — profiles, temperatures, shot logs, updates — lives in the app. And if you want everything on the machine, the modular port on top takes an optional advanced UI module.",
    rows: [
      { label: "On the machine", value: "THE ESSENTIALS" },
      { label: "In the app", value: "FULL CONTROL" },
      { label: "Modular port, top", value: "ADVANCED UI · OPTIONAL" },
    ],
  },

  power: {
    kicker: "04 · Power",
    headline: "One machine. Any battery you own.",
    body: "Modular by design. The Founders Edition ships with a native B-mount and a DC power port. Snap on an adapter and it runs off V-mount, A-mount, or the power-tool packs already in your bag.",
    cards: [
      {
        tag: "NATIVE",
        title: "B-mount + DC port",
        body: "Built into the Founders Edition. Plug in the DC port at home or clip on a B-mount pack. No adapter needed.",
      },
      {
        tag: "ADAPTER",
        title: "V-mount and A-mount",
        body: "The film-industry standards. Snap on an adapter and your existing cine batteries run the machine all day.",
      },
      {
        tag: "ADAPTER",
        title: "Power-tool packs",
        body: "The batteries already in your bag. One adapter, espresso at the trailhead or on the job site.",
      },
    ],
  },

  repair: {
    kicker: "05 · Built to stay built",
    headline: "Repairable. Every part replaceable.",
    body: "Standard fasteners, published service guides, spare parts for sale. Nothing locked in a service center. Designed and made in Europe. It should be your last espresso machine, not your next one.",
    rows: [
      { label: "Standard fasteners throughout", value: "METRIC TORX + HEX" },
      { label: "Published service guides", value: "FREE · ONLINE" },
      { label: "Spare parts", value: "EVERY PART" },
      { label: "Designed and made in", value: "AUSTRIA" },
    ],
  },

  lab: {
    kicker: "06 · Built in public",
    headline: "Still in the lab. Come watch.",
    body: "The Founders Edition is real, but not finished. We're testing prototypes in the open and letting the results decide the spec. Some features are locked. Some are still TBD. Subscribe and you'll see every one land, decision by decision.",
    cards: [
      { status: "IN TESTING", title: "Steam wand", body: "Milk on battery power. Chasing the right pressure and recovery time." },
      { status: "IN TESTING", title: "Brew to weight", body: "Auto-stop at your target yield. Pairs with Bluetooth scales for now." },
      { status: "PLANNED", title: "Shot logging", body: "Every pull recorded: pressure curve, temp, time, weight." },
      { status: "TBD", title: "And more", body: "Your feedback sets the priority. Tell us what matters." },
    ],
    meta: "STEAM · BREW-TO-WEIGHT · SHOT LOGGING · AND MORE IN TESTING",
  },

  quote: {
    text: "\"5am on set. No coffee, or awful instant. I'm a cameraman who happens to think like an engineer, and I couldn't accept that 'portable' had to mean one weak shot and no steam. The easy path was a pod machine with a battery taped on. I didn't want easy. I wanted the machine I wished existed, built in the open.\"",
    name: "Benedict Heinzl",
    role: "Founder, VOLTA",
  },

  cta: {
    eyebrow: "Founders Edition · Winter 2026",
    headline: "Be first in line.",
    body: "We're starting with a limited Founders Edition, ready in the winter. Early subscribers get first access and the first production slots.",
    cta: "Get early access",
    placeholder: "you@email.com",
    loading: "Loading…",
    success: "You're on the list. Talk soon.",
    note: "One email when we launch. Maybe two. That's it.",
  },

  footer: {
    links: [
      { label: "Instagram", href: "https://www.instagram.com/_voltacoffee" },
      { label: "YouTube", href: "https://www.youtube.com/@volta.coffee" },
      { label: "Impressum", href: "https://volta.coffee/impressum/" },
    ],
    legal: "© 2026 VOLTA · Designed and made in Europe",
  },
} as const;
