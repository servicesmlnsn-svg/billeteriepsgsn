/* =======================================================================
   CONFIGURATION — PSG Fan Club Sénégal — Billetterie Fanzone
   -----------------------------------------------------------------------
   👉 C'EST LE SEUL FICHIER QUE TU DOIS MODIFIER pour configurer le site.
   Modifie les valeurs ci-dessous puis sauvegarde. Aucune compétence
   technique nécessaire.
   ======================================================================= */

const CONFIG = {

  /* ---- PRIX D'UN TICKET (en FCFA) ---- */
  PRIX_TICKET: 5000,

  /* ---- NOMBRE MAX DE TICKETS PAR PERSONNE ---- */
  MAX_TICKETS: 10,

  /* ---- LIEN DE PAIEMENT WAVE ----
     Mets ici TON lien de paiement Wave.
     Pour le créer :
       1. Ouvre l'app Wave Business (ou Wave)
       2. Crée un lien de paiement / QR code
       3. Copie le lien (il ressemble à https://pay.wave.com/m/XXXX/c/sn/ )
     Si tu n'as qu'un numéro Wave, mets par ex :
       "https://wa.me/221770000000" ou laisse le numéro affiché.        */
  WAVE_LIEN: "https://pay.wave.com/m/M_v6rwCzRuoFoJ",

  /* ---- NUMÉRO WAVE (affiché en secours si pas de lien) ---- */
  WAVE_NUMERO: "77 762 13 51",

  /* ---- PRÉFIXE DES NUMÉROS DE TICKET ----
     Exemple : "PSG" + numéro + "F"  ->  #PSG0065F                       */
  TICKET_PREFIXE: "PSG",
  TICKET_SUFFIXE: "F",

  /* ---- URL DU GOOGLE APPS SCRIPT ----
     Tu obtiendras cette URL en suivant le fichier GUIDE-DEPLOIEMENT.md
     (étape Google Sheets). Elle ressemble à :
       https://script.google.com/macros/s/AKfyc..../exec
     Tant qu'elle n'est pas remplie, le ticket s'affiche quand même
     mais n'est PAS enregistré dans Google Sheets.                       */
  SHEET_URL: "https://pay.wave.com/m/M_sn_3y99BcoMKwC-/c/sn/?amount=5000",
};
