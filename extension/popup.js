"use strict";
const api = globalThis.browser;
const DEFAULTS = Object.freeze({
  enabled: false,
  cinema: false,
  sharpness: 0,
  contrast: 100,
  saturation: 100,
  brightness: 100
});
let settings = { ...DEFAULTS };
const $ = id => document.getElementById(id);
const sliderIds = ["sharpness", "contrast", "saturation", "brightness"];

function render() {
  $("enabled").checked = Boolean(settings.enabled);
  $("cinema").checked = Boolean(settings.cinema);
  $("sliders").classList.toggle("is-disabled", !settings.enabled);
  for (const id of sliderIds) {
    $(id).value = settings[id];
    $(id).disabled = !settings.enabled;
    $(id + "Out").textContent = settings[id] + (id === "sharpness" ? "" : "%");
  }
}

async function persist() {
  try {
    await api.storage.local.set({ settings });
  } catch (e) {
    $("diagnosticText").textContent = "Impossibile salvare le preferenze: " + String(e?.message || e);
  }
}

for (const id of sliderIds) {
  $(id).addEventListener("input", () => {
    settings[id] = Number($(id).value);
    $(id + "Out").textContent = settings[id] + (id === "sharpness" ? "" : "%");
    void persist();
  });
}

for (const id of ["enabled", "cinema"]) {
  $(id).addEventListener("change", () => {
    settings[id] = $(id).checked;
    render();
    void persist();
  });
}

$("resetButton").addEventListener("click", () => {
  settings = { ...DEFAULTS };
  render();
  void persist();
});

$("guideButton").addEventListener("click", () => {
  $("guide").hidden = !$("guide").hidden;
});

async function refreshStatus() {
  const diagnostic = $("diagnosticText");
  diagnostic.textContent = "Controllo del video…";
  diagnostic.className = "result neutral";
  const reset = () => {
    for (const id of ["sourceValue", "displayValue", "scaleValue"]) $(id).textContent = "—";
  };
  try {
    const [tab] = await api.tabs.query({ currentWindow: true, active: true });
    if (!tab || !/^https:\/\/(www\.|m\.)?youtube\.com\//.test(tab.url || "")) {
      reset();
      diagnostic.textContent = "Questa scheda non è YouTube. Apri un video per leggere la risoluzione.";
      return;
    }
    const result = await api.tabs.sendMessage(tab.id, { type: "GET_STATUS" });
    if (!result?.found) {
      reset();
      diagnostic.textContent = result?.message || "Nessun video attivo trovato.";
      return;
    }
    $("sourceValue").textContent = result.sourceWidth ? `${result.sourceWidth}×${result.sourceHeight}` : "—";
    $("displayValue").textContent = `${result.displayWidth}×${result.displayHeight}`;
    $("scaleValue").textContent = result.ratio ? `${result.ratio}×` : "—";
    if (!result.ratio) {
      diagnostic.textContent = "Video rilevato. Avvia la riproduzione per leggere la risoluzione.";
    } else if (result.upscaling) {
      diagnostic.className = "result positive";
      diagnostic.textContent = "Il video viene ingrandito sullo schermo: RTX Video potrebbe migliorarne la resa, se attivo nell'app NVIDIA.";
    } else {
      diagnostic.className = "result neutral";
      diagnostic.textContent = "Il video non risulta ingrandito: potrebbe non servire un upscaling per questa dimensione del player.";
    }
  } catch (_e) {
    reset();
    diagnostic.textContent = "Non riesco a leggere il player. Ricarica la scheda YouTube e riprova.";
  }
}

$("refreshButton").addEventListener("click", () => { void refreshStatus(); });
api.storage.local.get("settings").then(data => {
  settings = { ...DEFAULTS, ...(data.settings || {}) };
  render();
}).catch(() => { render(); });
void refreshStatus();

// Communication is strictly popup -> local native host; no messages from web pages.
const SWAPPER_HOST = "org.rtx_companion.dlss5swapper";
let swapperBusy = false;
async function swapperMessage(action) {
  return api.runtime.sendNativeMessage(SWAPPER_HOST, { action });
}

async function checkSwapper() {
  const output = $("swapperStatus");
  output.className = "result neutral";
  output.textContent = "Verifica del bridge locale…";
  $("launchSwapperButton").disabled = true;
  try {
    const response = await swapperMessage("status");
    if (!response || response.ok !== true || response.capability !== "launcher_only") {
      output.className = "result negative";
      output.textContent = "Bridge non riconosciuto. Verifica la versione del componente Windows.";
      return;
    }
    if (response.available) {
      output.className = "result positive";
      output.textContent = "Bridge collegato. DLSS5-Swapper rilevato sul PC. Si può aprire l'app, non elaborare i video di YouTube.";
      $("launchSwapperButton").disabled = false;
    } else {
      output.className = "result negative";
      output.textContent = "Bridge collegato, ma Swapper non è stato trovato. Inserisci il percorso dell'EXE in bridge-windows/swapper_path.txt e reinstalla il bridge.";
    }
  } catch (error) {
    output.className = "result negative";
    output.textContent = "Bridge non installato o Firefox non riesce a collegarsi. Leggi il file ISTRUZIONI.md nel pacchetto completo.";
  }
}

$("checkSwapperButton").addEventListener("click", () => { void checkSwapper(); });
$("launchSwapperButton").addEventListener("click", async () => {
  if (swapperBusy) return;
  swapperBusy = true;
  $("launchSwapperButton").disabled = true;
  const output = $("swapperStatus");
  try {
    const response = await swapperMessage("launch");
    output.className = response?.ok ? "result positive" : "result negative";
    output.textContent = response?.ok
      ? "Avvio di DLSS5-Swapper richiesto. Questo non abilita DLSS nei video Firefox."
      : "Impossibile avviare l'app. Controlla il percorso e riprova.";
  } catch (_error) {
    output.className = "result negative";
    output.textContent = "Non riesco a contattare il componente Windows.";
  } finally {
    swapperBusy = false;
    $("launchSwapperButton").disabled = false;
  }
});
void checkSwapper();
