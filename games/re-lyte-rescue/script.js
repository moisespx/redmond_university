const ELECTROLYTES = [
  { id: "sodium", label: "Sodium" },
  { id: "potassium", label: "Potassium" },
  { id: "magnesium", label: "Magnesium" },
  { id: "calcium", label: "Calcium" },
];

const RETENTION_FACTORS = [0.18, 0.38, 0.58, 0.78, 0.96];
const LEAK_LEVELS = [1, 0.72, 0.45, 0.2, 0.02];
const SIP_POWER = [22, 30, 38, 46, 54];

const refs = {
  instruction: document.getElementById("instruction-text"),
  bubble: document.getElementById("bubble-text"),
  hydrationLabel: document.getElementById("hydration-label"),
  hydrationFill: document.getElementById("hydration-fill"),
  retentionCopy: document.getElementById("retention-copy"),
  electrolyteCount: document.getElementById("electrolyte-count"),
  bellyFill: document.getElementById("belly-fill"),
  puddle: document.getElementById("puddle"),
  scene: document.getElementById("scene"),
  character: document.getElementById("character"),
  sparkleLayer: document.getElementById("sparkle-layer"),
  resetBtn: document.getElementById("reset-btn"),
  shortcutBtn: document.getElementById("shortcut-btn"),
  waterButtons: Array.from(document.querySelectorAll(".water-control")),
  electrolyteButtons: Array.from(document.querySelectorAll(".electrolyte-btn")),
  checklistItems: Array.from(document.querySelectorAll(".checklist-item")),
};

let state = createInitialState();
let hydrationFrame = 0;
let scheduledTimers = [];

