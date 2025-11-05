# 📖 AIEER – Lector de palabras con enfoque en la letra central

[![Demo en vivo](https://img.shields.io/badge/Demo-Online-brightgreen?style=for-the-badge&logo=githubpages)](https://jorgecoy.github.io/aLeer.io)
[![React](https://img.shields.io/badge/React-18.2-%2361DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![PDF.js](https://img.shields.io/badge/PDF.js-5.4-%23FF4500?style=for-the-badge)](https://mozilla.github.io/pdf.js/)

**AIEER** es una herramienta interactiva diseñada para mejorar la fluidez lectora —especialmente útil para niños en etapa de aprendizaje, pero también para adultos que quieren practicar lectura rápida—. Resalta la **letra central de cada palabra**, lo que ayuda a fijar la atención y acelerar el reconocimiento visual.

Ideal para practicar con textos propios o **archivos PDF completos** (como libros, cuentos o ensayos).

---

## ✨ Características

- ✅ **Resaltado dinámico** de la letra central con animación suave
- 📄 **Soporte para PDF**: carga documentos y elige leer por **página** o **todo el texto**
- ⚡ **Velocidad ajustable**: desde **10 ms** (ultrarrápido) hasta 3 segundos por palabra
- 🔊 **Síntesis de voz** en español con velocidad adaptativa
- 📚 **Historial de textos** guardado localmente (últimos 20)
- 🖥️ **Totalmente responsive**: funciona en **móvil, tablet y computador**
- ⌨️ **Atajos de teclado**:
  - `Espacio`: pausar/reanudar
  - `+` o `=`: acelerar
  - `-` o `_`: desacelerar

---

## ▶️ Probar en vivo

Accede directamente desde cualquier dispositivo:

👉 **[https://jorgecoy.github.io/aLeer.io](https://jorgecoy.github.io/aLeer.io)**

> 💡 En celular, permite el uso de voz si tu navegador lo solicita.

---

## 🛠️ Cómo usarlo

1. Escribe un texto o sube un **archivo PDF**
2. Selecciona si quieres leer **todo el documento** o una **página específica**
3. Haz clic en **▶️ Iniciar** y ajusta la velocidad según tu nivel
4. Usa controles o atajos de teclado para pausar, reanudar o cambiar velocidad

---

## 🚀 Cómo desplegar tu propia copia

1. Haz fork de este repositorio
2. Asegúrate de que el `homepage` en `package.json` sea:
   ```json
   "homepage": "https://TU_USUARIO.github.io/aLeer.io"
