(function () {
  var config = window.KONDELIO_SITE || {};
  var contactEmail = config.contactEmail || "contact@hoopoe-solutions.com";
  var header = document.querySelector(".site-header");
  var toggle = document.getElementById("menu-toggle");
  var nav = document.getElementById("main-nav");
  var demoForm = document.getElementById("demo-form");
  var demoStatus = document.getElementById("demo-status");
  var year = document.getElementById("year");

  if (year) year.textContent = String(new Date().getFullYear());

  function closeMenu() {
    if (!toggle || !nav) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  var sectionLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  if (sectionLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    sectionLinks.forEach(function (link) {
      var id = (link.getAttribute("href") || "").replace("#", "");
      if (id) byId[id] = link;
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          sectionLinks.forEach(function (other) { other.classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  document.querySelectorAll(".faq-item").forEach(function (item) {
    var button = item.querySelector(".faq-question");
    if (!button) return;
    button.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item.is-open").forEach(function (other) {
        if (other === item) return;
        other.classList.remove("is-open");
        var otherButton = other.querySelector(".faq-question");
        if (otherButton) otherButton.setAttribute("aria-expanded", "false");
      });
      item.classList.toggle("is-open", !open);
      button.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });

  function setFieldError(input, message) {
    var error = document.getElementById(input.id + "-error");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    input.classList.toggle("is-invalid", Boolean(message));
    if (!error) return;
    error.hidden = !message;
    error.textContent = message || "";
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (demoForm && demoStatus) {
    var submitButton = demoForm.querySelector("[type=submit]");
    var endpoint = String(config.contactEndpoint || "").trim();
    if (submitButton && !endpoint) submitButton.textContent = "Préparer la demande";

    Array.prototype.forEach.call(demoForm.elements, function (field) {
      if (!field.id) return;
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") setFieldError(field, "");
      });
    });

    demoForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(demoForm);
      var name = String(data.get("name") || "").trim();
      var school = String(data.get("school") || "").trim();
      var email = String(data.get("email") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var message = String(data.get("message") || "").trim();
      var firstInvalid = null;

      function check(id, ok, text) {
        var input = document.getElementById(id);
        if (!input) return;
        setFieldError(input, ok ? "" : text);
        if (!ok && !firstInvalid) firstInvalid = input;
      }

      check("name", name.length >= 2, "Indiquez votre nom.");
      check("school", school.length >= 2, "Indiquez le nom de l’auto-école.");
      check("email", validEmail(email), "Indiquez un email valide.");
      check("phone", phone === "" || phone.replace(/\D/g, "").length >= 8, "Indiquez un téléphone d’au moins 8 chiffres, ou laissez le champ vide.");

      if (firstInvalid) {
        demoStatus.hidden = false;
        demoStatus.className = "form-status is-error";
        demoStatus.textContent = "Certains champs sont incomplets. Corrigez-les avant de continuer.";
        firstInvalid.focus();
        return;
      }

      if (!endpoint) {
        var body = [
          "Nom : " + name,
          "Auto-école : " + school,
          "Email : " + email,
          "Téléphone : " + (phone || "non indiqué"),
          "",
          message || "Je souhaite une démonstration de Kondelio."
        ].join("\n");
        var mailto = "mailto:" + contactEmail + "?subject=" + encodeURIComponent("Démonstration Kondelio — " + school) + "&body=" + encodeURIComponent(body);
        demoStatus.hidden = false;
        demoStatus.className = "form-status is-info";
        demoStatus.textContent = "";
        var ready = document.createElement("span");
        ready.textContent = "La demande est vérifiée dans votre navigateur. Aucun serveur ne l’a reçue. ";
        var link = document.createElement("a");
        link.href = mailto;
        link.textContent = "Ouvrir l’email prérempli";
        demoStatus.appendChild(ready);
        demoStatus.appendChild(link);
        demoStatus.appendChild(document.createTextNode(" ou écrivez à " + contactEmail + "."));
        return;
      }

      if (submitButton) submitButton.disabled = true;
      demoStatus.hidden = false;
      demoStatus.className = "form-status is-info";
      demoStatus.textContent = "Envoi en cours…";

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name: name, school: school, email: email, phone: phone, message: message })
      }).then(function (response) {
        if (!response.ok) throw new Error("status");
        demoStatus.className = "form-status is-success";
        demoStatus.textContent = "La demande a bien été transmise. Hoopoe Solutions vous répondra à l’adresse indiquée.";
        demoForm.reset();
      }).catch(function () {
        demoStatus.className = "form-status is-error";
        demoStatus.textContent = "L’envoi vers le serveur a échoué. Aucune demande n’a été confirmée. Écrivez à " + contactEmail + ".";
      }).then(function () {
        if (submitButton) submitButton.disabled = false;
      });
    });
  }

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
