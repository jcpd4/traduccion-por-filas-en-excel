// 🧠 Función principal: genera palabras clave y las pega
function palabrasClave() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const celda = hoja.getActiveCell();
  const palabra = celda.getValue().toString().trim();

  if (!palabra) {
    SpreadsheetApp.getUi().alert("⚠️ Selecciona una celda con una palabra clave.");
    return;
  }

  const prompt = `Dame 20 palabras clave relacionadas con alto volumen de búsqueda sobre "${palabra}" con su volumen de busquedas en miles en el formato:
palabra clave | volumen

Después, dame 10 palabras clave de cola larga (más específicas) sobre el mismo tema con su volumen, también en formato:
cola larga | volumen

Ten en cuenta que son palabras clave enfocada en la venta de productos y no me sirven palabras como "gratis" "pdf" o cualquier otro similar hay que evitarlas.

No expliques nada más. Solo listas.`;

  const resultado = llamarAGemini(prompt);

  if (!resultado || resultado.includes("Error")) {
    SpreadsheetApp.getUi().alert("❌ No se pudo obtener la información de palabras clave.");
    return;
  }

  pegarPalabrasClave(resultado, celda);
}

// 🔄 Procesa el resultado de la IA y lo coloca en columnas
function pegarPalabrasClave(texto, celda) {
  const hoja = celda.getSheet();
  const fila = celda.getRow();
  const columnaBase = celda.getColumn();

  const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.includes('|'));

  let filaActual = fila;
  let modo = "relacionadas";

  for (const linea of lineas) {
    const [palabraClave, volumen] = linea.split('|').map(s => s.trim());

    if (modo === "relacionadas") {
      hoja.getRange(filaActual, columnaBase + 1).setValue(palabraClave);
      hoja.getRange(filaActual, columnaBase + 2).setValue(volumen);
    } else {
      hoja.getRange(filaActual, columnaBase + 3).setValue(palabraClave);
      hoja.getRange(filaActual, columnaBase + 4).setValue(volumen);
    }

    filaActual++;

    if (filaActual - fila === 20 && modo === "relacionadas") {
      filaActual = fila;
      modo = "cola_larga";
    }
  }
}

// 🌐 Llama a Gemini correctamente con su estructura
function llamarAGemini(prompt) {
  const apiKey = "AIzaSyCuK35Z9AB4C2pgBkdJadl-EUmXK8MHJWY";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: prompt }]
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
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 200) {
      Logger.log(`❌ Error de Gemini (${responseCode}): ${responseText}`);
      return null;
    }

    const json = JSON.parse(responseText);
    const texto = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return texto?.replace(/^["“]+|["”]+$/g, "") || null;

  } catch (error) {
    Logger.log("❌ Excepción al llamar a Gemini: " + error.toString());
    return null;
  }
}
