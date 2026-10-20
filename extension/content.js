/* RTX Video Companion - local processing only; DOES NOT activate NVIDIA DLSS/RTX APIs. */
(() => {
  "use strict";
  if (window.__rtxVideoCompanionLoaded) return;
  window.__rtxVideoCompanionLoaded = true;

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
  let managedVideo = null;
  let previousFilter = null;
  let previousFilterPriority = "";
  let theaterEnabledByUs = false;
  let svgFilter = null;
  let kernelElement = null;
  let scheduled = null;

  function getVideo() {
    const candidates = Array.from(document.querySelectorAll(
      "video.html5-main-video, #movie_player video, ytd-reel-video-renderer video, video"
    ));
    candidates.sort((a, b) => {
      const aa = a.getBoundingClientRect();
      const bb = b.getBoundingClientRect();
      return bb.width * bb.height - aa.width * aa.height;
    });
    return candidates.find(v => v.getBoundingClientRect().width > 100) || null;
  }

  function makeSvgFilter() {
    if (svgFilter?.isConnected) return;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.id = "rtx-companion-filter-root";
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.cssText = "position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;pointer-events:none!important";

    const filter = document.createElementNS(ns, "filter");
    filter.id = "rtx-companion-sharpen";
    filter.setAttribute("color-interpolation-filters", "sRGB");
    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", "1");
    filter.setAttribute("height", "1");
    const convolve = document.createElementNS(ns, "feConvolveMatrix");
    convolve.setAttribute("order", "3");
    convolve.setAttribute("edgeMode", "duplicate");
    convolve.setAttribute("preserveAlpha", "true");
    convolve.setAttribute("divisor", "1");
    filter.appendChild(convolve);
    svg.appendChild(filter);
    (document.body || document.documentElement).appendChild(svg);
    svgFilter = svg;
    kernelElement = convolve;
  }

  function releaseManagedVideo() {
    if (managedVideo?.isConnected) {
      if (previousFilter) {
        managedVideo.style.setProperty("filter", previousFilter, previousFilterPriority);
      } else {
        managedVideo.style.removeProperty("filter");
      }
    }
    managedVideo = null;
    previousFilter = null;
    previousFilterPriority = "";
  }

  function applyVideoFilter() {
    const video = getVideo();
    if (video !== managedVideo) {
      releaseManagedVideo();
      managedVideo = video;
      if (video) {
        previousFilter = video.style.getPropertyValue("filter");
        previousFilterPriority = video.style.getPropertyPriority("filter");
      }
    }
    if (!video) return;

    if (!settings.enabled) {
      if (previousFilter) {
        video.style.setProperty("filter", previousFilter, previousFilterPriority);
      } else {
        video.style.removeProperty("filter");
      }
      return;
    }

    const functions = [];
    if (settings.sharpness > 0) {
      makeSvgFilter();
      const factor = settings.sharpness / 200;
      const f = n => Number(n.toFixed(4));
      kernelElement.setAttribute("kernelMatrix", `0 ${f(-factor)} 0 ${f(-factor)} ${f(1 + 4 * factor)} ${f(-factor)} 0 ${f(-factor)} 0`);
      functions.push("url(#rtx-companion-sharpen)");
    }
    if (settings.contrast !== 100) functions.push(`contrast(${settings.contrast}%)`);
    if (settings.saturation !== 100) functions.push(`saturate(${settings.saturation}%)`);
    if (settings.brightness !== 100) functions.push(`brightness(${settings.brightness}%)`);
    const value = functions.join(" ");

    if (value) video.style.setProperty("filter", value, "important");
    else if (previousFilter) video.style.setProperty("filter", previousFilter, previousFilterPriority);
    else video.style.removeProperty("filter");
  }

  function maybeSetTheater() {
    // Do not alter native rendering or interfere with a user's existing theater setting.
    const flexy = document.querySelector("ytd-watch-flexy");
    const theaterButton = document.querySelector(".ytp-size-button");
    if (!flexy || !theaterButton || document.fullscreenElement) return;
    const isTheater = flexy.hasAttribute("theater");
    if (settings.cinema && !isTheater) {
      theaterButton.click();
      theaterEnabledByUs = true;
    } else if (!settings.cinema && theaterEnabledByUs && isTheater) {
      theaterButton.click();
      theaterEnabledByUs = false;
    } else if (!settings.cinema) {
      theaterEnabledByUs = false;
    }
  }

  function apply() {
    applyVideoFilter();
    maybeSetTheater();
  }

  function scheduleApply() {
    if (scheduled !== null) return;
    scheduled = setTimeout(() => {
      scheduled = null;
      apply();
    }, 280);
  }

  function status() {
    const video = getVideo();
    if (!video) return {
      found: false,
      message: "Apri un video YouTube e avvia la riproduzione."
    };
    const rect = video.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const sourceWidth = Math.round(video.videoWidth || 0);
    const sourceHeight = Math.round(video.videoHeight || 0);
    const displayWidth = Math.round(rect.width * dpr);
    const displayHeight = Math.round(rect.height * dpr);
    const ratio = sourceWidth && sourceHeight ? Math.max(
      displayWidth / sourceWidth, displayHeight / sourceHeight
    ) : null;
    return {
      found: true,
      sourceWidth,
      sourceHeight,
      displayWidth,
      displayHeight,
      ratio: ratio ? Number(ratio.toFixed(2)) : null,
      upscaling: ratio !== null && ratio > 1.05,
      note: "Misura l'ingrandimento del video, NON lo stato di RTX Video Super Resolution."
    };
  }

  api.runtime.onMessage.addListener(message => {
    if (message?.type === "GET_STATUS") return Promise.resolve(status());
    if (message?.type === "REFRESH") {
      apply();
      return Promise.resolve(status());
    }
    return false;
  });

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes.settings) return;
    settings = { ...DEFAULTS, ...changes.settings.newValue };
    scheduleApply();
  });

  api.storage.local.get("settings").then(data => {
    settings = { ...DEFAULTS, ...(data.settings || {}) };
    apply();
  }).catch(() => { apply(); });

  document.addEventListener("yt-navigate-finish", scheduleApply);
  document.addEventListener("fullscreenchange", scheduleApply);
  document.addEventListener("loadedmetadata", scheduleApply, true);
  new MutationObserver(scheduleApply).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
