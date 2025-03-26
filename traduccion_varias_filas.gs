function mostrarFormularioTraduccion() {
  const html = HtmlService.createHtmlOutputFromFile("formulario")
    .setWidth(400)
    .setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, "Traducción con Gemini");
}

function procesarTraduccionesGemini(dato) {
  const apiKey = "AIzaSyCuK35Z9AB4C2pgBkdJadl-EUmXK8MHJWY";
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rango = hoja.getActiveRange();
  const filaOrigen = rango.getRow();
  const columnaInicio = rango.getColumn();
  const numColumnas = rango.getNumColumns();
  const idiomas = dato.idiomas;
  const cantidad = idiomas.length;

  const idiomasMap = {
    "español": "Spanish", "ingles": "English", "inglés": "English",
    "frances": "French", "francés": "French", "aleman": "German", "alemán": "German",
    "italiano": "Italian", "portugués": "Portuguese", "portugues": "Portuguese",
    "neerlandés": "Dutch", "holandés": "Dutch", "japonés": "Japanese",
    "chino": "Chinese", "ruso": "Russian", "sueco": "Swedish", "polaco": "Polish",
    "en": "English", "fr": "French", "de": "German", "it": "Italian",
    "pt": "Portuguese", "nl": "Dutch", "ja": "Japanese", "zh": "Chinese",
    "ru": "Russian", "se": "Swedish", "pl": "Polish", "be": "Dutch", "uk": "English"
  };

  const textosOriginales = [];
  for (let i = 0; i < numColumnas; i++) {
    textosOriginales.push(hoja.getRange(filaOrigen, columnaInicio + i).getValue());
  }

  for (let i = 0; i < cantidad; i++) {
    const idioma = idiomas[i].toLowerCase().trim();
    const idiomaDestino = idiomasMap[idioma] || idioma;
    const filaDestino = filaOrigen + 1 + i;

    const prompt = `Traduce el siguiente texto al idioma "${idiomaDestino}" profesional optimizado para SEO, manteniendo el formato.
Devuelve solo el texto traducido sin un punto al final.`;

    for (let j = 0; j < numColumnas; j++) {
      const texto = textosOriginales[j];
      if (texto && texto.toString().trim() !== "") {
        const traduccion = obtenerTraduccionDesdeGemini(texto, prompt, apiKey);
        if (traduccion) {
          hoja.getRange(filaDestino, columnaInicio + j).setValue(traduccion);
        } else {
          hoja.getRange(filaDestino, columnaInicio + j).setValue("⚠️ Error");
        }
      }
    }
  }

  return "✅ Traducción completada.";
}

function obtenerTraduccionDesdeGemini(texto, prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: `${prompt}\n\n${texto}` }]
    }]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const status = response.getResponseCode();

    if (status !== 200) {
      Logger.log(`Error de Gemini (${status}): ${response.getContentText()}`);
      return null;
    }

    const json = JSON.parse(response.getContentText());
    const traduccion = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return traduccion?.replace(/^["“]+|["”]+$/g, "") || null;

  } catch (error) {
    Logger.log("Error en llamada a Gemini: " + error);
    return null;
  }
}
