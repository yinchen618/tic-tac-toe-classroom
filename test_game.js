const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const scriptPath = path.join(__dirname, 'script.js');
const {
  WIN_LINES,
  evaluateBoard,
  getLegalMoves,
  getBestRecommendation,
} = require(scriptPath);

console.log('=== 1. 測試所有 8 條獲勝連線 ===');
for (const line of WIN_LINES) {
  for (const player of ['X', 'O']) {
    const board = Array(9).fill(null);
    board[line[0]] = player;
    board[line[1]] = player;
    board[line[2]] = player;
    const res = evaluateBoard(board);
    assert.strictEqual(res.winner, player, `連線 ${line} 應判定 ${player} 獲勝`);
    assert.deepStrictEqual(res.line, line);
    assert.strictEqual(res.isDraw, false);
  }
}
console.log('✓ 8 條連線測試通過');

console.log('=== 2. 測試平手判定 ===');
const drawBoard = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
const drawRes = evaluateBoard(drawBoard);
assert.strictEqual(drawRes.winner, null);
assert.strictEqual(drawRes.isDraw, true);
assert.strictEqual(getBestRecommendation(drawBoard, 'X'), null);
console.log('✓ 平手判定測試通過');

console.log('=== 3. 測試戰術建議與真實原因（立即獲勝、阻擋對手、岔路、中心、角落） ===');
// 中心 (空棋盤)
const emptyBoard = Array(9).fill(null);
const recCenter = getBestRecommendation(emptyBoard, 'X');
assert.strictEqual(recCenter.cellNumber, 5);
assert.strictEqual(recCenter.category, 'center');
assert.ok(recCenter.explanation.includes('佔領中心'));

// 角落 (當中心已被佔領)
const centerTaken = [null, null, null, null, 'X', null, null, null, null];
const recCorner = getBestRecommendation(centerTaken, 'O');
assert.ok([1, 3, 7, 9].includes(recCorner.cellNumber));
assert.strictEqual(recCorner.category, 'corner');
assert.ok(recCorner.explanation.includes('佔領角落'));

// 立即獲勝 (Win now)
const winNowBoard = ['X', 'X', null, 'O', 'O', null, null, null, null];
const recWin = getBestRecommendation(winNowBoard, 'X');
assert.strictEqual(recWin.cellNumber, 3);
assert.strictEqual(recWin.category, 'win');
assert.ok(recWin.explanation.includes('立即獲勝'));

// 阻擋對手 (Block opponent)
const blockBoard = ['X', 'X', null, null, 'O', null, null, null, null];
const recBlock = getBestRecommendation(blockBoard, 'O');
assert.strictEqual(recBlock.cellNumber, 3);
assert.strictEqual(recBlock.category, 'block');
assert.ok(recBlock.explanation.includes('阻擋對手'));

// 創造岔路 (Create Fork): X 在 1(0)、3(2)，O 在 2(1)、4(3)，雙方皆無立即聽牌，X 下 5(4) 同時聽 7(6) 與 9(8)
const forkBoard = ['X', 'O', 'X', 'O', null, null, null, null, null];
const recFork = getBestRecommendation(forkBoard, 'X');
assert.strictEqual(recFork.cellNumber, 5);
assert.strictEqual(recFork.category, 'fork');
assert.ok(recFork.explanation.includes('岔路'));

// 破解對手岔路 (Block Opponent Fork: X 在 1, 9，O 在 5，輪到 O)
const antiForkBoard = ['X', null, null, null, 'O', null, null, null, 'X'];
const recAntiFork = getBestRecommendation(antiForkBoard, 'O');
assert.strictEqual(recAntiFork.category, 'fork');
assert.ok([2, 4, 6, 8].includes(recAntiFork.cellNumber), 'O 必須下邊格以防止 X 角落雙活');
assert.ok(recAntiFork.explanation.includes('岔路'));
console.log('✓ 五大戰術建議與中文解析測試通過');

console.log('=== 4. 窮舉測試電腦 AI 不敗（Unbeatable AI） ===');
function testAllGamesAgainstAI(aiPlayer) {
  let gamesPlayed = 0;
  function simulate(board, turn) {
    const evalRes = evaluateBoard(board);
    if (evalRes.winner !== null || evalRes.isDraw) {
      gamesPlayed++;
      const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
      assert.notStrictEqual(
        evalRes.winner,
        humanPlayer,
        `AI (${aiPlayer}) 絕不能輸給玩家！盤面: ${board.join(',')}`
      );
      return;
    }

    if (turn === aiPlayer) {
      const best = getBestRecommendation(board, aiPlayer);
      assert.ok(best !== null && board[best.moveIndex] === null, 'AI 推薦步必須為合法空格');
      const next = board.slice();
      next[best.moveIndex] = aiPlayer;
      simulate(next, aiPlayer === 'X' ? 'O' : 'X');
    } else {
      for (const move of getLegalMoves(board)) {
        const next = board.slice();
        next[move] = turn;
        simulate(next, turn === 'X' ? 'O' : 'X');
      }
    }
  }
  simulate(Array(9).fill(null), 'X');
  return gamesPlayed;
}

