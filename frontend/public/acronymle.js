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
  // three target words (suffixes typed by user), plus activeWord index
  let currentGuesses = ['', '', ''];
  let activeWord = 0;
  let isGameOver = false;
  let lastGuessWasCorrect = false; // true when the last confirmed combined guess was correct
  let lastCorrectGuess = ''; // stores the correct combined guess when solved

  // Default solution words (three words)
  const solutionWords = ['on', 'the', 'way'];
  const combinedSolution = solutionWords.join(' ');
  // locked first letters per word (auto-filled from solutionWords)
  let lockedFirstLetters = solutionWords.map(w => (w && w[0]) || '');
  // number of editable characters (word length - 1) per word (allow up to 9)
  let maxSuffixLens = solutionWords.map(w => Math.max(0, (w && w.length) ? Math.min(9, w.length - 1) : 9));

  // Load the solution locally. API calls are disabled for now (TODO: re-enable later).
  function loadSolution() {
    // NOTE: Backend integration for fetching the solution is intentionally
    // disabled. The app uses the local `solutionWords` variable for checks.
    lockedFirstLetters = solutionWords.map(w => (w && w[0]) || '');
    maxSuffixLens = solutionWords.map(w => Math.max(0, (w && w.length) ? Math.min(9, w.length - 1) : 9));
    // set input max length to 10 for all word inputs and reset current guesses
    for (let i = 0; i < 3; i++) {
      const input = el(`guess-input-${i}`);
      if (input) input.maxLength = 10;
      currentGuesses[i] = '';
    }
    activeWord = 0;
  }

  // Track incorrect guess indicators and store wrong guesses
  const maxIndicators = 5;
  let incorrectCount = 0;
  const incorrectGuesses = [];

  function renderWrongGuesses() {
    const list = document.getElementById('wrong-guesses');
    if (!list) return;
    list.innerHTML = '';
    incorrectGuesses.forEach((g) => {
      // normalize to { words: [...], correctness: [...] }
      let words = [];
      let correctness = [];
      if (typeof g === 'string') {
        words = g.split(' ');
        correctness = words.map(() => false);
      } else if (g.words && Array.isArray(g.words)) {
        words = g.words;
        correctness = g.correctness || words.map(() => false);
      } else if (g.text) {
        words = g.text.split(' ');
        correctness = (g.correct === true) ? words.map(() => true) : words.map(() => false);
      } else {
        return;
      }

      const li = document.createElement('li');
      li.className = 'guess-item';
      words.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 'guess-word';
        if (correctness[i]) span.classList.add('correct');
        else span.classList.add('wrong');
        span.textContent = w;
        li.appendChild(span);
      });

      list.appendChild(li);
    });
  }

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
    for (let i = 0; i < 3; i++) {
      const input = el(`guess-input-${i}`);
      const area = el(`input-area-${i}`);
      if (!input || !area) continue;

      if (lastGuessWasCorrect && lastCorrectGuess) {
        // on solved state, show solution word (do not change input background color)
        input.value = (solutionWords[i] || '').toUpperCase();
        input.disabled = true;
        // ensure input area is not styled as 'correct'
        area.classList.remove('correct');
      } else {
        input.value = ((lockedFirstLetters[i] || '').toUpperCase()) + (currentGuesses[i] || '').toUpperCase();
        input.disabled = false;
        // ensure the 'correct' class isn't present for active/inactive states
        area.classList.remove('correct');
        if (i === activeWord) {
          area.classList.add('active');
        } else {
          area.classList.remove('active');
        }
        // keep the caret at end if active
        if (i === activeWord) {
          try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {}
        }
      }
    }
  }

  // Handle clicks from the on-screen keyboard (or programmatic calls)
  // - ENTER finalizes a guess with at least one character (including locked first letter)
  // - DELETE removes the last letter
  // - Letters append up to the configured suffix length
  async function handleKeyClick(key) {
    if (isGameOver) return;

    if (key === 'ENTER') {
      // If not the last word, move focus to next word
      if (activeWord < 2) {
        activeWord = Math.min(2, activeWord + 1);
        renderGrid();
        // focus the next input so typing continues there
        const nextInput = el(`guess-input-${activeWord}`);
        if (nextInput) nextInput.focus();
        return;
      }

      // activeWord === 2: attempt to submit only if all three words are non-empty
      const fullWords = [];
      for (let i = 0; i < 3; i++) {
        const word = (lockedFirstLetters[i] || '') + (currentGuesses[i] || '');
        if (!word || word.length < 1) {
          // can't submit until all words have at least one character
          return;
        }
        fullWords.push(word);
      }

      const combined = fullWords.join(' ').toLowerCase();
      const correct = (combined === combinedSolution.toLowerCase());

      if (correct) {
        // correct combined guess
        lastCorrectGuess = fullWords.join(' ');
        lastGuessWasCorrect = true;
        // mark next indicator as correct and record in guesses panel
        markNextIndicatorCorrect();
        const displayGuess = lastCorrectGuess.toUpperCase();
        const wordsUpper = lastCorrectGuess.toUpperCase().split(' ');
        const perWordCorrect = wordsUpper.map((w, i) => w.toLowerCase() === (solutionWords[i] || '').toLowerCase());
        const existing = incorrectGuesses.find(x => ((x.words ? x.words.join(' ') : (x.text || '')).toUpperCase() === displayGuess));
        if (existing) {
          existing.words = wordsUpper;
          existing.correctness = perWordCorrect;
        } else if (incorrectGuesses.length < maxIndicators) {
          incorrectGuesses.push({ words: wordsUpper, correctness: perWordCorrect });
        }
        renderWrongGuesses();
        currentGuesses = ['', '', ''];
        activeWord = 0;
        renderGrid();
        // focus first input after submission
        const firstInput = el('guess-input-0');
        if (firstInput) {
          firstInput.focus();
          try { firstInput.setSelectionRange(firstInput.value.length, firstInput.value.length); } catch (e) {}
        }
        isGameOver = true; 
      } else {
        // incorrect combined guess
        incorrectCount = Math.min(maxIndicators, incorrectCount + 1);
        markIndicator(incorrectCount - 1);
        const displayGuess = fullWords.join(' ').toUpperCase();
        const wordsUpper = fullWords.map(w => w.toUpperCase());
        const perWordCorrect = fullWords.map((w, i) => w.toLowerCase() === (solutionWords[i] || '').toLowerCase());
        const existing = incorrectGuesses.find(x => ((x.words ? x.words.join(' ') : (x.text || '')).toUpperCase() === displayGuess));
        if (existing) {
          existing.words = wordsUpper;
          existing.correctness = perWordCorrect;
        } else if (incorrectGuesses.length < maxIndicators) {
          incorrectGuesses.push({ words: wordsUpper, correctness: perWordCorrect });
        }
        renderWrongGuesses();
        lastGuessWasCorrect = false;
        currentGuesses = ['', '', ''];
        activeWord = 0;

        // focus first input to start next guess
        const firstInput = el('guess-input-0');
        if (firstInput) {
          firstInput.focus();
          try { firstInput.setSelectionRange(firstInput.value.length, firstInput.value.length); } catch (e) {}
        }

        if (incorrectCount >= maxIndicators) {
          isGameOver = true;
        }
        renderGrid();
      }
    } else if (key === 'DELETE') {
      // remove last char from current active word (don't remove locked first letter)
      const suffix = currentGuesses[activeWord] || '';
      currentGuesses[activeWord] = suffix.slice(0, -1);
    } else {
      // add letter to active word suffix up to configured max for that word
      if ((currentGuesses[activeWord] || '').length < (maxSuffixLens[activeWord] || 9)) {
        currentGuesses[activeWord] = ((currentGuesses[activeWord] || '') + key).slice(0, 9);
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

    // wire the text inputs for physical typing (one per word)
    for (let i = 0; i < 3; i++) {
      const input = el(`guess-input-${i}`);
      if (!input) continue;

      // keep input prefixed with the locked first letter; users type the remaining suffix letters
      ((index) => {
        input.addEventListener('input', (e) => {
          let v = String(e.target.value || '');
          // remove non-letters
          v = v.replace(/[^a-zA-Z]/g, '');
          // if the user removed or changed the first char, re-insert lockedFirstLetter at start
          if (!lockedFirstLetters[index]) lockedFirstLetters[index] = '';
          if (v.length === 0) {
            currentGuesses[index] = '';
            e.target.value = (lockedFirstLetters[index] || '').toUpperCase();
            return;
          }

          // Ensure first char equals lockedFirstLetter for this word
          const first = v.charAt(0).toLowerCase();
          if (first !== (lockedFirstLetters[index] || '').toLowerCase()) {
            v = (lockedFirstLetters[index] || '') + v; // re-insert locked first letter
          }

          // trim to locked + suffix letters
          const suffix = v.slice(1, 1 + (maxSuffixLens[index] || 9));
          currentGuesses[index] = suffix.toLowerCase();

          // set displayed value to locked + suffix uppercase
          e.target.value = ((lockedFirstLetters[index] || '') + currentGuesses[index]).toUpperCase();
        });

        // handle Enter and Backspace via keyboard
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // set activeWord to this input before handling
            activeWord = index;
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
              const suffix = v.slice(1, 1 + (maxSuffixLens[index] || 9));
              currentGuesses[index] = suffix.toLowerCase();
              renderGrid();
            }, 0);
          }
        });

        // ensure clicking focuses after the locked char
        input.addEventListener('focus', () => {
          activeWord = index;
          setTimeout(() => {
            try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {}
          }, 0);
        });
      })(i);
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

    // reset wrong guesses list and current guesses
    incorrectGuesses.length = 0;
    renderWrongGuesses();
    currentGuesses = ['', '', ''];
    activeWord = 0;

    renderGrid();
    renderKeyboard();

    // set focus to first input for quick typing
    const input = el('guess-input-0');
    if (input) input.focus();
  });

})();