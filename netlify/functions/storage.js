// Fonction serverless Netlify : sert de base de données partagée pour l'outil de
// présences ASVB Bièville-Beuville, en utilisant Netlify Blobs comme stockage clé/valeur.
//
// Le client (presences.html) l'appelle via fetch() sur /.netlify/functions/storage :
//   GET  ?action=get&key=...        -> { value: string|null }
//   GET  ?action=list&prefix=...    -> { keys: string[] }
//   POST { key, value }             -> { ok: true }
//
// Toutes les données (effectifs, calendrier, présences, responsables) sont stockées
// dans un seul "store" Netlify Blobs nommé "asvb-presences", une clé par entrée,
// exactement comme sur Claude.ai (même schéma de clés : "attendance:team1:2026-10-05", etc.)

const { getStore, connectLambda } = require("@netlify/blobs");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    // OBLIGATOIRE avec les fonctions Netlify "classiques" (exports.handler) : sans cet
    // appel, l'environnement Netlify Blobs (siteID/token) n'est pas configuré et
    // getStore() échoue systématiquement, même en production. C'était le bug initial.
    connectLambda(event);
    const store = getStore({ name: "asvb-presences", consistency: "strong" });

    if (event.httpMethod === "GET") {
      const params = event.queryStringParameters || {};

      if (params.action === "list") {
        const prefix = params.prefix || "";
        const { blobs } = await store.list({ prefix });
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ keys: blobs.map((b) => b.key) })
        };
      }

      // action=get (par défaut)
      const key = params.key;
      if (!key) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Paramètre 'key' manquant" }) };
      }
      const value = await store.get(key);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ value: value === null ? null : value })
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { key, value } = body;
      if (!key) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Paramètre 'key' manquant" }) };
      }
      await store.set(key, value);
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: String((err && err.message) || err) })
    };
  }
};