function createInitialState() {
  return {
    hydration: 0,
    displayHydration: 0,
    activeElectrolytes: [],
    puddle: 0,
    isDrinking: false,
    instruction: "Click the pitcher or cup to give him water.",
    message: "I'm so thirsty!",
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getElectrolyteCount() {
  return state.activeElectrolytes.length;
}

function hasAllElectrolytes() {
  return getElectrolyteCount() === ELECTROLYTES.length;
}

function getLeakLevel() {
  return LEAK_LEVELS[getElectrolyteCount()];
}

function getRetentionCopy() {
  const count = getElectrolyteCount();

  if (count === 0) return "Big leak. Almost everything becomes puddle.";
  if (count === 1) return "A little better. The leak is still pretty dramatic.";
  if (count === 2) return "Middle ground. More water is finally sticking around.";
  if (count === 3) return "Almost sealed up. Just a small leak remains.";
  return "Tiny or no leak. Water can actually stay put now.";
}

function getMood() {
  if (state.hydration >= 95 && hasAllElectrolytes()) return "thriving";
  if (state.hydration >= 55 || getElectrolyteCount() >= 3) return "happy";
  if (state.hydration >= 18 || getElectrolyteCount() >= 1) return "neutral";
  return "sad";
}

function animateHydration(target, duration = 700) {
  cancelAnimationFrame(hydrationFrame);

  const start = state.displayHydration;
  const delta = target - start;
  const startTime = performance.now();

  function step(now) {
    const progress = clamp((now - startTime) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    state.displayHydration = start + delta * eased;
    render();

    if (progress < 1) {
      hydrationFrame = requestAnimationFrame(step);
      return;
    }

    state.displayHydration = target;
    render();
  }

  hydrationFrame = requestAnimationFrame(step);
}

function queue(callback, delay) {
  const timerId = window.setTimeout(() => {
    scheduledTimers = scheduledTimers.filter((entry) => entry !== timerId);
    callback();
  }, delay);

  scheduledTimers.push(timerId);
  return timerId;
}

function clearQueuedWork() {
  scheduledTimers.forEach((timerId) => clearTimeout(timerId));
  scheduledTimers = [];
  cancelAnimationFrame(hydrationFrame);
}

function burstSparkles(total = 14) {
  refs.sparkleLayer.innerHTML = "";

  for (let index = 0; index < total; index += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.setProperty("--x", `${8 + Math.random() * 84}%`);
    sparkle.style.setProperty("--y", `${8 + Math.random() * 72}%`);
    sparkle.style.setProperty("--size", `${10 + Math.random() * 16}px`);
    sparkle.style.setProperty("--delay", `${Math.random() * 0.18}s`);
    sparkle.style.setProperty("--duration", `${0.9 + Math.random() * 0.45}s`);
    refs.sparkleLayer.appendChild(sparkle);
  }

  queue(() => {
    refs.sparkleLayer.innerHTML = "";
  }, 1600);
}

function pulseCharacter(className, duration) {
  refs.character.classList.add(className);
  queue(() => refs.character.classList.remove(className), duration);
}

function updateSceneClasses() {
  const leakLevel = getLeakLevel();

  refs.character.dataset.mood = getMood();
  refs.character.classList.toggle("is-energized", hasAllElectrolytes());
  refs.character.style.setProperty("--leak-opacity", String(0.22 + leakLevel * 0.78));
  refs.character.style.setProperty("--leak-scale", String(0.22 + leakLevel * 0.78));
  refs.character.style.setProperty("--leak-height", `${12 + leakLevel * 72}px`);
}

function renderChecklist() {
  refs.electrolyteButtons.forEach((button) => {
    const active = state.activeElectrolytes.includes(button.dataset.electrolyte);
    button.classList.toggle("is-active", active);
    button.disabled = active;
    button.setAttribute("aria-pressed", String(active));
  });

  refs.checklistItems.forEach((item) => {
    const active = state.activeElectrolytes.includes(item.dataset.check);
    item.classList.toggle("is-active", active);
  });

  refs.electrolyteCount.textContent = `${getElectrolyteCount()} / ${ELECTROLYTES.length}`;
}

function renderHydrationVisuals() {
  const shownHydration = clamp(state.displayHydration, 0, 100);
  const puddleScaleX = 0.18 + state.puddle / 70;
  const puddleScaleY = 0.14 + state.puddle / 160;

  refs.hydrationFill.style.width = `${shownHydration}%`;
  refs.hydrationLabel.textContent = `${Math.round(shownHydration)}%`;
  refs.bellyFill.style.height = `${shownHydration}%`;
  refs.puddle.style.opacity = String(0.12 + state.puddle / 120);
  refs.puddle.style.transform = `translateX(-50%) scale(${puddleScaleX}, ${puddleScaleY})`;
}

function render() {
  refs.instruction.textContent = state.instruction;
  refs.bubble.textContent = state.message;
  refs.retentionCopy.textContent = getRetentionCopy();
  refs.shortcutBtn.disabled = hasAllElectrolytes() && state.hydration >= 100;

  updateSceneClasses();
  renderChecklist();
  renderHydrationVisuals();
}

function settleAtFullHydration() {
  state.hydration = 100;
  state.instruction = "Fully hydrated!";
  state.message = "Fully hydrated!";
  animateHydration(100, 500);
  burstSparkles(18);
  pulseCharacter("is-celebrating", 900);
  render();
}

function finishDrink() {
  state.isDrinking = false;
  refs.scene.classList.remove("is-drinking", "is-shortcut");

  if (hasAllElectrolytes() && state.hydration >= 86) {
    settleAtFullHydration();
    return;
  }

  if (hasAllElectrolytes()) {
    state.instruction = "All four electrolytes are active. One more sip will finish it.";
    state.message = "Almost there!";
  } else if (getElectrolyteCount() > 0) {
    state.instruction = "Try water again or add the next electrolyte.";
    state.message = "That sip stayed a little better.";
  }

  render();
}

// Each sip first spikes the bar, then settles back to the retained amount to
// visualize the water leaking out before the body hangs on to what it can.
function drinkWater(options = {}) {
  if (state.isDrinking) return;

  const count = options.forceCount ?? getElectrolyteCount();
  const leakLevel = LEAK_LEVELS[count];
  const retention = RETENTION_FACTORS[count];
  const sipPower = options.shortcut ? 120 : SIP_POWER[count];
  const netGain = Math.round(sipPower * (options.shortcut ? 1 : retention));
  const previewLoss = Math.round(leakLevel * 18) + 4;
  const previewHydration = clamp(state.hydration + netGain + previewLoss, 0, 100);
  const retainedHydration = clamp(state.hydration + netGain, 0, 100);
  const puddleDelta = options.shortcut ? -12 : Math.round(leakLevel * 26);

  state.isDrinking = true;
  refs.scene.classList.add("is-drinking");

  if (options.shortcut) {
    refs.scene.classList.add("is-shortcut");
    state.instruction = "Re-Lyte shortcut activated. All four electrolytes hit at once.";
    state.message = "All the key electrolytes, all at once.";
  } else if (count === 0) {
    state.instruction = "Water alone is slipping right through. Add electrolytes one by one.";
    state.message = "Water alone goes right through me!";
  } else if (count === ELECTROLYTES.length) {
    state.instruction = "Now the leak is tiny. Watch that hydration climb.";
    state.message = "This is way better!";
  } else {
    state.instruction = "Leak reduced. Add more electrolytes or try another sip.";
    state.message = "Okay, that stayed in a little longer.";
  }

  animateHydration(previewHydration, 520);
  render();

  queue(() => {
    state.hydration = retainedHydration;
    state.puddle = clamp(state.puddle + puddleDelta, 0, 100);
    animateHydration(retainedHydration, 860);
    render();
  }, 560);

  queue(finishDrink, 1450);
}

function addElectrolyte(id) {
  if (state.isDrinking || state.activeElectrolytes.includes(id)) return;

  const electrolyte = ELECTROLYTES.find((entry) => entry.id === id);
  state.activeElectrolytes = [...state.activeElectrolytes, id];
  pulseCharacter("is-popping", 420);

  if (hasAllElectrolytes()) {
    state.instruction = "All four electrolytes are active. Give him another drink.";
    state.message = "Ready for a real hydration win!";
    burstSparkles(12);
  } else {
    state.instruction = `${electrolyte.label} added. The leak will shrink on the next sip.`;
    state.message = `${electrolyte.label} is helping.`;
    burstSparkles(7);
  }

  render();
}

// Re-Lyte is the shortcut: activate everything immediately, then trigger a
// strong drink so the player sees the final state without clicking four items.
function useShortcut() {
  if (state.isDrinking) return;

  if (state.hydration >= 100 && hasAllElectrolytes()) {
    state.instruction = "Already fully hydrated. Hit replay to run it again.";
    state.message = "Fully hydrated!";
    burstSparkles(10);
    render();
    return;
  }

  state.activeElectrolytes = ELECTROLYTES.map(({ id }) => id);
  state.instruction = "Re-Lyte shortcut activated. All four electrolytes hit at once.";
  state.message = "All the key electrolytes, all at once.";
  refs.shortcutBtn.classList.add("is-firing");
  burstSparkles(22);
  pulseCharacter("is-popping", 420);
  render();

  queue(() => refs.shortcutBtn.classList.remove("is-firing"), 900);
  queue(() => drinkWater({ shortcut: true, forceCount: ELECTROLYTES.length }), 170);
}

function resetGame() {
  clearQueuedWork();
  refs.scene.classList.remove("is-drinking", "is-shortcut");
  refs.character.classList.remove("is-popping", "is-celebrating");
  refs.shortcutBtn.classList.remove("is-firing");
  refs.sparkleLayer.innerHTML = "";
  state = createInitialState();
  render();
}

refs.waterButtons.forEach((button) => {
  button.addEventListener("click", () => drinkWater());
});

refs.electrolyteButtons.forEach((button) => {
  button.addEventListener("click", () => addElectrolyte(button.dataset.electrolyte));
});

refs.shortcutBtn.addEventListener("click", useShortcut);
refs.resetBtn.addEventListener("click", resetGame);

render();
