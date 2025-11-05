import React, { useState, useEffect, useRef } from "react";
import { getDocument } from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import "./WordViewer.css";

// Configurar worker correctamente
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const WordViewer = () => {
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [pdfPages, setPdfPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("all");

  const timerRef = useRef(null);
  const utteranceRef = useRef(null);

  // Cargar historial
  useEffect(() => {
    const saved = localStorage.getItem("wordViewerHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error al cargar historial", e);
      }
    }
  }, []);

  const saveToHistory = (text) => {
    if (!text.trim()) return;
    const newEntry = {
      id: Date.now(),
      text: text.trim(),
      timestamp: new Date().toLocaleString(),
    };
    const newHistory = [newEntry, ...history.slice(0, 19)];
    setHistory(newHistory);
    localStorage.setItem("wordViewerHistory", JSON.stringify(newHistory));
  };

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startReading = () => {
    if (!text.trim()) return;
    saveToHistory(text);
    const splitWords = text.trim().split(/\s+/).filter(Boolean);
    if (splitWords.length === 0) return;
    setWords(splitWords);
    setCurrentIndex(0);
    setIsRunning(true);
  };

  const pauseReading = () => {
    setIsRunning(false);
    clearTimeout(timerRef.current);
    window.speechSynthesis.cancel();
  };

  const resumeReading = () => {
    if (!isRunning && words.length > 0 && currentIndex < words.length) {
      setIsRunning(true);
      timerRef.current = setTimeout(showNextWord, speed);
    }
  };

  const stopReading = () => {
    setIsRunning(false);
    clearTimeout(timerRef.current);
    window.speechSynthesis.cancel();
    setCurrentIndex(0);
  };

  const highlightMiddle = (word) => {
    if (!word) return null;
    const mid = Math.floor(word.length / 2);
    return (
      <>
        {word.slice(0, mid)}
        <span className="center-highlight">{word[mid]}</span>
        {word.slice(mid + 1)}
      </>
    );
  };

  const speakWord = (word, onEndCallback) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "es-ES";
    utterance.rate = word.length <= 3 ? 1.3 : word.length <= 6 ? 1.0 : 0.85;
    utterance.volume = 1;
    utterance.onend = onEndCallback;
    window.speechSynthesis.speak(utterance);
  };

  const showNextWord = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= words.length) {
        setIsRunning(false);
        return prev;
      }

      if (voiceEnabled) {
        speakWord(words[next], () => {
          if (isRunning) {
            timerRef.current = setTimeout(showNextWord, speed);
          }
        });
      } else {
        timerRef.current = setTimeout(showNextWord, speed);
      }
      return next;
    });
  };

  useEffect(() => {
    if (isRunning && words.length > 0) {
      const currentWord = words[0];
      if (voiceEnabled) {
        speakWord(currentWord, () => {
          if (isRunning) {
            timerRef.current = setTimeout(showNextWord, speed);
          }
        });
      } else {
        timerRef.current = setTimeout(showNextWord, speed);
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [isRunning, words, voiceEnabled, speed]);

  // === Manejo de PDF con extracción por página ===
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ arrayBuffer }).promise;
      const pagesText = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        pagesText.push(pageText);
      }

      setPdfPages(pagesText);
      setSelectedPage("all");
      setText(pagesText.join('\n\n'));
    } catch (error) {
      alert("Error al leer el PDF. Asegúrate de que no esté protegido o cifrado.");
      console.error("PDF error:", error);
    }
  };

  useEffect(() => {
    if (pdfPages.length === 0) return;

    if (selectedPage === "all") {
      setText(pdfPages.join('\n\n'));
    } else {
      const pageIndex = parseInt(selectedPage, 10) - 1;
      if (pdfPages[pageIndex]) {
        setText(pdfPages[pageIndex]);
      }
    }
  }, [selectedPage, pdfPages]);



  const selectFromHistory = (text) => {
    setText(text);
    setShowHistory(false);
    setPdfPages([]);
    setSelectedPage("all");
  };

  // === Atajos de teclado ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === ' ') {
        e.preventDefault();
        if (isRunning) {
          pauseReading();
        } else {
          if (text.trim()) resumeReading();
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setSpeed((prev) => Math.max(10, prev - 50)); // más rápido
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setSpeed((prev) => Math.min(3000, prev + 50)); // más lento
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, text]);

  return (
    <div className="word-viewer-container">
      <div className="header">
        <div className="logo">📖</div>
        <h1>AIEER</h1>
      </div>

      <div className="textarea-wrapper">
        <textarea
          placeholder="Escribe aquí tu texto... o sube un PDF"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isRunning}
        />
      </div>

      <div className="pdf-upload">
        <input
          type="file"
          id="pdf-upload"
          accept=".pdf"
          onChange={handlePdfUpload}
        />
        <label htmlFor="pdf-upload">📄 Subir PDF</label>
      </div>

      {pdfPages.length > 0 && (
        <div className="page-selector">
          <label htmlFor="page-select">Leer:</label>
          <select
            id="page-select"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
          >
            <option value="all">Todo el PDF</option>
            {pdfPages.map((_, i) => (
              <option key={i} value={i + 1}>
                Página {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="controls">
        <button className="btn-iniciar" onClick={startReading} disabled={isRunning}>
          ▶️ Iniciar
        </button>
        <button className="btn-pausar" onClick={pauseReading} disabled={!isRunning}>
          ⏸️ Pausar
        </button>
        <button className="btn-reanudar" onClick={resumeReading} disabled={!isRunning}>
          ↻ Reanudar
        </button>
        <button className="btn-detener" onClick={stopReading}>
          ⏹️ Detener
        </button>
        <button className="btn-historial" onClick={() => setShowHistory(true)}>
          📚 Historial
        </button>
        <button className="voice-toggle" onClick={() => setVoiceEnabled(!voiceEnabled)}>
          <input type="checkbox" checked={voiceEnabled} readOnly />
          Voz activa
        </button>
      </div>

      <div className="speed-control">
        <span className="speed-label">Velocidad: {speed} ms</span>
        <input
          type="range"
          min="100"
          max="3000"
          step="50"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="speed-slider"
        />
      </div>

      <div className="word-display">
        {highlightMiddle(words[currentIndex] || "")}
      </div>

      {showHistory && (
        <div className="modal" onClick={() => setShowHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Historial de textos</h3>
            {history.length === 0 ? (
              <p>No hay textos guardados</p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="modal-item"
                  onClick={() => selectFromHistory(item.text)}
                >
                  <strong>{item.timestamp}</strong>
                  <p>{item.text.substring(0, 80)}...</p>
                </div>
              ))
            )}
            <button className="close-modal" onClick={() => setShowHistory(false)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordViewer;