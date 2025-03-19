async function(properties, context) {
  const axios = require("axios");
  const pdf = require("pdf-parse");

  // Vérifie et corrige l'URL du PDF si nécessaire
  function sanitizeUrl(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      if (url.startsWith("//")) {
        return "https:" + url;
      }
      return "https://" + url;
    }
    return url;
  }

  // Extrait le texte du PDF en utilisant pdf-parse
  async function extractTextWithPdfParse(pdfBuffer) {
    try {
      const data = await pdf(pdfBuffer);
      const text = data.text.trim();
      if (text) {
        return { success: true, text: text, info: "Texte extrait avec pdf-parse." };
      } else {
        return { success: false, text: "", info: "Aucun texte détecté avec pdf-parse." };
      }
    } catch (error) {
      return { success: false, text: "", info: "Erreur avec pdf-parse : " + error.message };
    }
  }

  // Télécharge le PDF et lance l'extraction du texte
  async function extractTextFromPDF(pdfUrl) {
    try {
      const validUrl = sanitizeUrl(pdfUrl);
      const response = await axios.get(validUrl, { responseType: "arraybuffer" });
      const pdfBuffer = Buffer.from(response.data, "binary");
      return await extractTextWithPdfParse(pdfBuffer);
    } catch (error) {
      return { success: false, text: "", info: "Erreur globale : " + error.message };
    }
  }

  // Fonction run_server appelée lors de l'exécution de l'action dans le workflow
  async function run_server() {
    try {
      let pdfUrl = properties.pdf; // URL du PDF fourni dans les propriétés
      const result = await extractTextFromPDF(pdfUrl);
      if (result.success) {
        return { text: result.text, info: result.info };
      } else {
        return { error: result.info };
      }
    } catch (error) {
      return { error: "Erreur lors de l'extraction : " + error.message };
    }
  }

  return await run_server();
}
