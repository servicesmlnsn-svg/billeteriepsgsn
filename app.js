/* =======================================================================
   APP — PSG Fan Club Sénégal — Billetterie Fanzone
   Logique : validation, génération du n° de ticket, envoi Google Sheets
   ⚠️  Ne pas modifier ce fichier — tout se règle dans config.js
   ======================================================================= */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => n.toLocaleString("fr-FR").replace(/\u202f/g, " ") + " FCFA";

  /* ---------- Éléments ---------- */
  const prenom   = $("prenom");
  const nom      = $("nom");
  const tel      = $("tel");
  const qtyVal   = $("qtyVal");
  const totalEl  = $("totalAmount");
  const bandEl   = $("bandPrice");
  const waveLink = $("waveLink");
  const shotIn   = $("shotInput");
  const upZone   = $("uploadZone");
  const fileName = $("fileName");
  const preview  = $("preview");
  const prevImg  = $("previewImg");
  const submit   = $("submitBtn");
  const errBox   = $("errBox");
  const formCard = $("formCard");
  const ticketW  = $("ticketWrap");

  let qty = 1;
  let shotDataUrl = null;
  let shotFile = null;

  /* ---------- Init affichage prix ---------- */
  bandEl.textContent = fmt(CONFIG.PRIX_TICKET);
  waveLink.href = CONFIG.WAVE_LIEN;
  updateTotal();

  function updateTotal() {
    qtyVal.textContent = qty;
    totalEl.textContent = fmt(qty * CONFIG.PRIX_TICKET);
  }

  /* ---------- Quantité ---------- */
  $("plus").addEventListener("click", () => {
    if (qty < CONFIG.MAX_TICKETS) { qty++; updateTotal(); }
  });
  $("minus").addEventListener("click", () => {
    if (qty > 1) { qty--; updateTotal(); }
  });

  /* ---------- Upload capture ---------- */
  upZone.addEventListener("click", () => shotIn.click());

  shotIn.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      showError("Le fichier doit être une image (JPG ou PNG).");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      showError("L'image dépasse 5 Mo. Choisissez une image plus légère.");
      return;
    }

    shotFile = f;
    hideError();
    const reader = new FileReader();
    reader.onload = (ev) => {
      shotDataUrl = ev.target.result;
      prevImg.src = shotDataUrl;
      preview.style.display = "block";
      upZone.classList.add("has");
      fileName.textContent = "✓ " + f.name;
    };
    reader.readAsDataURL(f);
  });

  /* ---------- Erreurs ---------- */
  function showError(msg) {
    errBox.textContent = msg;
    errBox.style.display = "block";
    errBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function hideError() {
    errBox.style.display = "none";
  }

  /* ---------- Génération numéro de ticket ----------
     Format : #PSG0065F  (préfixe + 4 chiffres + suffixe)
     Le compteur est tiré aléatoirement + horodaté pour limiter les
     collisions côté client ; la séquence "officielle" reste la ligne
     Google Sheets. */
  function genTicketNumber() {
    const stored = parseInt(localStorage.getItem("psg_ticket_seq") || "0", 10);
    let next = stored + 1;
    // Si jamais le localStorage est vide (nouvel appareil), on part d'un
    // nombre basé sur l'heure pour éviter de retomber sur #0001.
    if (stored === 0) {
      next = (Math.floor(Date.now() / 1000) % 9000) + 1;
    }
    localStorage.setItem("psg_ticket_seq", String(next));
    const num = String(next).padStart(4, "0");
    return "#" + CONFIG.TICKET_PREFIXE + num + CONFIG.TICKET_SUFFIXE;
  }

  /* ---------- Validation téléphone (Sénégal souple) ---------- */
  function cleanPhone(v) {
    return v.replace(/[^\d+]/g, "");
  }
  function validPhone(v) {
    const c = cleanPhone(v);
    return c.length >= 9 && c.length <= 15;
  }

  /* ---------- Soumission ---------- */
  submit.addEventListener("click", async () => {
    hideError();

    const p = prenom.value.trim();
    const n = nom.value.trim();
    const t = tel.value.trim();

    if (!p) return showError("Veuillez saisir votre prénom.");
    if (!n) return showError("Veuillez saisir votre nom.");
    if (!t) return showError("Veuillez saisir votre numéro de téléphone.");
    if (!validPhone(t)) return showError("Numéro de téléphone invalide. Vérifiez le format.");
    if (!shotFile) return showError("La capture d'écran du paiement Wave est obligatoire.");

    submit.disabled = true;
    submit.classList.add("loading");

    const ticketNum = genTicketNumber();
    const montant = qty * CONFIG.PRIX_TICKET;
    const now = new Date();

    const payload = {
      ticket:   ticketNum,
      prenom:   p,
      nom:      n,
      telephone: t,
      quantite: qty,
      montant:  montant,
      date:     now.toLocaleString("fr-FR"),
      match:    "PSG vs Arsenal — Finale CL 30/05/2026",
      preuve:   shotDataUrl, // image base64 (envoyée à Google Drive via le script)
      fichier:  shotFile.name,
    };

    try {
      await sendToSheet(payload);
    } catch (err) {
      // On n'empêche pas l'utilisateur d'avoir son ticket même si le
      // réseau Google échoue : le club pourra retrouver la preuve via Wave.
      console.error("Erreur enregistrement Sheet :", err);
    }

    showTicket(payload);
  });

  /* ---------- Envoi vers Google Apps Script ---------- */
  function sendToSheet(payload) {
    if (!CONFIG.SHEET_URL || CONFIG.SHEET_URL.indexOf("REMPLACE-MOI") !== -1) {
      // Pas encore configuré : on ne bloque pas.
      return Promise.resolve();
    }
    return fetch(CONFIG.SHEET_URL, {
      method: "POST",
      mode: "no-cors", // Apps Script renvoie sans CORS ; réponse opaque OK
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  }

  /* ---------- Affichage du ticket ---------- */
  function showTicket(d) {
    $("ticketNumber").textContent = d.ticket;
    $("tName").textContent  = d.prenom + " " + d.nom;
    $("tPhone").textContent = d.telephone;
    $("tQty").textContent   = d.quantite + (d.quantite > 1 ? " tickets" : " ticket");
    $("tAmount").textContent = fmt(d.montant);

    formCard.style.display = "none";
    ticketW.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Nouvelle réservation ---------- */
  $("againBtn").addEventListener("click", () => {
    prenom.value = "";
    nom.value = "";
    tel.value = "";
    qty = 1;
    updateTotal();
    shotFile = null;
    shotDataUrl = null;
    shotIn.value = "";
    preview.style.display = "none";
    upZone.classList.remove("has");
    fileName.textContent = "";
    submit.disabled = false;
    submit.classList.remove("loading");
    ticketW.style.display = "none";
    formCard.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
      });
})();