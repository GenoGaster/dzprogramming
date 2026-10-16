(function () {
  'use strict';

  const SIZE = 5;
  const CENTER = { r: 2, c: 2 };
  const START = { r: 4, c: 0 };
  const CONTAINER_CELLS = [
    { r: 0, c: 0 },
    { r: 0, c: 4 },
    { r: 4, c: 4 },
  ];
  // Орбита вокруг станции, по часовой стрелке начиная с верхней клетки.
  const ORBIT = [
    { r: 1, c: 2 }, // 0 верх
    { r: 1, c: 3 }, // 1 верх-право
    { r: 2, c: 3 }, // 2 право
    { r: 3, c: 3 }, // 3 низ-право
    { r: 3, c: 2 }, // 4 низ
    { r: 3, c: 1 }, // 5 низ-лево
    { r: 2, c: 1 }, // 6 лево
    { r: 1, c: 1 }, // 7 верх-лево
  ];
  const ASTEROID_START = [0, 3, 5];
  const ROUND_TIME = 60;
  const CONTAINERS_TOTAL = CONTAINER_CELLS.length;

  const boardEl = document.getElementById('board');
  const timerEl = document.getElementById('timer');
  const cargoEl = document.getElementById('cargo');
  const scoreEl = document.getElementById('score');
  const overlayEl = document.getElementById('overlay');
  const overlayTitleEl = document.getElementById('overlay-title');
  const overlayTextEl = document.getElementById('overlay-text');
  const overlayScoreEl = document.getElementById('overlay-score');

  let state = null;
  let timerId = null;

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function isCenter(r, c) {
    return r === CENTER.r && c === CENTER.c;
  }

  function orbitIndex(r, c) {
    for (let i = 0; i < ORBIT.length; i++) {
      if (ORBIT[i].r === r && ORBIT[i].c === c) return i;
    }
    return -1;
  }

  function isOrbit(r, c) {
    return orbitIndex(r, c) !== -1;
  }

  function isAdjacent(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }

  function asteroidIndices(s) {
    return s.asteroidOffsets.map(function (o) {
      return (o + s.rotation) % ORBIT.length;
    });
  }

  function hasAsteroid(s, r, c) {
    const idx = orbitIndex(r, c);
    if (idx === -1) return false;
    return asteroidIndices(s).indexOf(idx) !== -1;
  }

  function hasContainer(s, r, c) {
    for (let i = 0; i < s.containers.length; i++) {
      const k = s.containers[i];
      if (!k.collected && k.r === r && k.c === c) return true;
    }
    return false;
  }

  function createState() {
    return {
      ship: { r: START.r, c: START.c },
      containers: CONTAINER_CELLS.map(function (c) {
        return { r: c.r, c: c.c, collected: false };
      }),
      asteroidOffsets: ASTEROID_START.slice(),
      rotation: 0,
      collected: 0,
      score: 0,
      timeLeft: ROUND_TIME,
      status: 'playing',
    };
  }

  function buildBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.dataset.r = String(r);
        cell.dataset.c = String(c);
        if (isCenter(r, c)) {
          cell.classList.add('cell--station');
        } else if (isOrbit(r, c)) {
          cell.classList.add('cell--orbit');
        } else {
          cell.classList.add('cell--outer');
        }
        const content = document.createElement('span');
        content.className = 'cell__content';
        cell.appendChild(content);
        cell.addEventListener('click', makeClickHandler(r, c));
        boardEl.appendChild(cell);
      }
    }
  }

  function makeClickHandler(r, c) {
    return function () { onCellClick(r, c); };
  }

  function render() {
    if (!state) return;
    const s = state;
    const cells = boardEl.children;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const r = Number(cell.dataset.r);
      const c = Number(cell.dataset.c);
      const content = cell.firstChild;

      cell.classList.remove(
        'has-ship', 'has-asteroid', 'has-container', 'has-collision', 'can-move'
      );
      content.textContent = '';

      const shipHere = s.ship.r === r && s.ship.c === c;
      const astHere = hasAsteroid(s, r, c);
      const contHere = hasContainer(s, r, c);

      if (shipHere && astHere) {
        cell.classList.add('has-collision');
        content.textContent = '✸';
      } else if (shipHere) {
        cell.classList.add('has-ship');
        content.textContent = '▲';
      } else if (astHere) {
        cell.classList.add('has-asteroid');
        content.textContent = '✸';
      } else if (contHere) {
        cell.classList.add('has-container');
        content.textContent = '◆';
      }

      if (s.status === 'playing' && canMoveTo(r, c)) {
        cell.classList.add('can-move');
      }

      if (isCenter(r, c)) {
        cell.classList.toggle('cell--station-ready', s.collected >= CONTAINERS_TOTAL);
      }
    }

    timerEl.textContent = String(s.timeLeft);
    cargoEl.textContent = String(s.collected);
    scoreEl.textContent = String(s.score);
    timerEl.classList.toggle('hud__value--low', s.timeLeft <= 10);
  }

  function canMoveTo(r, c) {
    if (!state || state.status !== 'playing') return false;
    if (!inBounds(r, c)) return false;
    if (!isAdjacent(state.ship, { r: r, c: c })) return false;
    if (isCenter(r, c)) return state.collected >= CONTAINERS_TOTAL;
    return true;
  }

  function onCellClick(r, c) {
    if (!state || state.status !== 'playing') return;
    if (!canMoveTo(r, c)) return;

    state.ship = { r: r, c: c };

    for (let i = 0; i < state.containers.length; i++) {
      const k = state.containers[i];
      if (!k.collected && k.r === r && k.c === c) {
        k.collected = true;
        state.collected += 1;
        state.score += 100;
        break;
      }
    }

    if (hasAsteroid(state, r, c)) {
      endRound('lost', 'Корабль врезался в астероид');
      return;
    }

    state.rotation += 1;

    if (hasAsteroid(state, r, c)) {
      endRound('lost', 'Астероид протаранил корабль');
      return;
    }

    if (isCenter(r, c) && state.collected >= CONTAINERS_TOTAL) {
      state.score += 1000 + state.timeLeft * 10;
      endRound('won', 'Стыковка успешна');
      return;
    }

    render();
    pulseAsteroids();
  }

  function pulseAsteroids() {
    const cells = boardEl.querySelectorAll('.cell.has-asteroid');
    for (let i = 0; i < cells.length; i++) {
      const el = cells[i];
      if (typeof el.animate === 'function') {
        el.animate(
          [
            { transform: 'scale(1)', filter: 'brightness(1)' },
            { transform: 'scale(1.12)', filter: 'brightness(1.6)' },
            { transform: 'scale(1)', filter: 'brightness(1)' },
          ],
          { duration: 260, easing: 'ease-out' }
        );
      }
    }
  }

  function startTimer() {
    stopTimer();
    timerId = window.setInterval(function () {
      if (!state || state.status !== 'playing') return;
      state.timeLeft -= 1;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        endRound('lost', 'Время вышло');
        return;
      }
      render();
    }, 1000);
  }

  function stopTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function endRound(status, text) {
    state.status = status;
    stopTimer();
    render();
    overlayEl.hidden = false;
    overlayEl.classList.remove('overlay--won', 'overlay--lost');
    overlayEl.classList.add(status === 'won' ? 'overlay--won' : 'overlay--lost');
    overlayTitleEl.textContent = status === 'won' ? 'Победа' : 'Поражение';
    overlayTextEl.textContent = text;
    overlayScoreEl.textContent = 'Очки: ' + state.score;
  }

  function restart() {
    stopTimer();
    state = createState();
    overlayEl.hidden = true;
    overlayEl.classList.remove('overlay--won', 'overlay--lost');
    render();
    startTimer();
  }

  document.getElementById('restart').addEventListener('click', restart);
  document.getElementById('overlay-restart').addEventListener('click', restart);

  buildBoard();
  restart();
})();