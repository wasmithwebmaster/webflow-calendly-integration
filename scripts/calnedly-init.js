(() => {
  const form = document.querySelector("form");
  if (!form) return;

  document.addEventListener("click", (e) => {
    const next = e.target.closest('[data-form="next-btn"]');
    if (!next) return;
    const current = getCurrentStep(form);
    if (current?.getAttribute("data-step") !== "info" || current.dataset.submitted) return;
    e.preventDefault();
    const formData = new FormData(form);
    fetch(form.action, { method: "POST", body: formData })
      .then((resp) => {
        if (resp.ok) {
          current.dataset.submitted = "true";
          next.click();
        } else {
          alert("Submission failed");
        }
      })
      .catch(() => alert("Error"));
  });

  const calSteps = form.querySelectorAll('[data-step^="cal-"]');
  calSteps.forEach((step) => {
    const observer = new MutationObserver(() => {
      if (getComputedStyle(step).display !== "none" && !step.dataset.inited) {
        step.dataset.inited = "true";
        const container = step.querySelector(".calendly-container");
        const loc = step.getAttribute("data-step").split("-")[1];
        const urls = {
          sheffield: "https://calendly.com/your-sheffield-event",
          sandusky: "https://calendly.com/your-sandusky-event",
          independence: "https://calendly.com/your-independence-event",
          sarasota: "https://calendly.com/your-sarasota-event",
          virtual: "https://calendly.com/your-virtual-event",
        };
        const url = urls[loc];
        const first = document.getElementById("first_name")?.value || "";
        const last = document.getElementById("last_name")?.value || "";
        const name = `${first} ${last}`.trim();
        const email = document.getElementById("email")?.value || "";
        const phone = document.getElementById("phone")?.value || "";
        const zip = document.getElementById("zip")?.value || "";
        const asset = document.getElementById("asset_range")?.value || "";
        const message = document.getElementById("message")?.value || "";
        Calendly.initInlineWidget({
          url,
          parentElement: container,
          prefill: { name, email, smsReminderNumber: phone },
          customAnswers: { a1: zip, a2: asset, a3: message },
        });
      }
    });
    observer.observe(step, { attributes: true, attributeFilter: ["style"] });
  });

  function getCurrentStep(form) {
    return [...form.querySelectorAll('[data-form="step"]')].find(
      (step) => getComputedStyle(step).display !== "none"
    );
  }
})();
