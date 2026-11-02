/**
 * Configuration publique du site Kondelio.
 * Ce fichier est lu par le navigateur : n'y placez aucune clé ni aucun mot de passe.
 *
 * contactEndpoint : URL https qui recevra la demande en POST JSON
 * { name, school, email, phone, message }.
 * Laisser une chaîne vide tant qu'aucun serveur n'est relié.
 * Dans ce cas, le formulaire ne prétend pas avoir envoyé la demande :
 * il propose seulement un email prérempli.
 */
window.KONDELIO_SITE = {
  contactEmail: "contact@hoopoe-solutions.com",
  contactEndpoint: ""
};
