(() => {
  const WIN_LINES = [
    [0, 1, 2], // 第一橫列
    [3, 4, 5], // 第二橫列
    [6, 7, 8], // 第三橫列
    [0, 3, 6], // 第一直行
    [1, 4, 7], // 第二直行
    [2, 5, 8], // 第三直行
    [0, 4, 8], // 主對角線
    [2, 4, 6], // 反對角線
  ];

  const CORNERS = [0, 2, 6, 8];

  /**
   * 檢查目前棋盤是否有獲勝者或平手
   * @param {Array<string|null>} board
   * @returns {{ winner: string|null, line: number[]|null, isDraw: boolean }}
   */
  function evaluateBoard(board) {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line, isDraw: false };
      }
    }
    const isFull = board.every((cell) => cell !== null);
    return { winner: null, line: null, isDraw: isFull };
  }

  /**
   * 取得所有合法空格索引 (0-8)
   * @param {Array<string|null>} board
   * @returns {number[]}
   */
  function getLegalMoves(board) {
    const moves = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) moves.push(i);
    }
    return moves;
  }

  /**
   * 檢查 player 下在 moveIndex 是否能立即獲勝，若能則回傳連線陣列
   * @param {Array<string|null>} board
   * @param {number} moveIndex
   * @param {string} player
   * @returns {number[]|null}
   */
  function getImmediateWinLine(board, moveIndex, player) {
    if (board[moveIndex] !== null) return null;
    const next = board.slice();
    next[moveIndex] = player;
    for (const line of WIN_LINES) {
      if (!line.includes(moveIndex)) continue;
      const [a, b, c] = line;
      if (next[a] === player && next[b] === player && next[c] === player) {
        return line;
      }
    }
    return null;
  }

  /**
   * 計算某棋盤狀態下，指定玩家有幾個立即獲勝的空格（聽牌數）
   * @param {Array<string|null>} board
   * @param {string} player
   * @returns {number[]} 可立即獲勝的空格索引列表
   */
  function getWinningThreatCells(board, player) {
    const threats = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === null && getImmediateWinLine(board, i, player) !== null) {
        threats.push(i);
      }
    }
    return threats;
  }

  /**
   * 檢查 player 下在 moveIndex 後是否創造雙重威脅（Fork：至少兩個不同空格可立即獲勝）
   * @param {Array<string|null>} board
   * @param {number} moveIndex
   * @param {string} player
   * @returns {number[]|null} 若形成岔路則回傳聽牌格列表，否則 null
   */
  function getCreatedForkThreats(board, moveIndex, player) {
    if (board[moveIndex] !== null) return null;
    const next = board.slice();
    next[moveIndex] = player;
    const threats = getWinningThreatCells(next, player);
    return threats.length >= 2 ? threats : null;
  }

  /**
   * 檢查對手在目前棋盤是否潛在可製造岔路（Fork），而我方下 moveIndex 可阻止或迫使對手防守
   * @param {Array<string|null>} board
   * @param {number} moveIndex
   * @param {string} player
   * @returns {boolean}
   */
  function doesMovePreventOpponentFork(board, moveIndex, player) {
    const opponent = player === 'X' ? 'O' : 'X';
    const legalMoves = getLegalMoves(board);
    // 先確認對手若在此局面下棋，是否存在可形成雙活（Fork）的位置
    let opponentHasForkSquare = false;
    for (const m of legalMoves) {
      if (getCreatedForkThreats(board, m, opponent) !== null) {
        opponentHasForkSquare = true;
        break;
      }
    }

    // 或者經典對角開局（對手佔兩對角、我方佔中心）對手下一手若自由下角落會形成雙活
    if (!opponentHasForkSquare) {
      // 檢查如果我方隨便下一格不具威脅的格子，對手是否就能造出雙活
      let opponentCanForkIn1Move = false;
      for (const m of legalMoves) {
        const afterPlayer = board.slice();
        afterPlayer[m] = player;
        for (const oppMove of getLegalMoves(afterPlayer)) {
          if (getCreatedForkThreats(afterPlayer, oppMove, opponent) !== null) {
            opponentCanForkIn1Move = true;
            break;
          }
        }
        if (opponentCanForkIn1Move) break;
      }
      if (!opponentCanForkIn1Move) return false;
    }

    // 檢查我方下 moveIndex 後，是否直接佔領對手的岔路點，或製造聽牌迫使對手防守且防守後無法同時造岔路
    if (getCreatedForkThreats(board, moveIndex, opponent) !== null) {
      return true;
    }

    const afterMove = board.slice();
    afterMove[moveIndex] = player;
    const myThreats = getWinningThreatCells(afterMove, player);
    if (myThreats.length === 1) {
      const forcedReply = myThreats[0];
      // 對手被迫擋在 forcedReply 時，不能同時形成對手的雙活
      if (getCreatedForkThreats(afterMove, forcedReply, opponent) === null) {
        return true;
      }
    }
    return false;
  }

  // 記憶化快取以加速確定性 Minimax
  const minimaxCache = new Map();

  /**
   * 確定性極小化極大演算法（Minimax）計算盤面分數
   * @param {Array<string|null>} board
   * @param {string} currentTurn
   * @param {string} maximizingPlayer
   * @param {number} depth
   * @returns {number}
   */
  function minimaxScore(board, currentTurn, maximizingPlayer, depth) {
    const evalResult = evaluateBoard(board);
    if (evalResult.winner === maximizingPlayer) {
      return 10 - depth;
    }
    if (evalResult.winner !== null) {
      return depth - 10;
    }
    if (evalResult.isDraw) {
      return 0;
    }

    const cacheKey = `${board.join('-')}_${currentTurn}_${maximizingPlayer}_${depth}`;
    if (minimaxCache.has(cacheKey)) {
      return minimaxCache.get(cacheKey);
    }

    const legalMoves = getLegalMoves(board);
    const nextTurn = currentTurn === 'X' ? 'O' : 'X';

    if (currentTurn === maximizingPlayer) {
      let best = -Infinity;
      for (const move of legalMoves) {
        board[move] = currentTurn;
        const score = minimaxScore(board, nextTurn, maximizingPlayer, depth + 1);
        board[move] = null;
        if (score > best) best = score;
      }
      minimaxCache.set(cacheKey, best);
      return best;
    } else {
      let best = Infinity;
      for (const move of legalMoves) {
        board[move] = currentTurn;
        const score = minimaxScore(board, nextTurn, maximizingPlayer, depth + 1);
        board[move] = null;
        if (score < best) best = score;
      }
      minimaxCache.set(cacheKey, best);
      return best;
    }
  }

  /**
   * 計算候選步的戰術優先級與真實中文原因說明
   * 類別包含：立即獲勝 (win now)、阻擋對手 (block opponent)、創造或破解岔路 (fork)、佔領中心 (center)、佔領角落 (corner)
   * @param {Array<string|null>} board
   * @param {number} moveIndex
   * @param {string} player
   * @returns {{ priority: number, category: string, explanation: string }}
   */
  function analyzeTacticalReason(board, moveIndex, player) {
    const opponent = player === 'X' ? 'O' : 'X';
    const cellNum = moveIndex + 1;

    // 1. 立即獲勝 (Win now)
    const winLine = getImmediateWinLine(board, moveIndex, player);
    if (winLine !== null) {
      const lineStr = winLine.map((i) => i + 1).join('、');
      return {
        priority: 100,
        category: 'win',
        explanation: `立即獲勝：下在第 ${cellNum} 格可直接連成一線（第 ${lineStr} 格）贏得比賽。`,
      };
    }

    // 2. 阻擋對手獲勝 (Block opponent)
    const blockLine = getImmediateWinLine(board, moveIndex, opponent);
    if (blockLine !== null) {
      const oppExisting = blockLine
        .filter((i) => i !== moveIndex)
        .map((i) => i + 1)
        .join('、');
      return {
        priority: 90,
        category: 'block',
        explanation: `阻擋對手：對手已在第 ${oppExisting} 格聽牌，必須下在第 ${cellNum} 格阻擋對手下一手獲勝。`,
      };
    }

    // 3. 創造雙重威脅 / 岔路 (Create Fork)
    const forkThreats = getCreatedForkThreats(board, moveIndex, player);
    if (forkThreats !== null) {
      const threatStr = forkThreats.map((i) => i + 1).join('、');
      return {
        priority: 80,
        category: 'fork',
        explanation: `創造岔路（雙重威脅）：下在第 ${cellNum} 格可同時聽牌第 ${threatStr} 格，對手無法同時防守兩條路線。`,
      };
    }

    // 4. 阻擋對手創造岔路 (Block Opponent Fork)
    if (doesMovePreventOpponentFork(board, moveIndex, player)) {
      return {
        priority: 70,
        category: 'fork',
        explanation: `破解對手岔路（雙重威脅）：下在第 ${cellNum} 格可主動製造連線威脅或卡住要點，防止對手形成雙活岔路。`,
      };
    }

    // 5. 佔領中心 (Center)
    if (moveIndex === 4) {
      return {
        priority: 60,
        category: 'center',
        explanation: `佔領中心：第 5 格位於棋盤中央，同時涵蓋 4 條連線方向（橫、直、雙對角線），控制力最強。`,
      };
    }

    // 6. 佔領角落 (Corner)
    if (CORNERS.includes(moveIndex)) {
      return {
        priority: 50,
        category: 'corner',
        explanation: `佔領角落：第 ${cellNum} 格為角落位置，涵蓋 3 條連線路徑，是穩固防守並拓展攻勢的最佳據點。`,
      };
    }

    // 7. 邊格輔助控制
    return {
      priority: 40,
      category: 'edge',
      explanation: `穩健佈局（邊格控制）：下在第 ${cellNum} 格可維持雙方均衡防線，確保不敗局面。`,
    };
  }

  /**
   * 根據確定性 Minimax 找出最佳合法步數與戰術說明
   * @param {Array<string|null>} board
   * @param {string} player
   * @returns {{ moveIndex: number, cellNumber: number, score: number, category: string, explanation: string } | null}
   */
  function getBestRecommendation(board, player) {
    const evalResult = evaluateBoard(board);
    if (evalResult.winner !== null || evalResult.isDraw) {
      return null;
    }

    const legalMoves = getLegalMoves(board);
    if (legalMoves.length === 0) return null;

    const nextTurn = player === 'X' ? 'O' : 'X';
    const candidates = legalMoves.map((moveIndex) => {
      const nextBoard = board.slice();
      nextBoard[moveIndex] = player;
      const score = minimaxScore(nextBoard, nextTurn, player, 1);
      const tactical = analyzeTacticalReason(board, moveIndex, player);
      return {
        moveIndex,
        cellNumber: moveIndex + 1,
        score,
        priority: tactical.priority,
        category: tactical.category,
        explanation: tactical.explanation,
      };
    });

    // 先依 Minimax 分數由高至低排序；同分時依戰術優先級排序；再同分依格號由小至大排序（100% 確定性）
    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.moveIndex - b.moveIndex;
    });

    return candidates[0];
  }

  // 若在瀏覽器環境則初始化 UI 互動
  if (typeof document !== 'undefined') {
    let board = Array(9).fill(null);
    let currentTurn = 'X';
    let mode = 'pve'; // 'pve': 單人對抗電腦 (玩家 X vs 電腦 O), 'pvp': 雙人同機對戰
    let gameOver = false;
    let isComputerThinking = false;
    let computerTimerId = null;

    const statusDisplay = document.getElementById('status-display');
    const advisorMove = document.getElementById('advisor-move');
    const advisorReason = document.getElementById('advisor-reason');
    const modePveBtn = document.getElementById('mode-pve');
    const modePvpBtn = document.getElementById('mode-pvp');
    const restartBtn = document.getElementById('restart-btn');
    const cellElements = Array.from(document.querySelectorAll('.cell'));

    function cancelPendingComputerMove() {
      if (computerTimerId !== null) {
        clearTimeout(computerTimerId);
        computerTimerId = null;
      }
      isComputerThinking = false;
    }

    function getPlayerLabel(mark) {
      if (mode === 'pve') {
        return mark === 'X' ? '玩家 X' : '電腦 O';
      }
      return `玩家 ${mark}`;
    }

    function updateUI() {
      const evalResult = evaluateBoard(board);
      const recommendation = !gameOver ? getBestRecommendation(board, currentTurn) : null;

      cellElements.forEach((cellEl, idx) => {
        const markSpan = cellEl.querySelector('.cell-mark');
        const mark = board[idx];
        markSpan.textContent = mark ? mark : '';

        const stateLabel = mark ? `已下 ${mark}` : '空白';
        cellEl.setAttribute('aria-label', `第 ${idx + 1} 格，${stateLabel}`);

        const isWinningCell = Boolean(evalResult.line && evalResult.line.includes(idx));
        cellEl.classList.toggle('winning-cell', isWinningCell);

        const isRecommended = Boolean(
          recommendation && recommendation.moveIndex === idx && !isComputerThinking
        );
        cellEl.classList.toggle('recommended-cell', isRecommended);

        // 遊戲結束、電腦思考中、或該格已有棋子時禁止點擊
        cellEl.disabled = gameOver || isComputerThinking || mark !== null;
      });

      if (evalResult.winner) {
        const winnerName = getPlayerLabel(evalResult.winner);
        const lineNums = evalResult.line.map((i) => i + 1).join('、');
        statusDisplay.textContent = `遊戲結束：${winnerName} 獲勝！（連線：第 ${lineNums} 格）`;
        advisorMove.textContent = '本局已結束（分出勝負）';
        advisorReason.textContent = `${winnerName} 已於第 ${lineNums} 格連成一線獲勝。點擊「重新開始」即可進行下一局。`;
      } else if (evalResult.isDraw) {
        statusDisplay.textContent = '遊戲結束：雙方平手（和局）！';
        advisorMove.textContent = '本局已結束（雙方平手）';
        advisorReason.textContent = '棋盤 9 格已滿且無任何一方連成三子。點擊「重新開始」即可再玩一局。';
      } else {
        const turnName = getPlayerLabel(currentTurn);
        if (isComputerThinking) {
          statusDisplay.textContent = `目前回合：${turnName}（電腦思考中…）`;
        } else {
          statusDisplay.textContent = `目前回合：${turnName}`;
        }

        if (recommendation) {
          advisorMove.textContent = `建議 ${turnName} 下在：第 ${recommendation.cellNumber} 格`;
          advisorReason.textContent = `戰術原因：${recommendation.explanation}`;
        }
      }
    }

    function makeMove(index) {
      if (gameOver || board[index] !== null) return false;

      board[index] = currentTurn;
      const evalResult = evaluateBoard(board);

      if (evalResult.winner !== null || evalResult.isDraw) {
        gameOver = true;
        cancelPendingComputerMove();
        updateUI();
        return true;
      }

      currentTurn = currentTurn === 'X' ? 'O' : 'X';

      if (mode === 'pve' && currentTurn === 'O') {
        isComputerThinking = true;
        updateUI();
        computerTimerId = setTimeout(() => {
          computerTimerId = null;
          if (gameOver || mode !== 'pve' || currentTurn !== 'O') {
            isComputerThinking = false;
            return;
          }
          const best = getBestRecommendation(board, 'O');
          isComputerThinking = false;
          if (best !== null) {
            makeMove(best.moveIndex);
          }
        }, 280);
      } else {
        updateUI();
      }

      return true;
    }

    function handleCellClick(index) {
      if (gameOver || isComputerThinking || board[index] !== null) {
        return;
      }
      if (mode === 'pve' && currentTurn !== 'X') {
        return;
      }
      makeMove(index);
    }

    function restartGame() {
      cancelPendingComputerMove();
      board = Array(9).fill(null);
      currentTurn = 'X';
      gameOver = false;
      updateUI();
    }

    function setMode(newMode) {
      if (mode === newMode) {
        restartGame();
        return;
      }
      mode = newMode;
      const isPve = mode === 'pve';
      modePveBtn.classList.toggle('active', isPve);
      modePveBtn.setAttribute('aria-pressed', String(isPve));
      modePvpBtn.classList.toggle('active', !isPve);
      modePvpBtn.setAttribute('aria-pressed', String(!isPve));
      restartGame();
    }

    cellElements.forEach((cellEl) => {
      cellEl.addEventListener('click', () => {
        const index = Number(cellEl.getAttribute('data-index'));
        handleCellClick(index);
      });
    });

    modePveBtn.addEventListener('click', () => setMode('pve'));
    modePvpBtn.addEventListener('click', () => setMode('pvp'));
    restartBtn.addEventListener('click', () => restartGame());

    updateUI();
  }

  // 匯出供自動化測試驗證（Wins, Draws, Blocking, Unbeatable AI, Explanations）
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      WIN_LINES,
      evaluateBoard,
      getLegalMoves,
      getBestRecommendation,
      analyzeTacticalReason,
    };
  }
})();
