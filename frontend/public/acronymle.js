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
  // The locked first letter (auto-filled) — defaults from solution
  let lockedFirstLetter = solution[0];
  // number of editable characters (word length - 1)
  let maxSuffixLen = Math.max(0, solution.length - 1);

  // Load the solution locally. API calls are disabled for now (TODO: re-enable later).
  function loadSolution() {
    // NOTE: Backend integration for fetching the solution is intentionally
    // disabled. The app uses the local `solution` variable for checks.
    lockedFirstLetter = solution[0] || lockedFirstLetter;
    maxSuffixLen = Math.max(0, solution.length - 1);
    // set input max length to total word length
    const input = el('guess-input');
    if (input) input.maxLength = solution.length;
    currentGuess = '';
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

  // Turn only the next indicator (where a wrong guess would land) into a full green check box
  function markNextIndicatorCorrect() {
    const index = Math.min(maxIndicators - 1, incorrectCount);
    const ind = document.querySelector(`#guess-indicators .indicator[data-index="${index}"]`);
    if (ind) {
      ind.classList.remove('wrong');
      ind.classList.add('correct');
      ind.textContent = '✓';
    }
  }

  // Helper to safely get an element by id
  function el(id) {
    return document.getElementById(id);
  }

  // Render input line: include locked first letter inside the input value; if solved, show green state and disable input
  function renderGrid() {
    const input = el('guess-input');
    const area = el('input-area');
    if (!input || !area) return;

    if (lastGuessWasCorrect && lastCorrectGuess) {
      // show full correct word and mark input area correct
      input.value = lastCorrectGuess.toUpperCase();
      input.disabled = true;
      area.classList.add('correct');
    } else {
      // prefix locked first letter and show typed suffix
      input.value = (lockedFirstLetter ? lockedFirstLetter.toUpperCase() : '') + (currentGuess || '').toUpperCase();
      input.disabled = false;
      area.classList.remove('correct');

      // keep the caret at end
      try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {}
    }
  }

  // Handle clicks from the on-screen keyboard (or programmatic calls)
  // - ENTER finalizes a guess with at least one character (including locked first letter)
  // - DELETE removes the last letter
  // - Letters append up to the configured suffix length
  async function handleKeyClick(key) {
    if (isGameOver) return;

    if (key === 'ENTER') {
      // Accept guesses that are at least 1 character long (including the locked first letter)
      const fullGuessRaw = (lockedFirstLetter || '') + currentGuess;
      if (fullGuessRaw.length >= 1) {
        const fullGuess = fullGuessRaw.toLowerCase();

        // Local-only validation (no network calls). API validation can be implemented later.
        const correct = (fullGuess === solution);


        if (correct) {
          // keep the correct guess visible and mark green
          lastCorrectGuess = lockedFirstLetter + currentGuess;
          lastGuessWasCorrect = true;
          currentGuess = '';
          // mark only the next indicator as correct (do not change existing red Xs)
          markNextIndicatorCorrect();
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
      // do not allow removing the locked first letter; only remove typed suffix
      currentGuess = currentGuess.slice(0, -1);
    } else {
      // only allow typing into the editable suffix (positions 1..maxSuffixLen)
      if (currentGuess.length < maxSuffixLen) {
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

    // wire the text input for physical typing
    const input = el('guess-input');
    if (input) {
      // keep input prefixed with the locked first letter; users type the remaining suffix letters
      input.addEventListener('input', (e) => {
        let v = String(e.target.value || '');
        // remove non-letters
        v = v.replace(/[^a-zA-Z]/g, '');
        // if the user removed or changed the first char, re-insert lockedFirstLetter at start
        if (!lockedFirstLetter) lockedFirstLetter = '';
        if (v.length === 0) {
          currentGuess = '';
          e.target.value = (lockedFirstLetter || '').toUpperCase();
          return;
        }

        // Ensure first char equals lockedFirstLetter
        const first = v.charAt(0).toLowerCase();
        if (first !== (lockedFirstLetter || '').toLowerCase()) {
          v = (lockedFirstLetter || '') + v; // re-insert locked first letter
        }

        // trim to locked + suffix letters
        const suffix = v.slice(1, 1 + maxSuffixLen);
        currentGuess = suffix.toLowerCase();

        // set displayed value to locked + suffix uppercase
        e.target.value = ((lockedFirstLetter || '') + currentGuess).toUpperCase();
      });

      // handle Enter and Backspace via keyboard
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleKeyClick('ENTER');
        } else if (e.key === 'Backspace') {
          // prevent deleting the locked first character
          const selStart = input.selectionStart || 0;
          if (selStart <= 1) {
            e.preventDefault();
            return;
          }
          // otherwise allow backspace and sync currentGuess on next tick
          setTimeout(() => {
            const v = input.value.replace(/[^a-zA-Z]/g, '');
            const suffix = v.slice(1, 1 + maxSuffixLen);
            currentGuess = suffix.toLowerCase();
            renderGrid();
          }, 0);
        }
      });

      // ensure clicking focuses after the locked char
      input.addEventListener('focus', () => {
        setTimeout(() => {
          try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {}
        }, 0);
      });
    }
  }

  // Initialize the UI once the DOM is ready. Use DOMContentLoaded for safety.
  document.addEventListener('DOMContentLoaded', async () => {
    await loadSolution();
    // Ensure indicators exist (they're in HTML) — clear any old state
    for (let i = 0; i < maxIndicators; i++) {
      const ind = document.querySelector(`#guess-indicators .indicator[data-index="${i}"]`);
      if (ind) {
        ind.classList.remove('wrong');
        ind.classList.remove('correct');
        ind.textContent = '';
      }
    }

    renderGrid();
    renderKeyboard();

    // set focus to input for quick typing
    const input = el('guess-input');
    if (input) input.focus();
  });

})();