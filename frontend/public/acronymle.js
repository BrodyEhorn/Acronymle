/* acronymle.js — Game logic for Acronymle
   Moved out of the HTML file for clarity and maintainability.
   This file initializes the grid and keyboard and handles user input.
*/

(function () {
  'use strict';

  // --- Key layout (rows) ---
  const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
  ];

  // --- Game state ---
  let currentGuess = ''; // current active (typing) guess
  let isGameOver = false;
  let lastGuessWasCorrect = false; // true when the last confirmed guess was correct (used to render green)
  let lastCorrectGuess = ''; // stores the correct guess when solved

  // Default solution: 'hello' so correctness works even if backend is unreachable
  let solution = 'hello';

  // Try to load the solution from the backend; if it fails we keep the default
  async function loadSolution() {
    try {
      const res = await fetch('/api/solutions');
      if (!res.ok) throw new Error('no solutions');
      const arr = await res.json();
      if (Array.isArray(arr) && arr.length > 0 && arr[0].word) {
        solution = String(arr[0].word).toLowerCase();
      }
    } catch (err) {
      // fallback to default 'hello'
    }
  }

  // Track incorrect guess indicators
  const maxIndicators = 5;
  let incorrectCount = 0;

  function markIndicator(i) {
    const ind = document.querySelector(`#guess-indicators .indicator[data-index="${i}"]`);
    if (ind) {
      ind.classList.add('wrong');
      ind.textContent = 'X';
    }
  }

  // Helper to safely get an element by id
  function el(id) {
    return document.getElementById(id);
  }

  // Render a single 5-letter row. Shows the current typing state or the correct result when solved.
  function renderGrid() {
    const grid = el('grid');
    if (!grid) return; // defensive: element may not exist

    grid.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'row';

    // If the last confirmed guess was correct, display it; otherwise, show the current guess
    const display = (lastGuessWasCorrect && lastCorrectGuess) ? lastCorrectGuess : currentGuess;

    for (let j = 0; j < 5; j++) {
      const box = document.createElement('div');
      box.className = 'box';

      if (lastGuessWasCorrect && lastCorrectGuess) {
        box.classList.add('correct');
      }

      box.textContent = (display && display[j]) ? display[j] : '';
      row.appendChild(box);
    }

    grid.appendChild(row);
  }

  // Handle clicks from the on-screen keyboard (or programmatic calls)
  // - ENTER finalizes a 5-letter guess
  // - DELETE removes the last letter
  // - Letters append up to 5 letters
  async function handleKeyClick(key) {
    if (isGameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        // First check locally against the known solution (so typing 'hello' works without backend)
        let correct = (currentGuess.toLowerCase() === solution);

        // If not locally correct, attempt to validate with the backend (best-effort)
        if (!correct) {
          async function tryCheck(url) {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guess: currentGuess })
            });
            if (!res.ok) throw new Error('non-OK response');
            const data = await res.json();
            return !!data.correct;
          }

          try {
            correct = await tryCheck('/api/check');
          } catch (err1) {
            try {
              correct = await tryCheck('http://localhost:4000/api/check');
            } catch (err2) {
              console.warn('Failed to validate guess via /api/check and direct backend', err1, err2);
            }
          }
        }

        if (correct) {
          // keep the correct guess visible and mark green
          lastCorrectGuess = currentGuess;
          lastGuessWasCorrect = true;
          currentGuess = '';
          isGameOver = true; // all boxes for last row should turn green
        } else {
          // incorrect guess: clear the letter boxes and mark an X in the indicators
          incorrectCount = Math.min(maxIndicators, incorrectCount + 1);
          markIndicator(incorrectCount - 1);
          lastGuessWasCorrect = false;
          currentGuess = '';

          if (incorrectCount >= maxIndicators) {
            isGameOver = true; // reached the indicator limit
          }
        }
      }
    } else if (key === 'DELETE') {
      currentGuess = currentGuess.slice(0, -1);
    } else {
      if (currentGuess.length < 5) {
        currentGuess += key;
      }
    }

    renderGrid();
  }

  // Build the visual keyboard and attach click listeners for each key
  function renderKeyboard() {
    keys.forEach((row, index) => {
      const rowElement = el(`row${index + 1}`);
      if (!rowElement) return;

      row.forEach(key => {
        const button = document.createElement('button');
        button.className = 'key';
        if (key === 'ENTER' || key === 'DELETE') {
          button.classList.add('wide');
        }
        button.textContent = key;
        button.addEventListener('click', () => handleKeyClick(key));
        rowElement.appendChild(button);
      });
    });
  }

  // Initialize the UI once the DOM is ready. Use DOMContentLoaded for safety.
  document.addEventListener('DOMContentLoaded', async () => {
    await loadSolution();
    // Ensure indicators exist (they're in HTML) — clear any old state
    for (let i = 0; i < maxIndicators; i++) {
      const ind = document.querySelector(`#guess-indicators .indicator[data-index="${i}"]`);
      if (ind) {
        ind.classList.remove('wrong');
        ind.textContent = '';
      }
    }

    renderGrid();
    renderKeyboard();
  });

})();