// Allow typing into guess inputs even when not focused
document.addEventListener('keydown', (e) => {
  // Ignore if a modal, alert, or other input is focused
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
  // Only handle letter keys, Enter, and Backspace
  const isLetter = /^[a-zA-Z]$/.test(e.key);
  if (!isLetter && e.key !== 'Enter' && e.key !== 'Backspace') return;
  // Route the event to the currently active input
  const input = document.getElementById(`guess-input-${activeWord}`);
  if (input) {
    input.focus();
    // For letters, append to input
    if (isLetter) {
      // Simulate typing by appending the letter
      const val = input.value + e.key.toUpperCase();
      input.value = val;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (e.key === 'Backspace') {
      // Simulate backspace
      input.value = input.value.slice(0, -1);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (e.key === 'Enter') {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
    e.preventDefault();
  }
});
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

  // Locked state for individual words
  let wordSolved = [false, false, false];

  // Default solution words (three words)
  const solutionWords = ['on', 'the', 'way'];
  const combinedSolution = solutionWords.join(' ');
  // locked first letters per word (auto-filled from solutionWords)
  let lockedFirstLetters = solutionWords.map(w => (w && w[0]) || '');
  // number of editable characters (word length - 1) per word (allow up to 9)
  let maxSuffixLens = [9, 9, 9]; // Always allow 9 suffix chars (plus 1 locked letter = 10 total)

  // Load the solution locally. API calls are disabled for now (TODO: re-enable later).
  function loadSolution() {
    // NOTE: Backend integration for fetching the solution is intentionally
    // disabled. The app uses the local `solutionWords` variable for checks.
    lockedFirstLetters = solutionWords.map(w => (w && w[0]) || '');
    maxSuffixLens = [9, 9, 9];
    // set input max length to 10 for all word inputs and reset current guesses
    for (let i = 0; i < 3; i++) {
      const input = el(`guess-input-${i}`);
      if (input) input.maxLength = 10;
      currentGuesses[i] = '';
    }
    wordSolved = [false, false, false];
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
    for (let i = 0; i < incorrectGuesses.length; i++) {
      let g = incorrectGuesses[i];
      let li = document.createElement('li');
      li.className = 'guess-item';
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
        continue;
      }
      words.forEach((w, i) => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';

        const span = document.createElement('span');
        span.className = 'guess-word';
        if (correctness[i]) {
          span.classList.add('correct');
        } else {
          const correctWord = (solutionWords[i] || '');
          if (w.length === correctWord.length) {
            span.classList.add('close');
          } else {
            span.classList.add('wrong');
          }
        }
        span.textContent = w;
        wrapper.appendChild(span);

        // Add triangle arrow if incorrect length
        if (!correctness[i]) {
          const correctWord = (solutionWords[i] || '');
          if (w.length !== correctWord.length) {
            const detail = document.createElement('span');
            detail.className = 'guess-length-detail';
            detail.style.fontSize = '1.2em';
            detail.style.marginLeft = '6px';
            detail.style.verticalAlign = 'middle';
            detail.style.color = '#991b1b';
            // ⇧ for too short, ⇩ for too long
            detail.textContent = w.length < correctWord.length ? '⇧' : '⇩';
            span.appendChild(detail);
          }
        }
        li.appendChild(wrapper);
      });
      list.appendChild(li);
    }
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

  // Render input line: include locked first letter inside the input value; if solved, show solution word and disable input
  function renderGrid() {
    let firstUnsolved = -1;
    for (let i = 0; i < 3; i++) {
      const input = el(`guess-input-${i}`);
      const area = el(`input-area-${i}`);
      if (!input || !area) continue;

      if (wordSolved[i]) {
        // If the specific word is solved, lock it to correct
        input.value = (solutionWords[i] || '').toUpperCase();
        input.disabled = true;
        area.classList.remove('active');
        // Do not add .correct class here, so it doesn't turn green
      } else {
        // Track the first available slot to focus if needed
        if (firstUnsolved === -1) firstUnsolved = i;

        input.value = ((lockedFirstLetters[i] || '').toUpperCase()) + (currentGuesses[i] || '').toUpperCase();
        input.disabled = false;
        area.classList.remove('correct');
        if (i === activeWord) {
          area.classList.add('active');
        } else {
          area.classList.remove('active');
        }
        // keep the caret at end if active
        if (i === activeWord) {
          try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) { }
        }
      }
    }
    renderAcronym();
  }

  // Render the acronym above the input boxes (e.g., OTW)
  function renderAcronym() {
    const acronymDiv = el('acronym-display');
    if (!acronymDiv) return;
    // Use the first letter of each solution word, uppercased, no separator
    const acronym = solutionWords.map(w => (w && w[0] ? w[0].toUpperCase() : '?')).join('');
    acronymDiv.textContent = acronym;
  }

  // Helper to find the next editable word index
  function getNextEditableWord(current) {
    for (let i = current + 1; i < 3; i++) {
      if (!wordSolved[i]) return i;
    }
    return current; // stay if none after
  }

  // Helper to find previous editable word index
  function getPrevEditableWord(current) {
    for (let i = current - 1; i >= 0; i--) {
      if (!wordSolved[i]) return i;
    }
    return current; // stay if none before
  }

  // Handle clicks from the on-screen keyboard (or programmatic calls)
  async function handleKeyClick(key) {
    if (isGameOver) return;

    // Safety check: if active word is somehow solved, move to one that isn't
    if (wordSolved[activeWord]) {
      const next = getNextEditableWord(activeWord);
      if (wordSolved[next]) {
        // scan from 0 if we are stuck
        for (let k = 0; k < 3; k++) {
          if (!wordSolved[k]) { activeWord = k; break; }
        }
      } else {
        activeWord = next;
      }
    }

    if (key === 'ENTER') {
      // If there are more editable words after this, move focus to the next one
      const nextIdx = getNextEditableWord(activeWord);
      if (nextIdx > activeWord) {
        activeWord = nextIdx;
        renderGrid();
        const nextInput = el(`guess-input-${activeWord}`);
        if (nextInput) nextInput.focus();
        return;
      }

      // We are at the last editable word. Attempt to submit.
      const fullWords = [];
      for (let i = 0; i < 3; i++) {
        if (wordSolved[i]) {
          fullWords.push(solutionWords[i]);
        } else {
          const word = (lockedFirstLetters[i] || '') + (currentGuesses[i] || '');
          if (!word || word.length < 1) {
            // can't submit until all words have at least one character
            return;
          }
          fullWords.push(word);
        }
      }

      const combined = fullWords.join(' ').toLowerCase();
      const correct = (combined === combinedSolution.toLowerCase());

      // Check individual word correctness to lock them
      const wordsUpper = fullWords.map(w => w.toUpperCase());
      const perWordCorrect = fullWords.map((w, i) => w.toLowerCase() === (solutionWords[i] || '').toLowerCase());

      // Update wordSolved status
      for (let i = 0; i < 3; i++) {
        if (perWordCorrect[i]) {
          wordSolved[i] = true;
          currentGuesses[i] = wordsUpper[i].slice(1).toLowerCase(); // store as suffix just in case
        }
      }

      if (correct) {
        // correct combined guess
        lastCorrectGuess = fullWords.join(' ');
        lastGuessWasCorrect = true;
        markNextIndicatorCorrect();

        // History
        const displayGuess = lastCorrectGuess.toUpperCase();
        const existing = incorrectGuesses.find(x => ((x.words ? x.words.join(' ') : (x.text || '')).toUpperCase() === displayGuess));
        if (existing) {
          existing.words = wordsUpper;
          existing.correctness = perWordCorrect;
        } else if (incorrectGuesses.length < maxIndicators) {
          incorrectGuesses.push({ words: wordsUpper, correctness: perWordCorrect });
        }
        renderWrongGuesses();

        activeWord = 0; // reset (all inputs disabled anyway)
        renderGrid();
        isGameOver = true;
      } else {
        // incorrect combined guess
        incorrectCount = Math.min(maxIndicators, incorrectCount + 1);
        markIndicator(incorrectCount - 1);

        const displayGuess = fullWords.join(' ').toUpperCase();
        const existing = incorrectGuesses.find(x => ((x.words ? x.words.join(' ') : (x.text || '')).toUpperCase() === displayGuess));
        if (existing) {
          existing.words = wordsUpper;
          existing.correctness = perWordCorrect;
        } else if (incorrectGuesses.length < maxIndicators) {
          incorrectGuesses.push({ words: wordsUpper, correctness: perWordCorrect });
        }
        renderWrongGuesses();
        lastGuessWasCorrect = false;

        // Clear incorrect guesses (keep locked/solved ones)
        for (let i = 0; i < 3; i++) {
          if (!wordSolved[i]) {
            currentGuesses[i] = '';
          }
        }

        // Move focus to first unsolved word
        for (let k = 0; k < 3; k++) {
          if (!wordSolved[k]) { activeWord = k; break; }
        }

        // focus input
        const firstInput = el(`guess-input-${activeWord}`);
        if (firstInput) {
          firstInput.focus();
          try { firstInput.setSelectionRange(firstInput.value.length, firstInput.value.length); } catch (e) { }
        }

        if (incorrectCount >= maxIndicators) {
          isGameOver = true;
        }
        renderGrid();
      }
    } else if (key === 'DELETE') {
      if (wordSolved[activeWord]) return; // can't delete locked words
      const suffix = currentGuesses[activeWord] || '';
      currentGuesses[activeWord] = suffix.slice(0, -1);
    } else {
      if (wordSolved[activeWord]) return; // can't type in locked words
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
            try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) { }
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
    renderAcronym();

    // set focus to first input for quick typing
    const input = el('guess-input-0');
    if (input) input.focus();
  });

})();