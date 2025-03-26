// Menú que se ve en excel, le pongo nombre y llamo el metodo que creo en otro archivo.
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("PACKLIST IA🧠")
    .addItem("🔠 Traducir celdas seleccionadas", "mostrarFormularioTraduccion")
    .addItem("🔑 Generador palabras clave", "palabrasClave")
    .addToUi();
}
