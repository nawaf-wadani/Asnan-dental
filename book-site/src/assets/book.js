/*
 * Booking form for book.asnandental.ca (one clinic per page, no clinic choice).
 *
 * - Copies ad parameters (gclid, utm_*, ...) from the page URL into hidden fields,
 *   and records where the visitor came from the same way newpatients does.
 * - Keeps the page's query string on internal links and on the thank-you redirect.
 * - Sends the form to Netlify Forms. Only after Netlify accepts it does it store a
 *   one-time token and go to the clinic's thank-you page. That page fires the
 *   conversion only when it finds (and removes) the token, so the conversion fires
 *   once per real submission and never on a direct visit or a reload.
 *
 * No clinic-specific tracking here, and nothing depends on gtag or the Meta Pixel.
 */
(function () {
  "use strict";

  var query = window.location.search;
  var params = new URLSearchParams(query);

  // Internal links keep the ad's query string.
  Array.prototype.forEach.call(document.querySelectorAll("a[data-keep-query]"), function (a) {
    if (query) a.setAttribute("href", a.getAttribute("href").split("?")[0] + query);
  });

  var form = document.getElementById("booking");
  if (!form) return;

  var cfg = form.dataset;
  var formError = document.getElementById("form-error");
  var submitBtn = document.getElementById("submit");
  var buttonLabel = submitBtn.textContent;
  var sending = false;

  function digits(v) { return String(v || "").replace(/\D/g, ""); }
  function nationalDigits(v) {
    var d = digits(v);
    return d.length === 11 && d.charAt(0) === "1" ? d.slice(1) : d;
  }
  function prettyPhone(v) {
    var d = nationalDigits(v);
    return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : String(v || "").trim();
  }

  // ----- Campaign tracking -----
  // Ad tags from the URL win; otherwise reuse the ones seen earlier this session
  // (for example after a reload without the query string).
  var AD_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid"];
  var tracking = (function () {
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem("asnanCampaign") || "{}"); } catch (e) { stored = {}; }
    var fresh = {};
    AD_KEYS.forEach(function (k) { if (params.get(k)) fresh[k] = params.get(k).slice(0, 500); });
    var t = Object.keys(fresh).length ? fresh : stored;
    if (!t.referrer && document.referrer) {
      try {
        var host = new URL(document.referrer).hostname;
        if (host && host !== location.hostname) t.referrer = host;
      } catch (e) { /* ignore */ }
    }
    try { sessionStorage.setItem("asnanCampaign", JSON.stringify(t)); } catch (e) { /* storage blocked */ }
    return t;
  })();

  // Same wording as newpatients.asnandental.ca, so both sites read alike in the tracker.
  function cameFrom(t) {
    var src = (t.utm_source || "").toLowerCase();
    var ref = t.referrer || "";
    var isMeta = !!t.fbclid || /^(fb|facebook|ig|instagram|meta|an|msg|messenger)$/.test(src) ||
      /(^|\.)(facebook|instagram)\.com$/.test(ref);
    var where = /^(ig|instagram)$/.test(src) || /instagram/.test(ref) ? " (Instagram)" :
      /^(fb|facebook)$/.test(src) || /facebook/.test(ref) ? " (Facebook)" : "";
    if ((t.utm_medium || "").toLowerCase() === "qr") return "QR poster: " + (t.utm_campaign || t.utm_source || "unknown");
    if (isMeta) return "Meta ad" + where;
    if (t.gclid || t.gbraid || t.wbraid) return "Google ad";
    if (t.utm_source) return "Link tagged " + t.utm_source;
    if (ref) return "Link from " + ref;
    return "Typed or untagged link";
  }

  function setValue(name, value) {
    var el = form.elements.namedItem(name);
    if (el) el.value = value || "";
  }
  AD_KEYS.forEach(function (k) { setValue(k, tracking[k]); });
  setValue("came_from", cameFrom(tracking));
  setValue("landing_page", (location.pathname + query).slice(0, 500));

  // ----- Validation -----
  function setError(name, message) {
    var box = document.getElementById(name + "-error");
    if (box) box.textContent = message;
    var field = form.elements.namedItem(name);
    if (field && field.setAttribute) {
      if (message) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }
  }

  var rules = {
    name: function () { return form.elements.name.value.trim() ? "" : "Enter your name."; },
    phone: function () {
      var v = form.elements.phone.value.trim();
      if (!v) return "Enter your phone number.";
      return nationalDigits(v).length === 10 ? "" : "Enter a 10-digit phone number.";
    },
    email: function () {
      var v = form.elements.email.value.trim();
      if (!v) return "Enter your email.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Check your email address.";
    },
    consent: function () { return form.elements.consent.checked ? "" : "Please tick this box."; },
  };

  function validate(name) {
    var msg = rules[name]();
    setError(name, msg);
    return msg;
  }

  ["name", "phone", "email"].forEach(function (name) {
    var el = form.elements[name];
    el.addEventListener("blur", function () {
      if (name === "phone" && el.value.trim()) el.value = prettyPhone(el.value);
      if (el.value.trim() || el.getAttribute("aria-invalid")) validate(name);
    });
    el.addEventListener("input", function () {
      if (el.getAttribute("aria-invalid") && !rules[name]()) setError(name, "");
    });
  });
  form.elements.consent.addEventListener("change", function () {
    if (form.elements.consent.checked) setError("consent", "");
  });

  // ----- Submit -----
  function newId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
  }

  // One-time token for the thank-you page: "<submission id>|<request type>".
  function remember(id) {
    var key = "asnan-submission-" + cfg.clinic;
    var value = id + "|" + (cfg.subject || "New patient request");
    try {
      sessionStorage.setItem(key, value);
      return;
    } catch (e) { /* storage blocked: use a short-lived cookie instead */ }
    document.cookie = key + "=" + encodeURIComponent(value) + "; Max-Age=900; Path=/" + cfg.clinic + "/; Secure; SameSite=Lax";
  }

  function setBusy(busy) {
    sending = busy;
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? "Sending your request…" : buttonLabel;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    formError.hidden = true;

    var firstBad = null;
    Object.keys(rules).forEach(function (name) {
      if (validate(name) && !firstBad) firstBad = name;
    });
    if (firstBad) {
      var target = form.elements[firstBad];
      target.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      target.focus({ preventScroll: true });
      return;
    }

    var id = newId();
    setValue("ref", id);
    form.elements.phone.value = prettyPhone(form.elements.phone.value);

    var data = new FormData(form);
    var body = new URLSearchParams();
    data.forEach(function (value, key) {
      if (key !== "preferred_days") body.append(key, value);
    });
    body.set("preferred_days", data.getAll("preferred_days").join(", ") || "Any day");
    // Notification subject, e.g. "New patient request: Sara Haddad, Hazeldean, from Google ad".
    var source = form.elements.came_from.value;
    var tag = /^(Meta ad|Google ad|QR poster)/.test(source) ? ", from " + source : "";
    body.set("subject", (cfg.subject + ": " + form.elements.name.value.trim() + ", " + cfg.clinicName + tag).slice(0, 150));

    setBusy(true);
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 20000) : null;

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) throw new Error("Status " + res.status);
        remember(id);
        window.location.assign(cfg.thanks + query);
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        setBusy(false);
        formError.textContent = "Your request didn't send. Check your internet connection and try again.";
        formError.hidden = false;
        formError.scrollIntoView({ block: "center" });
      });
  });

  // Coming back with the Back button can restore this page from cache: unlock the form.
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) setBusy(false);
  });
})();
