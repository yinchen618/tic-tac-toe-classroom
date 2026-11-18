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

  const SUPPORTED_LANGUAGES = ['zh-Hant', 'en', 'ja', 'id'];

  const TRANSLATIONS = {
    'zh-Hant': {
      pageTitle: '井字遊戲教學示範（Tic-Tac-Toe）',
      headerTitle: '井字遊戲教學示範',
      headerSubtitle: '極小化極大演算法（Minimax）即時戰術分析',
      helpLink: '查看遊戲說明與戰術指南（如何遊玩與閱讀建議）',
      langLabel: '語言 / Language:',
      modePve: '單人對抗電腦',
      modePvp: '雙人同機對戰',
      restartBtn: '重新開始',
      boardAriaLabel: '井字遊戲棋盤（格子編號 1 至 9）',
      modeGroupAriaLabel: '對戰模式選擇',
      playerX: '玩家 X',
      playerO: '玩家 O',
      computerO: '電腦 O',
      turn: (p) => `目前回合：${p}`,
      turnThinking: (p) => `目前回合：${p}（電腦思考中…）`,
      gameOverWin: (w, line) => `遊戲結束：${w} 獲勝！（連線：第 ${line} 格）`,
      gameOverDraw: '遊戲結束：雙方平手（和局）！',
      advisorTitle: '最佳步數建議與戰術解析（Minimax）',
      gameOverWinMove: '本局已結束（分出勝負）',
      gameOverWinReason: (w, line) => `${w} 已於第 ${line} 格連成一線獲勝。點擊「重新開始」即可進行下一局。`,
      gameOverDrawMove: '本局已結束（雙方平手）',
      gameOverDrawReason: '棋盤 9 格已滿且無任何一方連成三子。點擊「重新開始」即可再玩一局。',
      recommendMove: (p, cell) => `建議 ${p} 下在：第 ${cell} 格`,
      reasonPrefix: '戰術原因：',
      cellAria: (num, mark) => `第 ${num} 格，${mark ? `已下 ${mark}` : '空白'}`,
      delimiter: '、',
      tactics: {
        win: (c, line) => `立即獲勝：下在第 ${c} 格可直接連成一線（第 ${line} 格）贏得比賽。`,
        block: (c, opp) => `阻擋對手：對手已在第 ${opp} 格聽牌，必須下在第 ${c} 格阻擋對手下一手獲勝。`,
        fork: (c, threats) => `創造岔路（雙重威脅）：下在第 ${c} 格可同時聽牌第 ${threats} 格，對手無法同時防守兩條路線。`,
        block_fork: (c) => `破解對手岔路（雙重威脅）：下在第 ${c} 格可主動製造連線威脅或卡住要點，防止對手形成雙活岔路。`,
        center: () => `佔領中心：第 5 格位於棋盤中央，同時涵蓋 4 條連線方向（橫、直、雙對角線），控制力最強。`,
        corner: (c) => `佔領角落：第 ${c} 格為角落位置，涵蓋 3 條連線路徑，是穩固防守並拓展攻勢的最佳據點。`,
        edge: (c) => `穩健佈局（邊格控制）：下在第 ${c} 格可維持雙方均衡防線，確保不敗局面。`,
      },
    },
    'en': {
      pageTitle: 'Tic-Tac-Toe Classroom Demonstration',
      headerTitle: 'Tic-Tac-Toe Classroom Demo',
      headerSubtitle: 'Real-time Tactical Analysis via Minimax Algorithm',
      helpLink: 'View Game Instructions & Tactical Guide',
      langLabel: 'Language:',
      modePve: '1 Player vs Computer',
      modePvp: '2 Players (Pass & Play)',
      restartBtn: 'Restart',
      boardAriaLabel: 'Tic-Tac-Toe board (cells 1 to 9)',
      modeGroupAriaLabel: 'Game Mode Selection',
      playerX: 'Player X',
      playerO: 'Player O',
      computerO: 'Computer O',
      turn: (p) => `Current Turn: ${p}`,
      turnThinking: (p) => `Current Turn: ${p} (Computer thinking...)`,
      gameOverWin: (w, line) => `Game Over: ${w} Wins! (Line: cells ${line})`,
      gameOverDraw: "Game Over: It's a Draw!",
      advisorTitle: 'Recommended Move & Tactical Analysis (Minimax)',
      gameOverWinMove: 'Match Finished (Decisive)',
      gameOverWinReason: (w, line) => `${w} won by completing a line on cells ${line}. Click "Restart" to play another game.`,
      gameOverDrawMove: 'Match Finished (Draw)',
      gameOverDrawReason: 'All 9 cells are filled with no 3-in-a-row. Click "Restart" to play another game.',
      recommendMove: (p, cell) => `Recommended for ${p}: Cell ${cell}`,
      reasonPrefix: 'Tactical Reason: ',
      cellAria: (num, mark) => `Cell ${num}, ${mark ? `Marked ${mark}` : 'Empty'}`,
      delimiter: ', ',
      tactics: {
        win: (c, line) => `Immediate Win: Playing in cell ${c} directly completes a winning line (cells ${line}).`,
        block: (c, opp) => `Block Opponent: Opponent threatens to win at cells ${opp}. You must play cell ${c} to block them.`,
        fork: (c, threats) => `Create Fork (Double Threat): Playing cell ${c} creates two simultaneous winning threats at cells ${threats}, which cannot both be blocked.`,
        block_fork: (c) => `Prevent Opponent Fork: Playing cell ${c} forces a defensive response or occupies a key square, preventing an opponent double threat.`,
        center: () => `Take the Center: Cell 5 is at the center of the board, covering 4 winning lines (horizontal, vertical, both diagonals) with maximum control.`,
        corner: (c) => `Take a Corner: Cell ${c} is a corner position covering 3 winning paths, establishing a solid defense and offensive setup.`,
        edge: (c) => `Solid Positional Move (Edge): Playing cell ${c} maintains balanced defense and guarantees safety.`,
      },
    },
    'ja': {
      pageTitle: '三目並べ学習デモ（Tic-Tac-Toe）',
      headerTitle: '三目並べ学習デモ',
      headerSubtitle: 'ミニマックス法（Minimax）リアルタイム戦術解析',
      helpLink: 'ゲーム説明と戦術ガイドを見る',
      langLabel: '言語 / Language:',
      modePve: '1人プレイ（vs コンピュータ）',
      modePvp: '2人プレイ（交互に対局）',
      restartBtn: '最初からやり直す',
      boardAriaLabel: '三目並べ盤面（マス 1 〜 9）',
      modeGroupAriaLabel: '対戦モードの選択',
      playerX: 'プレイヤー X',
      playerO: 'プレイヤー O',
      computerO: 'コンピュータ O',
      turn: (p) => `現在の手番：${p}`,
      turnThinking: (p) => `現在の手番：${p}（コンピュータ思考中…）`,
      gameOverWin: (w, line) => `ゲーム終了：${w} の勝利！（揃ったライン：マス ${line}）`,
      gameOverDraw: 'ゲーム終了：引き分けです！',
      advisorTitle: '最善手のおすすめと戦術解説（Minimax）',
      gameOverWinMove: '終局（勝敗決定）',
      gameOverWinReason: (w, line) => `${w} がマス ${line} で一列を揃えて勝利しました。「最初からやり直す」をクリックして次のゲームを始められます。`,
      gameOverDrawMove: '終局（引き分け）',
      gameOverDrawReason: '9マスすべてが埋まり、どちらも3つ並びませんでした。「最初からやり直す」で再戦できます。',
      recommendMove: (p, cell) => `${p} へのおすすめ：マス ${cell}`,
      reasonPrefix: '戦術理由：',
      cellAria: (num, mark) => `マス ${num}、${mark ? `${mark} が配置済み` : '空白'}`,
      delimiter: '・',
      tactics: {
        win: (c, line) => `即時勝利：マス ${c} に置くことで一列（マス ${line}）が揃い、勝利が決まります。`,
        block: (c, opp) => `相手の阻止：相手がマス ${opp} でリーチをかけているため、マス ${c} でブロックする必要があります。`,
        fork: (c, threats) => `岔路（両建て）の作成：マス ${c} に打つとマス ${threats} の2つのリーチが同時に発生し、相手は両方を防ぐことができません。`,
        block_fork: (c) => `相手の岔路（両建て）を阻止：マス ${c} を抑えるか脅威を作ることで、相手に両建ての岔路を作らせないようにします。`,
        center: () => `中央を確保：マス 5 は盤面中央に位置し、縦・横・斜め計4本のラインに関与するため、最も制約力・展開力が高い位置です。`,
        corner: (c) => `角を確保：マス ${c} は角のマスであり、3本のラインに関与する堅実な攻防の拠点となります。`,
        edge: (c) => `堅実な着手（辺の確保）：マス ${c} に打つことで盤面の均衡を保ち、敗北を防ぐ安全策をとります。`,
      },
    },
    'id': {
      pageTitle: 'Demonstrasi Kelas Tic-Tac-Toe',
      headerTitle: 'Demonstrasi Kelas Tic-Tac-Toe',
      headerSubtitle: 'Analisis Taktis Real-time dengan Algoritma Minimax',
      helpLink: 'Lihat Panduan Permainan & Taktik',
      langLabel: 'Bahasa:',
      modePve: '1 Pemain vs Komputer',
      modePvp: '2 Pemain (Satu Perangkat)',
      restartBtn: 'Mulai Ulang',
      boardAriaLabel: 'Papan Tic-Tac-Toe (petak 1 hingga 9)',
      modeGroupAriaLabel: 'Pilihan Mode Permainan',
      playerX: 'Pemain X',
      playerO: 'Pemain O',
      computerO: 'Komputer O',
      turn: (p) => `Giliran Saat Ini: ${p}`,
      turnThinking: (p) => `Giliran Saat Ini: ${p} (Komputer sedang berpikir...)`,
      gameOverWin: (w, line) => `Permainan Selesai: ${w} Menang! (Garis: petak ${line})`,
      gameOverDraw: 'Permainan Selesai: Seri!',
      advisorTitle: 'Rekomendasi Langkah & Analisis Taktis (Minimax)',
      gameOverWinMove: 'Permainan Selesai (Ada Pemenang)',
      gameOverWinReason: (w, line) => `${w} menang dengan membuat garis pada petak ${line}. Klik "Mulai Ulang" untuk bermain lagi.`,
      gameOverDrawMove: 'Permainan Selesai (Seri)',
      gameOverDrawReason: 'Semua 9 petak terisi tanpa ada 3 berurutan. Klik "Mulai Ulang" untuk bermain lagi.',
      recommendMove: (p, cell) => `Rekomendasi untuk ${p}: Petak ${cell}`,
      reasonPrefix: 'Alasan Taktis: ',
      cellAria: (num, mark) => `Petak ${num}, ${mark ? `Terisi ${mark}` : 'Kosong'}`,
      delimiter: ', ',
      tactics: {
        win: (c, line) => `Menang Langsung: Memilih petak ${c} langsung membentuk satu garis (petak ${line}) untuk memenangkan permainan.`,
        block: (c, opp) => `Blokir Lawan: Lawan berpotensi menang dari petak ${opp}. Harus memilih petak ${c} untuk memblokir kemenangan lawan.`,
        fork: (c, threats) => `Buat Cabang (Ancaman Ganda): Memilih petak ${c} membuat dua ancaman kemenangan sekaligus di petak ${threats}, lawan tidak dapat memblokir keduanya.`,
        block_fork: (c) => `Cegah Cabang Lawan: Memilih petak ${c} secara aktif menekan atau mengamankan titik kunci, mencegah lawan membuat ancaman ganda.`,
        center: () => `Kuasai Tengah: Petak 5 berada di tengah papan, mencakup 4 arah garis kemenangan (horizontal, vertikal, kedua diagonal) dengan kendali terkuat.`,
        corner: (c) => `Kuasai Sudut: Petak ${c} adalah posisi sudut yang mencakup 3 jalur kemenangan, menjadi basis kuat untuk bertahan maupun menyerang.`,
        edge: (c) => `Langkah Posisional (Sisi): Memilih petak ${c} menjaga keseimbangan dan mengamankan posisi yang tidak kalah.`,
      },
    },
  };

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
    let opponentHasForkSquare = false;
    for (const m of legalMoves) {
      if (getCreatedForkThreats(board, m, opponent) !== null) {
        opponentHasForkSquare = true;
        break;
      }
    }

    if (!opponentHasForkSquare) {
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

    if (getCreatedForkThreats(board, moveIndex, opponent) !== null) {
      return true;
    }

    const afterMove = board.slice();
    afterMove[moveIndex] = player;
    const myThreats = getWinningThreatCells(afterMove, player);
    if (myThreats.length === 1) {
      const forcedReply = myThreats[0];
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
   * 計算候選步的戰術優先級與多國語系原因說明
   * 類別包含：立即獲勝 (win)、阻擋對手 (block)、創造或破解岔路 (fork)、佔領中心 (center)、佔領角落 (corner)、邊格 (edge)
   * @param {Array<string|null>} board
   * @param {number} moveIndex
   * @param {string} player
   * @param {string} [lang='zh-Hant']
   * @returns {{ priority: number, category: string, explanation: string }}
   */
  function analyzeTacticalReason(board, moveIndex, player, lang = 'zh-Hant') {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['zh-Hant'];
    const opponent = player === 'X' ? 'O' : 'X';
    const cellNum = moveIndex + 1;
    const delim = dict.delimiter || '、';

    // 1. 立即獲勝 (Win now)
    const winLine = getImmediateWinLine(board, moveIndex, player);
    if (winLine !== null) {
      const lineStr = winLine.map((i) => i + 1).join(delim);
      return {
        priority: 100,
        category: 'win',
        explanation: dict.tactics.win(cellNum, lineStr),
      };
    }

    // 2. 阻擋對手獲勝 (Block opponent)
    const blockLine = getImmediateWinLine(board, moveIndex, opponent);
    if (blockLine !== null) {
      const oppExisting = blockLine
        .filter((i) => i !== moveIndex)
        .map((i) => i + 1)
        .join(delim);
      return {
        priority: 90,
        category: 'block',
        explanation: dict.tactics.block(cellNum, oppExisting),
      };
    }

    // 3. 創造雙重威脅 / 岔路 (Create Fork)
    const forkThreats = getCreatedForkThreats(board, moveIndex, player);
    if (forkThreats !== null) {
      const threatStr = forkThreats.map((i) => i + 1).join(delim);
      return {
        priority: 80,
        category: 'fork',
        explanation: dict.tactics.fork(cellNum, threatStr),
      };
    }

    // 4. 阻擋對手創造岔路 (Block Opponent Fork)
    if (doesMovePreventOpponentFork(board, moveIndex, player)) {
      return {
        priority: 70,
        category: 'fork',
        explanation: dict.tactics.block_fork(cellNum),
      };
    }

    // 5. 佔領中心 (Center)
    if (moveIndex === 4) {
      return {
        priority: 60,
        category: 'center',
        explanation: dict.tactics.center(),
      };
    }

    // 6. 佔領角落 (Corner)
    if (CORNERS.includes(moveIndex)) {
      return {
        priority: 50,
        category: 'corner',
        explanation: dict.tactics.corner(cellNum),
      };
    }

    // 7. 邊格輔助控制 (Edge)
    return {
      priority: 40,
      category: 'edge',
      explanation: dict.tactics.edge(cellNum),
    };
  }

  /**
   * 根據確定性 Minimax 找出最佳合法步數與戰術說明
   * @param {Array<string|null>} board
   * @param {string} player
   * @param {string} [lang='zh-Hant']
   * @returns {{ moveIndex: number, cellNumber: number, score: number, category: string, explanation: string } | null}
   */
  function getBestRecommendation(board, player, lang = 'zh-Hant') {
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
      const tactical = analyzeTacticalReason(board, moveIndex, player, lang);
      return {
        moveIndex,
        cellNumber: moveIndex + 1,
        score,
        priority: tactical.priority,
        category: tactical.category,
        explanation: tactical.explanation,
      };
    });

    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.moveIndex - b.moveIndex;
    });

    return candidates[0];
  }

  // 瀏覽器環境互動
  if (typeof document !== 'undefined') {
    let currentLang = 'zh-Hant';
    try {
      if (typeof localStorage !== 'undefined') {
        const savedLang = localStorage.getItem('ttt_lang');
        if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
          currentLang = savedLang;
        }
      }
    } catch (e) {}

    let board = Array(9).fill(null);
    let currentTurn = 'X';
    let mode = 'pve'; // 'pve': 單人對抗電腦, 'pvp': 雙人同機對戰
    let gameOver = false;
    let isComputerThinking = false;
    let computerTimerId = null;

    const pageTitleEl = document.getElementById('page-title');
    const headerTitleEl = document.getElementById('header-title');
    const headerSubtitleEl = document.getElementById('header-subtitle');
    const helpLinkEl = document.getElementById('help-link');
    const langSelectEl = document.getElementById('lang-select');
    const langLabelEl = document.getElementById('lang-label');
    const boardEl = document.getElementById('board');
    const modeGroupEl = document.getElementById('mode-group');
    const statusDisplay = document.getElementById('status-display');
    const advisorTitleEl = document.getElementById('advisor-title');
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

    function getPlayerLabel(mark, lang) {
      const dict = TRANSLATIONS[lang] || TRANSLATIONS['zh-Hant'];
      if (mode === 'pve') {
        return mark === 'X' ? dict.playerX : dict.computerO;
      }
      return mark === 'X' ? dict.playerX : dict.playerO;
    }

    function setLanguage(newLang) {
      if (!SUPPORTED_LANGUAGES.includes(newLang)) return;
      currentLang = newLang;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('ttt_lang', newLang);
        }
      } catch (e) {}

      if (document.documentElement) {
        document.documentElement.lang = newLang;
      }
      const dict = TRANSLATIONS[newLang];

      if (pageTitleEl) pageTitleEl.textContent = dict.pageTitle;
      if (headerTitleEl) headerTitleEl.textContent = dict.headerTitle;
      if (headerSubtitleEl) headerSubtitleEl.textContent = dict.headerSubtitle;
      if (helpLinkEl) helpLinkEl.textContent = dict.helpLink;
      if (langLabelEl) {
        langLabelEl.innerHTML = `<span aria-hidden="true">🌐</span> ${dict.langLabel}`;
      }
      if (modePveBtn) modePveBtn.textContent = dict.modePve;
      if (modePvpBtn) modePvpBtn.textContent = dict.modePvp;
      if (restartBtn) restartBtn.textContent = dict.restartBtn;
      if (advisorTitleEl) advisorTitleEl.textContent = dict.advisorTitle;
      if (boardEl) boardEl.setAttribute('aria-label', dict.boardAriaLabel);
      if (modeGroupEl) modeGroupEl.setAttribute('aria-label', dict.modeGroupAriaLabel);

      if (langSelectEl && langSelectEl.value !== newLang) {
        langSelectEl.value = newLang;
      }

      updateUI();
    }

    function updateUI() {
      const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['zh-Hant'];
      const delim = dict.delimiter || '、';
      const evalResult = evaluateBoard(board);
      const recommendation = !gameOver ? getBestRecommendation(board, currentTurn, currentLang) : null;

      cellElements.forEach((cellEl, idx) => {
        const markSpan = cellEl.querySelector('.cell-mark');
        const mark = board[idx];
        if (markSpan) markSpan.textContent = mark ? mark : '';

        cellEl.setAttribute('aria-label', dict.cellAria(idx + 1, mark));

        const isWinningCell = Boolean(evalResult.line && evalResult.line.includes(idx));
        cellEl.classList.toggle('winning-cell', isWinningCell);

        const isRecommended = Boolean(
          recommendation && recommendation.moveIndex === idx && !isComputerThinking
        );
        cellEl.classList.toggle('recommended-cell', isRecommended);

        cellEl.disabled = gameOver || isComputerThinking || mark !== null;
      });

      if (evalResult.winner) {
        const winnerName = getPlayerLabel(evalResult.winner, currentLang);
        const lineNums = evalResult.line.map((i) => i + 1).join(delim);
        if (statusDisplay) {
          statusDisplay.textContent = dict.gameOverWin(winnerName, lineNums);
        }
        if (advisorMove) advisorMove.textContent = dict.gameOverWinMove;
        if (advisorReason) advisorReason.textContent = dict.gameOverWinReason(winnerName, lineNums);
      } else if (evalResult.isDraw) {
        if (statusDisplay) statusDisplay.textContent = dict.gameOverDraw;
        if (advisorMove) advisorMove.textContent = dict.gameOverDrawMove;
        if (advisorReason) advisorReason.textContent = dict.gameOverDrawReason;
      } else {
        const turnName = getPlayerLabel(currentTurn, currentLang);
        if (statusDisplay) {
          if (isComputerThinking) {
            statusDisplay.textContent = dict.turnThinking(turnName);
          } else {
            statusDisplay.textContent = dict.turn(turnName);
          }
        }

        if (recommendation) {
          if (advisorMove) {
            advisorMove.textContent = dict.recommendMove(turnName, recommendation.cellNumber);
          }
          if (advisorReason) {
            advisorReason.textContent = `${dict.reasonPrefix}${recommendation.explanation}`;
          }
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
          const best = getBestRecommendation(board, 'O', currentLang);
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
      if (modePveBtn) {
        modePveBtn.classList.toggle('active', isPve);
        modePveBtn.setAttribute('aria-pressed', String(isPve));
      }
      if (modePvpBtn) {
        modePvpBtn.classList.toggle('active', !isPve);
        modePvpBtn.setAttribute('aria-pressed', String(!isPve));
      }
      restartGame();
    }

    cellElements.forEach((cellEl) => {
      cellEl.addEventListener('click', () => {
        const index = Number(cellEl.getAttribute('data-index'));
        handleCellClick(index);
      });
    });

    if (modePveBtn) modePveBtn.addEventListener('click', () => setMode('pve'));
    if (modePvpBtn) modePvpBtn.addEventListener('click', () => setMode('pvp'));
    if (restartBtn) restartBtn.addEventListener('click', () => restartGame());

    if (langSelectEl) {
      langSelectEl.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
    }

    setLanguage(currentLang);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      WIN_LINES,
      SUPPORTED_LANGUAGES,
      TRANSLATIONS,
      evaluateBoard,
      getLegalMoves,
      getBestRecommendation,
      analyzeTacticalReason,
    };
  }
})();