const gamesAsO = testAllGamesAgainstAI('O');
const gamesAsX = testAllGamesAgainstAI('X');
console.log(`✓ AI 執 O 窮舉 ${gamesAsO} 局全數不敗；AI 執 X 窮舉 ${gamesAsX} 局全數不敗`);

console.log('=== 5. 測試 UI 互動、防連點、結束鎖定、重新開始與切換模式取消電腦待執行步 ===');
function createMockDOM() {
  const makeEl = (id, index = null) => {
    const classes = new Set();
    const attrs = {};
    if (index !== null) attrs['data-index'] = String(index);
    const markSpan = { textContent: '' };
    return {
      id,
      textContent: '',
      disabled: false,
      classList: {
        toggle(cls, force) {
          if (force === undefined) {
            if (classes.has(cls)) classes.delete(cls);
            else classes.add(cls);
          } else if (force) classes.add(cls);
          else classes.delete(cls);
        },
        contains(cls) {
          return classes.has(cls);
        },
      },
      setAttribute(k, v) {
        attrs[k] = v;
      },
      getAttribute(k) {
        return attrs[k];
      },
      querySelector(sel) {
        if (sel === '.cell-mark') return markSpan;
        return null;
      },
      addEventListener(type, fn) {
        this._onclick = fn;
      },
      click() {
        if (this.disabled) return;
        if (this._onclick) this._onclick();
      },
      _markSpan: markSpan,
    };
  };

  const els = {
    'status-display': makeEl('status-display'),
    'advisor-move': makeEl('advisor-move'),
    'advisor-reason': makeEl('advisor-reason'),
    'mode-pve': makeEl('mode-pve'),
    'mode-pvp': makeEl('mode-pvp'),
    'restart-btn': makeEl('restart-btn'),
  };
  const cells = Array.from({ length: 9 }, (_, i) => makeEl(`cell-${i}`, i));

  let nextTimerId = 1;
  const timers = new Map();

  const context = {
    document: {
      getElementById: (id) => els[id],
      querySelectorAll: (sel) => (sel === '.cell' ? cells : []),
    },
    setTimeout: (fn) => {
      const id = nextTimerId++;
      timers.set(id, fn);
      return id;
    },
    clearTimeout: (id) => {
      timers.delete(id);
    },
    timers,
    els,
    cells,
  };

  const code = fs.readFileSync(scriptPath, 'utf8');
  vm.runInNewContext(code, context);
  return context;
}

const dom = createMockDOM();
dom.cells[0].click();
assert.strictEqual(dom.cells[0]._markSpan.textContent, 'X');
assert.strictEqual(dom.timers.size, 1, '應有一個待執行的電腦計時器');
assert.strictEqual(dom.cells[1].disabled, true, '電腦思考期間其他空格應被鎖定防止連點');

dom.els['restart-btn'].click();
assert.strictEqual(dom.timers.size, 0, '重新開始時應清除待執行的電腦計時器');
assert.strictEqual(dom.cells[0]._markSpan.textContent, '', '棋盤應清空');
assert.strictEqual(dom.cells[1].disabled, false, '重新開始後空格應恢復可點擊');

dom.cells[0].click();
assert.strictEqual(dom.timers.size, 1);
dom.els['mode-pvp'].click();
assert.strictEqual(dom.timers.size, 0, '切換模式時應清除待執行的電腦計時器');

dom.cells[0].click(); // X -> 1
dom.cells[3].click(); // O -> 4
dom.cells[1].click(); // X -> 2
dom.cells[4].click(); // O -> 5
dom.cells[2].click(); // X -> 3 (X 獲勝!)
assert.ok(dom.els['status-display'].textContent.includes('玩家 X 獲勝'));
assert.strictEqual(dom.cells[5].disabled, true, '遊戲結束後剩餘空格必須鎖定');
dom.cells[5].click();
assert.strictEqual(dom.cells[5]._markSpan.textContent, '', '遊戲結束後點擊不應產生棋子');

console.log('✓ UI 狀態鎖定、計時器取消與重開行為測試全數通過！');
