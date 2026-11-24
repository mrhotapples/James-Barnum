/* ==========================================================
   quiz.js — drives the 60-second quiz on video_editing.html
   ========================================================== */
(function () {
  "use strict";

  // ---------- EDIT ME ----------
  // 1) FORM_ENDPOINT: where answers get sent. A Formspree URL looks like
  //    "https://formspree.io/f/abcdwxyz". Google Forms / Basin / Getform also work
  //    as long as they accept a JSON or form POST. Leave "" while testing.
  const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbx2h5TM6EJk-VQBMKEzYSEnEz0Rv4QIBjJ0w97GprvZj8JYDPoHp-0EnzrQPn5rp6jh/exec";

  // 2) BOOKING_URL: your Calendly / Cal.com / SavvyCal link. Shown after submit.
  const BOOKING_URL = "";
  // -----------------------------

  const form = document.getElementById("quiz");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".step"));
  const bar = form.querySelector(".quiz-progress div");
  let index = 0; // 0 = intro, 1..N = questions, last = done
  const QUESTION_COUNT = steps.length - 2; // minus intro and done

  function show(i) {
    index = i;
    steps.forEach(function (s, n) { s.classList.toggle("active", n === i); });
    bar.style.width = Math.min(100, Math.round((i / (steps.length - 1)) * 100)) + "%";
    form.querySelectorAll(".error").forEach(function (el) { el.textContent = ""; });
    const focusable = steps[i].querySelector("input, textarea, button");
    if (focusable && i > 0) focusable.focus({ preventScroll: true });
  }

  function validate(i) {
    const step = steps[i];
    if (!step.hasAttribute("data-required")) return true;
    const radios = step.querySelectorAll('input[type="radio"]');
    if (radios.length) {
      return Array.from(radios).some(function (r) { return r.checked; }) || fail("Pick one to keep going.");
    }
    const fields = step.querySelectorAll("[required]");
    for (let k = 0; k < fields.length; k++) {
      const f = fields[k];
      if (!f.value.trim()) { f.focus(); return fail("Please fill in this field."); }
      if (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim())) {
        f.focus();
        return fail("That email doesn't look right.");
      }
    }
    return true;
  }

  function fail(msg) {
    const el = steps[index].querySelector(".error");
    if (el) el.textContent = msg;
    return false;
  }

  function collect() {
    const data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    return data;
  }

  function finish() {
    const done = steps[steps.length - 1];
    const book = done.querySelector("[data-booking]");
    const fallback = done.querySelector("[data-no-booking]");
    if (BOOKING_URL) {
      book.href = BOOKING_URL;
      book.hidden = false;
      fallback.hidden = true;
    } else {
      book.hidden = true;
      fallback.hidden = false;
    }
    show(steps.length - 1);
  }

  function submit() {
    const btn = form.querySelector("[data-submit]");
    const data = collect();

    if (!FORM_ENDPOINT) {
      console.warn("[quiz] FORM_ENDPOINT is empty — answers were NOT sent anywhere:", data);
      finish();
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending…";
    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        finish();
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = "Send my answers";
        fail("Something went wrong sending that. Please try again.");
      });
  }

  form.addEventListener("click", function (e) {
    const t = e.target.closest("[data-action]");
    if (!t) return;
    const action = t.getAttribute("data-action");
    if (action === "start") show(1);
    if (action === "back" && index > 1) show(index - 1);
    if (action === "next" && validate(index)) show(index + 1);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (index === QUESTION_COUNT && validate(index)) submit();
  });

  // Enter key on single-line fields advances instead of submitting early
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "radio" && index < QUESTION_COUNT) {
      e.preventDefault();
      if (validate(index)) show(index + 1);
    }
  });

  show(0);
})();
