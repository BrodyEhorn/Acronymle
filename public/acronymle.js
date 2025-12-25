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
  let guesses = [];      // confirmed guesses (max 6)
  let isGameOver = false;

  // Helper to safely get an element by id
  function el(id) {
    return document.getElementById(id);
  }

  // Render the 6x5 grid. Shows confirmed guesses and the current guess in progress.
  function renderGrid() {
    const grid = el('grid');
    if (!grid) return; // defensive: element may not exist

    grid.innerHTML = '';

    for (let i = 0; i < 6; i++) {
      const row = document.createElement('div');
      row.className = 'row';

      const isCurrentRow = i === guesses.length;
      const guess = isCurrentRow ? currentGuess : (guesses[i] || '');

      for (let j = 0; j < 5; j++) {
        const box = document.createElement('div');
        box.className = 'box';
        box.textContent = guess[j] || '';
        row.appendChild(box);
      }

      grid.appendChild(row);
    }
  }

  // Handle clicks from the on-screen keyboard (or programmatic calls)
  // - ENTER finalizes a 5-letter guess
  // - DELETE removes the last letter
  // - Letters append up to 5 letters
  function handleKeyClick(key) {
    if (isGameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        guesses.push(currentGuess);
        currentGuess = '';
        if (guesses.length === 6) {
          isGameOver = true; // reached max guesses
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
  document.addEventListener('DOMContentLoaded', () => {
    renderGrid();
    renderKeyboard();
  });

})();
