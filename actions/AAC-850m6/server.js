async function(properties, context) {
  const axios = require('axios');
  const pdf = require('pdf-parse');

  // Fonction pour vérifier et corriger l'URL du PDF si nécessaire
  function sanitizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.startsWith('//')) {
        return 'https:' + url;
      }
      return 'https://' + url;
    }
    return url;
  }

  // Fonction pour extraire du texte avec pdf-parse
  async function extractTextWithPdfParse(pdfBuffer) {
    try {
      const data = await pdf(pdfBuffer);
      const text = data.text.trim();
      if (text) {
        return { success: true, text, info: 'Texte extrait avec pdf-parse.' };
      } else {
        return { success: false, text: '', info: 'Aucun texte détecté avec pdf-parse.' };
      }
    } catch (error) {
      return { success: false, text: '', info: `Erreur avec pdf-parse : ${error.message}` };
    }
  }

  // Fonction principale pour télécharger et extraire le texte du PDF
  async function extractTextFromPDF(pdfUrl) {
    try {
      const validUrl = sanitizeUrl(pdfUrl);
      const response = await axios.get(validUrl, { responseType: 'arraybuffer' });
      const pdfBuffer = Buffer.from(response.data, 'binary');
      return await extractTextWithPdfParse(pdfBuffer);
    } catch (error) {
      return { success: false, text: '', info: `Erreur globale : ${error.message}` };
    }
  }

  // Définition de la fonction run_server exécutée lors de l'action dans le workflow
  async function run_server(properties, context) {
    try {
      const pdfUrl = properties.pdf; // URL du PDF fourni dans les propriétés
      const result = await extractTextFromPDF(pdfUrl);
      return result.success 
        ? { text: result.text, info: result.info } 
        : { error: result.info };
    } catch (error) {
      return { error: 'Erreur lors de l\'extraction : ' + error.message };
    }
  }

  return run_server(properties, context);
}
