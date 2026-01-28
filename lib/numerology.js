/**
 * lib/numerology.js
 *
 * 数秘術モジュール：
 * - 生年月日からライフパス・バースデイ
 * - 名前（ローマ字）からソウル/パーソナリティ/ディスティニー
 * - Pythagorean 数秘術（1-9 + マスターナンバー11,22,33）
 */

// ---- アルファベット → 数値マッピング (Pythagorean) ----
const pythagoreanMap = {
  A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, I:9,
  J:1, K:2, L:3, M:4, N:5, O:6, P:7, Q:8, R:9,
  S:1, T:2, U:3, V:4, W:5, X:6, Y:7, Z:8,
};

// 母音判定セット（Yは母音扱い／流派による調整は可能）
const vowels = new Set(["A","E","I","O","U","Y"]);

// ---- 数値還元（マスターナンバー対応） ----
function reduceNumber(num) {
  const masterNums = new Set([11, 22, 33]);
  let n = num;
  while (n > 9 && !masterNums.has(n)) {
    const s = String(n).split("");
    n = s.reduce((acc, digit) => acc + Number(digit), 0);
  }
  return n;
}

// ---- 生年月日計算 ----

/**
 * ライフパスナンバー
 * 生年月日 string ("YYYY-MM-DD")
 */
export function calcLifePath(dateStr) {
  const digits = String(dateStr).replace(/[^0-9]/g, "");
  const sum = digits.split("").reduce((acc, d) => acc + Number(d), 0);
  return reduceNumber(sum);
}

/**
 * バースデイナンバー（日付のみの数）
 */
export function calcBirthdayNumber(dateStr) {
  const day = dateStr.split("-")[2] || "";
  const sumDigits = String(day).split("").reduce((acc, d) => acc + Number(d), 0);
  return reduceNumber(sumDigits);
}

/**
 * 名前を大文字化 + 不要文字を削除
 */
function normalizeName(name) {
  return String(name || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

// ---- 名前関連数秘 ----

/**
 * 名前文字列 → 数値配列
 */
function nameToNumbers(name) {
  const s = normalizeName(name);
  return Array.from(s)
    .map((ch) => pythagoreanMap[ch] ?? null)
    .filter((n) => typeof n === "number");
}

/**
 * ソウルナンバー（母音のみ）
 */
export function calcSoulNumber(name) {
  const nums = nameToNumbers(name).filter((n, i) => {
    const ch = normalizeName(name).charAt(i);
    return vowels.has(ch);
  });
  const sum = nums.reduce((acc, n) => acc + n, 0);
  return reduceNumber(sum);
}

/**
 * パーソナリティナンバー（子音のみ）
 */
export function calcPersonalityNumber(name) {
  const nums = nameToNumbers(name).filter((n, i) => {
    const ch = normalizeName(name).charAt(i);
    return !vowels.has(ch);
  });
  const sum = nums.reduce((acc, n) => acc + n, 0);
  return reduceNumber(sum);
}

/**
 * ディスティニーナンバー（名前全体）
 */
export function calcDestinyNumber(name) {
  const nums = nameToNumbers(name);
  const sum = nums.reduce((acc, n) => acc + n, 0);
  return reduceNumber(sum);
}

/**
 * 名前数値詳細（全値 + 各ナンバー）
 */
export function analyzeNameNumbers(name) {
  const normalized = normalizeName(name);
  const allNums = nameToNumbers(name);
  return {
    normalized,
    raw: allNums,
    soul: calcSoulNumber(name),
    personality: calcPersonalityNumber(name),
    destiny: calcDestinyNumber(name),
  };
}

/**
 * 数秘術データ全体をまとめて取得（date + name）
 */
export function calcNumerologyFull({ dateStr, name }) {
  return {
    lifePath: calcLifePath(dateStr),
    birthday: calcBirthdayNumber(dateStr),
    ...analyzeNameNumbers(name),
  };
}
