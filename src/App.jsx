import { useState, useEffect, useRef, useMemo } from "react";
import {
  Sun, Moon, Sunrise, Sunset, CloudSun,
  Lock, Star, Sparkles, Users,
  Home, Gamepad2, BookOpen, ShieldCheck, Camera,
  Plus, X, ArrowRight, KeyRound, Heart, TreeDeciduous, RotateCcw,
  Bell, BellRing, CalendarDays, CalendarRange, ClipboardList, Clock,
  Grid3x3, Puzzle, Brain, Hash, Play, Pause, Bot,
} from "lucide-react";
import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const COLORS = {
  bg: "#F2F6FF",
  card: "#FFFFFF",
  primary: "#4C7EF3",
  primaryDark: "#2A4FAA",
  accent: "#FF9F45",
  accent2: "#9B6BD6",
  leaf: "#35C58F",
  leafLight: "#DCF7EC",
  yellow: "#FFCE45",
  locked: "#E3E8F0",
  text: "#22314A",
  textSoft: "#647089",
  danger: "#F0645A",
};

const PRAYER_DEFS = [
  { id: "fajr", name: "الفجر", Icon: Sunrise },
  { id: "dhuhr", name: "الظهر", Icon: Sun },
  { id: "asr", name: "العصر", Icon: CloudSun },
  { id: "maghrib", name: "المغرب", Icon: Sunset },
  { id: "isha", name: "العشاء", Icon: Moon },
];
const DEFAULT_TASKS = [
  { id: 1, title: "ترتيب غرفتي وسريري", mandatory: true, done: false, photo: false },
  { id: 2, title: "حل واجب المدرسة", mandatory: true, done: false, photo: false },
  { id: 3, title: "قراءة صفحة من القرآن", mandatory: true, done: false, photo: false },
  { id: 4, title: "مساعدة أحد أفراد العائلة", mandatory: false, done: false, photo: false },
];
const TASK_ICONS = [Sparkles, Heart, BookOpen, Star];
const TASK_COLORS = [COLORS.accent, COLORS.accent2, COLORS.leaf, COLORS.yellow];
const DEFAULT_PRAYER_TIMES = { fajr: "05:00", dhuhr: "13:00", asr: "16:30", maghrib: "19:45", isha: "21:15" };

const MESSAGES = [
  "أنت نجم يضيء بيته بأخلاقه ⭐", "كل خطوة صغيرة اليوم تصنع طفلاً عظيماً غداً 🌱",
  "من حافظ على صلاته حافظ الله عليه 🤍", "ابتسامتك اليوم صدقة، فلا تبخل بها على أهلك 😊",
  "النظام في وقتك هو أول درس في القيادة 🧭", "أحسنت! رفقاً بمن حولك ورفقاً بنفسك أيضاً 🌸",
  "كل مهمة تنجزها هي بذرة تُسقى في شجرتك 🌳",
];
const FACTS = [
  "هل تعلم أن النحلة تزور نحو 5000 زهرة في اليوم الواحد؟ 🐝",
  "هل تعلم أن المسجد الحرام يتسع لأكثر من مليوني مصلٍّ في وقت واحد؟ 🕋",
  "هل تعلم أن جسم الإنسان يحتوي على 206 عظمة؟ 🦴",
  "هل تعلم أن أول من صنع الساعة الشمسية هم قدماء المصريين؟ ☀️",
  "هل تعلم أن القمر يبتعد عن الأرض 3.8 سم كل عام؟ 🌙",
  "هل تعلم أن شجرة السدر مذكورة في القرآن الكريم؟ 🌳",
  "هل تعلم أن أسرع حيوان بري هو الفهد الصياد؟ 🐆",
];
const STORY_SETS = [
  { title: "قصة الصدق ينجي صاحبه", slides: [
    { emoji: "👦", caption: "كان سعد يحب اللعب بالكرة مع أصدقائه بعد المدرسة" },
    { emoji: "⚽", caption: "بالخطأ ضرب الكرة فكسرت نافذة بيت الجيران" },
    { emoji: "😟", caption: "فكّر أن يهرب، لكنه تذكّر أن الصدق ينجي صاحبه" },
    { emoji: "🤝", caption: "اعتذر لجاره بصدق، ففرح به الجميع وسامحوه" },
  ]},
  { title: "لماذا نحترم الجيران؟", slides: [
    { emoji: "🏠", caption: "لكل بيت جيران من حقهم علينا الاحترام والود" },
    { emoji: "🔇", caption: "نخفّض صوت الألعاب حتى لا نزعج أحداً" },
    { emoji: "🍲", caption: "نشارك الجيران الطعام في المناسبات الجميلة" },
    { emoji: "😊", caption: "حسن الجوار يجعل الحي كله عائلة واحدة" },
  ]},
  { title: "رحلة قطرة الماء", slides: [
    { emoji: "☀️", caption: "تسخن الشمس ماء البحر فيتحول إلى بخار" },
    { emoji: "☁️", caption: "يرتفع البخار ويتجمّع على شكل غيوم" },
    { emoji: "🌧️", caption: "تتساقط الغيوم أمطاراً على الأرض والجبال" },
    { emoji: "🌊", caption: "تجري المياه في الأنهار وتعود إلى البحر من جديد" },
  ]},
  { title: "بر الوالدين", slides: [
    { emoji: "👩‍👧", caption: "أمي تتعب كثيراً لتجهز لي طعامي الجميل" },
    { emoji: "🙏", caption: "أساعدها في ترتيب الطاولة وأشكرها دائماً" },
    { emoji: "👴", caption: "أبي يعمل بجد ليوفر لنا حياة سعيدة" },
    { emoji: "❤️", caption: "بر الوالدين من أعظم الأخلاق التي نتعلمها" },
  ]},
  { title: "نظّف بيئتك", slides: [
    { emoji: "🍬", caption: "بعد أن أكلت الحلوى وجدت الورقة في يدي" },
    { emoji: "🗑️", caption: "بحثت عن سلة المهملات القريبة ورميتها فيها" },
    { emoji: "🌳", caption: "نظافة الحي تحافظ على صحتنا وجمال المكان" },
    { emoji: "🌍", caption: "كل واحد منا مسؤول عن بيئته الصغيرة حوله" },
  ]},
];
const QUIZ = [
  { q: "كم عدد الصلوات المفروضة في اليوم؟", options: ["3", "5", "7"], a: 1 },
  { q: "ما اسم أقرب نجم إلى الأرض؟", options: ["القمر", "الشمس", "المريخ"], a: 1 },
  { q: "أي شهر هجري يصوم فيه المسلمون؟", options: ["شوال", "رمضان", "رجب"], a: 1 },
  { q: "ما لون أوراق الشجر الصحية عادةً؟", options: ["أخضر", "أحمر", "أزرق"], a: 0 },
  { q: "من نبني الاحترام له في الحي؟", options: ["الجيران فقط", "الجميع", "لا أحد"], a: 1 },
];
const DAY_NAMES = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

function todayKey(d = new Date()) { return d.toISOString().slice(0, 10); }
function hhmm(d = new Date()) { return d.toTimeString().slice(0, 5); }
function dayIdx(len) { return new Date().getDate() % len; }
// The family code links a parent's device and a child's device to the same
// Firestore data. It is set once (see FamilyCodeGate) before any read/write.
let FAMILY_CODE = null;
export function setFamilyCode(code) { FAMILY_CODE = code; }

// NOTE: data lives in Firebase Firestore under families/{code}/data/{key}
// so it is shared between every device using the same family code.
async function safeGet(key) {
  if (!FAMILY_CODE) return null;
  try {
    const snap = await getDoc(doc(db, "families", FAMILY_CODE, "data", key));
    return snap.exists() ? snap.data().value : null;
  } catch {
    return null;
  }
}
async function safeSet(key, value) {
  if (!FAMILY_CODE) return;
  try {
    await setDoc(doc(db, "families", FAMILY_CODE, "data", key), { value, updatedAt: Date.now() });
  } catch { /* ignore */ }
}
// Realtime listener so a change on the child's phone appears live on the
// parent's phone (and vice-versa) without needing to reopen the app.
function subscribeKey(key, callback) {
  if (!FAMILY_CODE) return () => {};
  const ref = doc(db, "families", FAMILY_CODE, "data", key);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const raw = snap.data().value;
    if (raw) callback(raw);
  });
}
// Prayer objects carry a React icon component (Icon) which cannot survive
// JSON serialization to Firestore, so we only ever store/sync {id, done}
// and re-merge it with PRAYER_DEFS (which has the icons) when reading back.
function mergePrayers(saved) {
  if (!Array.isArray(saved)) return PRAYER_DEFS.map((p) => ({ ...p, done: false }));
  return PRAYER_DEFS.map((def) => {
    const found = saved.find((s) => s.id === def.id);
    return { ...def, done: found ? !!found.done : false };
  });
}
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [660, 880, 990].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.28);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.28 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.28 + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.28); osc.stop(ctx.currentTime + i * 0.28 + 0.55);
    });
  } catch { /* audio unavailable */ }
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}
function useTodayContent() {
  return useMemo(() => ({ message: MESSAGES[dayIdx(MESSAGES.length)], fact: FACTS[dayIdx(FACTS.length)], story: STORY_SETS[dayIdx(STORY_SETS.length)] }), []);
}
function Chip({ children, color }) { return <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ backgroundColor: color, color: "#fff" }}>{children}</span>; }
function Mascot({ size = 56, mood = "happy" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill={COLORS.yellow} />
      <circle cx="35" cy="45" r="6" fill={COLORS.primaryDark} />
      <circle cx="65" cy="45" r="6" fill={COLORS.primaryDark} />
      {mood === "happy"
        ? <path d="M30 62 Q50 82 70 62" stroke={COLORS.primaryDark} strokeWidth="6" fill="none" strokeLinecap="round" />
        : <path d="M30 68 Q50 55 70 68" stroke={COLORS.primaryDark} strokeWidth="6" fill="none" strokeLinecap="round" />}
      <circle cx="22" cy="55" r="6" fill="#FF9F45" opacity="0.55" />
      <circle cx="78" cy="55" r="6" fill="#FF9F45" opacity="0.55" />
    </svg>
  );
}
function BgBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <div className="absolute rounded-full" style={{ width: 160, height: 160, backgroundColor: COLORS.leafLight, top: -40, left: -40, opacity: 0.6 }} />
      <div className="absolute rounded-full" style={{ width: 120, height: 120, backgroundColor: "#FDEBD8", top: 120, right: -50, opacity: 0.6 }} />
      <div className="absolute rounded-full" style={{ width: 100, height: 100, backgroundColor: "#EDE3FA", bottom: 80, left: -30, opacity: 0.6 }} />
    </div>
  );
}
function GrowingTree({ percent }) {
  const leaves = Math.round((percent / 100) * 8);
  return (
    <div className="relative flex flex-col items-center justify-end" style={{ height: 110 }}>
      <div className="absolute grid grid-cols-4 gap-1" style={{ top: 0 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <TreeDeciduous key={i} size={20} style={{ color: i < leaves ? COLORS.leaf : COLORS.locked, opacity: i < leaves ? 1 : 0.6 }} />
        ))}
      </div>
      <div className="w-3 rounded-full" style={{ height: 42, backgroundColor: COLORS.primaryDark, marginTop: 32 }} />
    </div>
  );
}
function StickerTile({ Icon, label, done, onClick, color, sub }) {
  return (
    <button onClick={onClick} className="relative rounded-3xl p-3 flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition"
      style={{ backgroundColor: done ? color : "#fff", border: `3px solid ${done ? color : COLORS.locked}`, minHeight: 92 }}>
      <Icon size={24} color={done ? "#fff" : COLORS.textSoft} />
      <span className="text-xs font-black text-center leading-tight" style={{ color: done ? "#fff" : COLORS.text }}>{label}</span>
      {sub}
      {done && (
        <div className="absolute -top-2 -left-2 rounded-full px-2 py-1 text-[10px] font-black shadow" style={{ backgroundColor: COLORS.yellow, color: COLORS.primaryDark, transform: "rotate(-10deg)" }}>تم! ✓</div>
      )}
    </button>
  );
}

/* ================= STORY / "EDUCATIONAL VIDEO" PLAYER ================= */

function StoryModal({ story, onClose }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((v) => (v + 1 < story.slides.length ? v + 1 : v)), 2800);
    return () => clearInterval(t);
  }, [playing, story]);
  useEffect(() => { if (i === story.slides.length - 1) setPlaying(false); }, [i, story]);
  const slide = story.slides[i];
  const percent = ((i + 1) / story.slides.length) * 100;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(20,30,60,0.65)" }}>
      <div className="rounded-3xl w-full max-w-xs shadow-xl overflow-hidden" style={{ backgroundColor: "#fff" }}>
        <div className="flex items-center justify-between px-4 pt-4">
          <p className="font-black text-sm" style={{ color: COLORS.primaryDark }}>{story.title}</p>
          <button onClick={onClose}><X size={18} color={COLORS.textSoft} /></button>
        </div>
        <div className="flex items-center justify-center py-8" style={{ backgroundColor: COLORS.bg }}>
          <span style={{ fontSize: 72 }}>{slide.emoji}</span>
        </div>
        <div className="px-4 pt-3"><p className="text-center font-bold text-sm" style={{ color: COLORS.text }}>{slide.caption}</p></div>
        <div className="px-4 mt-3"><div className="w-full h-2 rounded-full" style={{ backgroundColor: COLORS.locked }}><div className="h-2 rounded-full" style={{ width: `${percent}%`, backgroundColor: COLORS.primary, transition: "width .3s" }} /></div></div>
        <div className="flex items-center justify-center gap-4 py-4">
          <button onClick={() => setI((v) => Math.max(0, v - 1))} className="p-2 rounded-full" style={{ backgroundColor: COLORS.locked }}><ArrowRight size={16} color={COLORS.text} /></button>
          <button onClick={() => setPlaying((p) => !p)} className="p-3 rounded-full text-white" style={{ backgroundColor: COLORS.primary }}>{playing ? <Pause size={20} /> : <Play size={20} />}</button>
          <button onClick={() => setI((v) => Math.min(story.slides.length - 1, v + 1))} className="p-2 rounded-full" style={{ backgroundColor: COLORS.locked }}><ArrowRight size={16} color={COLORS.text} style={{ transform: "rotate(180deg)" }} /></button>
        </div>
      </div>
    </div>
  );
}

/* ================= LEVEL PICKER ================= */

function LevelPicker({ title, onPick }) {
  const levels = [{ id: "easy", label: "سهل", color: COLORS.leaf }, { id: "medium", label: "متوسط", color: COLORS.accent }, { id: "hard", label: "صعب", color: COLORS.danger }];
  return (
    <div className="flex flex-col items-center gap-5 mt-6">
      <p className="font-black text-lg text-center" style={{ color: COLORS.primaryDark }}>{title}</p>
      <div className="flex gap-3">
        {levels.map((l) => <button key={l.id} onClick={() => onPick(l.id)} className="py-3 px-5 rounded-2xl font-bold text-white shadow-sm active:scale-95 transition" style={{ backgroundColor: l.color }}>{l.label}</button>)}
      </div>
    </div>
  );
}

/* ================= GAMES ================= */

function QuizGame({ onEarnStars, onBack }) {
  const [i, setI] = useState(0); const [selected, setSelected] = useState(null); const [score, setScore] = useState(0); const [finished, setFinished] = useState(false);
  function choose(idx) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === QUIZ[i].a;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => { if (i + 1 < QUIZ.length) { setI((v) => v + 1); setSelected(null); } else { setFinished(true); onEarnStars(correct ? score + 1 : score); } }, 700);
  }
  return (
    <div className="w-full max-w-sm mx-auto">
      {!finished ? (
        <>
          <p className="text-center font-bold mb-2" style={{ color: COLORS.textSoft }}>سؤال {i + 1} من {QUIZ.length}</p>
          <div className="rounded-3xl p-5 shadow-md mb-4" style={{ backgroundColor: "#fff" }}><p className="font-black text-lg text-center" style={{ color: COLORS.primaryDark }}>{QUIZ[i].q}</p></div>
          <div className="flex flex-col gap-3">
            {QUIZ[i].options.map((opt, idx) => {
              let bg = "#fff";
              if (selected !== null) { if (idx === QUIZ[i].a) bg = COLORS.leafLight; else if (idx === selected) bg = "#FBDCD6"; }
              return <button key={idx} onClick={() => choose(idx)} className="py-3 rounded-2xl font-bold shadow-sm border-2" style={{ backgroundColor: bg, borderColor: COLORS.locked, color: COLORS.text }}>{opt}</button>;
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 mt-6">
          <Star size={54} color={COLORS.yellow} fill={COLORS.yellow} />
          <h2 className="text-xl font-black" style={{ color: COLORS.primaryDark }}>أحسنت! حصلت على {score} نجوم</h2>
          <div className="flex gap-2">
            <button onClick={() => { setI(0); setSelected(null); setScore(0); setFinished(false); }} className="flex items-center gap-2 py-3 px-5 rounded-2xl font-bold text-white" style={{ backgroundColor: COLORS.primary }}><RotateCcw size={18} /> إعادة</button>
            <button onClick={onBack} className="py-3 px-5 rounded-2xl font-bold" style={{ backgroundColor: COLORS.locked, color: COLORS.text }}>رجوع</button>
          </div>
        </div>
      )}
    </div>
  );
}

const SUDOKU_SOLUTION = [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
const SUDOKU_GIVENS = {
  easy:   [[1,2,0,4],[3,4,0,2],[0,1,4,3],[4,0,2,1]],
  medium: [[1,0,0,4],[0,4,0,0],[0,0,4,0],[4,0,0,1]],
  hard:   [[1,0,0,0],[0,0,0,2],[0,1,0,0],[0,0,0,1]],
};
function SudokuGame({ level, onChangeLevel }) {
  const given = SUDOKU_GIVENS[level];
  const [grid, setGrid] = useState(() => given.map((row) => row.slice()));
  const [selected, setSelected] = useState(null);
  const [won, setWon] = useState(false);
  useEffect(() => { setGrid(given.map((row) => row.slice())); setSelected(null); setWon(false); }, [level]);
  function place(num) {
    if (!selected) return;
    const [r, c] = selected;
    if (given[r][c] !== 0) return;
    const next = grid.map((row) => row.slice()); next[r][c] = num; setGrid(next);
    setWon(next.every((row, ri) => row.every((v, ci) => v === SUDOKU_SOLUTION[ri][ci])));
  }
  function conflict(r, c, val) {
    if (!val) return false;
    for (let k = 0; k < 4; k++) { if (k !== c && grid[r][k] === val) return true; if (k !== r && grid[k][c] === val) return true; }
    const br = Math.floor(r / 2) * 2, bc = Math.floor(c / 2) * 2;
    for (let i2 = br; i2 < br + 2; i2++) for (let j2 = bc; j2 < bc + 2; j2++) if ((i2 !== r || j2 !== c) && grid[i2][j2] === val) return true;
    return false;
  }
  function reset() { setGrid(given.map((row) => row.slice())); setSelected(null); setWon(false); }
  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-4">
      <div className="flex items-center gap-2"><Chip color={COLORS.primary}>{level === "easy" ? "سهل" : level === "medium" ? "متوسط" : "صعب"}</Chip>
        <button onClick={onChangeLevel} className="text-xs font-bold" style={{ color: COLORS.textSoft }}>تغيير المستوى</button></div>
      <p className="text-sm font-bold" style={{ color: COLORS.textSoft }}>سودوكو 4×4 — اختر خانة ثم رقماً</p>
      <div className="grid grid-cols-4 gap-1 p-2 rounded-2xl" style={{ backgroundColor: COLORS.primaryDark }}>
        {grid.map((row, r) => row.map((val, c) => {
          const isGiven = given[r][c] !== 0; const isSel = selected && selected[0] === r && selected[1] === c; const bad = conflict(r, c, val);
          return (
            <button key={`${r}-${c}`} onClick={() => !isGiven && setSelected([r, c])} className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg"
              style={{ backgroundColor: isGiven ? COLORS.locked : isSel ? COLORS.leafLight : "#fff", color: bad ? COLORS.danger : COLORS.text, border: isSel ? `2px solid ${COLORS.primary}` : "2px solid transparent" }}>{val || ""}</button>
          );
        }))}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((n) => <button key={n} onClick={() => place(n)} className="w-11 h-11 rounded-xl font-black text-white" style={{ backgroundColor: COLORS.accent }}>{n}</button>)}
        <button onClick={() => place(0)} className="w-11 h-11 rounded-xl font-black" style={{ backgroundColor: COLORS.locked, color: COLORS.text }}><X size={18} className="mx-auto" /></button>
      </div>
      {won && <p className="font-black" style={{ color: COLORS.leaf }}>🎉 أحسنت، حللت اللغز!</p>}
      <button onClick={reset} className="text-sm font-bold flex items-center gap-1" style={{ color: COLORS.textSoft }}><RotateCcw size={14} /> إعادة اللغز</button>
    </div>
  );
}

const CROSSWORD_LEVELS = {
  easy: {
    rows: 3, cols: 3,
    solution: { "0-0": "ق", "0-1": "م", "0-2": "ر", "1-0": "ل", "1-2": "م", "2-0": "م", "2-2": "ل" },
    blocked: ["1-1", "2-1"],
    clues: ["1 أفقي: يضيء السماء ليلاً (قمر)", "1 عمودي: نستخدمه للكتابة (قلم)", "2 عمودي: موجود على الشاطئ (رمل)"],
  },
  medium: {
    rows: 4, cols: 4,
    solution: { "0-0": "ك", "0-1": "ت", "0-2": "ا", "0-3": "ب", "1-0": "ر", "1-2": "س", "2-0": "س", "2-2": "د", "3-0": "ي" },
    blocked: ["1-1", "1-3", "2-1", "2-3", "3-1", "3-2", "3-3"],
    clues: ["1 أفقي: نقرأ فيه ونتعلم (كتاب)", "1 عمودي: نجلس عليه (كرسي)", "2 عمودي: ملك الغابة (أسد)"],
  },
  hard: {
    rows: 4, cols: 5,
    solution: { "0-0": "م", "0-1": "د", "0-2": "ر", "0-3": "س", "0-4": "ة", "1-0": "ع", "1-2": "م", "2-0": "ل", "2-2": "ا", "3-0": "م", "3-2": "ن" },
    blocked: ["1-1", "1-3", "1-4", "2-1", "2-3", "2-4", "3-1", "3-3", "3-4"],
    clues: ["1 أفقي: نذهب إليها لنتعلم (مدرسة)", "1 عمودي: يعلّمنا في الصف (معلم)", "2 عمودي: فاكهة حمراء (رمّان)"],
  },
};
function CrosswordGame({ level, onChangeLevel }) {
  const cfg = CROSSWORD_LEVELS[level];
  const [values, setValues] = useState({});
  const [checked, setChecked] = useState(false);
  useEffect(() => { setValues({}); setChecked(false); }, [level]);
  function setCell(key, v) { setValues((prev) => ({ ...prev, [key]: v.slice(-1) })); setChecked(false); }
  const allCorrect = Object.keys(cfg.solution).every((k) => (values[k] || "") === cfg.solution[k]);
  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-4">
      <div className="flex items-center gap-2"><Chip color={COLORS.leaf}>{level === "easy" ? "سهل" : level === "medium" ? "متوسط" : "صعب"}</Chip>
        <button onClick={onChangeLevel} className="text-xs font-bold" style={{ color: COLORS.textSoft }}>تغيير المستوى</button></div>
      <p className="text-sm font-bold text-center" style={{ color: COLORS.textSoft }}>الكلمات المتقاطعة</p>
      <div dir="ltr" className="grid gap-1 p-2 rounded-2xl" style={{ backgroundColor: COLORS.primaryDark, gridTemplateColumns: `repeat(${cfg.cols}, minmax(0,1fr))` }}>
        {Array.from({ length: cfg.rows }).map((_, r) => Array.from({ length: cfg.cols }).map((_, c) => {
          const key = `${r}-${c}`;
          if (cfg.blocked.includes(key) || !(key in cfg.solution)) return <div key={key} className="w-11 h-11 rounded-lg" style={{ backgroundColor: COLORS.primaryDark }} />;
          const val = values[key] || ""; const isRight = checked && val === cfg.solution[key]; const isWrong = checked && val && val !== cfg.solution[key];
          return <input key={key} value={val} onChange={(e) => setCell(key, e.target.value)} maxLength={1}
            className="w-11 h-11 rounded-lg text-center font-black text-lg outline-none"
            style={{ backgroundColor: isRight ? COLORS.leafLight : isWrong ? "#FBDCD6" : "#fff", color: COLORS.text, border: "2px solid transparent" }} />;
        }))}
      </div>
      <div className="text-xs w-full rounded-2xl p-3 shadow-sm flex flex-col gap-1" style={{ backgroundColor: "#fff", color: COLORS.text }}>
        {cfg.clues.map((c, i) => <p key={i} className="font-bold">{c}</p>)}
      </div>
      <button onClick={() => setChecked(true)} className="py-3 px-6 rounded-2xl font-bold text-white" style={{ backgroundColor: COLORS.primary }}>تحقق من الحل</button>
      {checked && allCorrect && <p className="font-black" style={{ color: COLORS.leaf }}>🎉 ممتاز، كل الإجابات صحيحة!</p>}
    </div>
  );
}

function TicTacToeGame() {
  const [board, setBoard] = useState(Array(9).fill(null)); const [turn, setTurn] = useState("X");
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winner = lines.map((l) => (board[l[0]] && board[l[0]] === board[l[1]] && board[l[1]] === board[l[2]] ? board[l[0]] : null)).find(Boolean);
  const full = board.every(Boolean);
  function play(i) { if (board[i] || winner) return; const next = board.slice(); next[i] = turn; setBoard(next); setTurn(turn === "X" ? "O" : "X"); }
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-bold text-sm" style={{ color: COLORS.textSoft }}>لعبة إكس أو — بالتناوب بين لاعبين</p>
      <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl" style={{ backgroundColor: COLORS.primaryDark }}>
        {board.map((v, i) => <button key={i} onClick={() => play(i)} className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black" style={{ backgroundColor: "#fff", color: v === "X" ? COLORS.primary : COLORS.accent }}>{v}</button>)}
      </div>
      {winner ? <p className="font-black" style={{ color: COLORS.leaf }}>🎉 فاز اللاعب {winner}!</p> : full ? <p className="font-black" style={{ color: COLORS.textSoft }}>تعادل!</p> : <p className="font-bold text-sm" style={{ color: COLORS.textSoft }}>دور اللاعب: {turn}</p>}
      <button onClick={() => { setBoard(Array(9).fill(null)); setTurn("X"); }} className="text-sm font-bold flex items-center gap-1" style={{ color: COLORS.textSoft }}><RotateCcw size={14} /> إعادة</button>
    </div>
  );
}

const ICON_POOL = ["🐝", "🌙", "⭐", "🍎", "🐢", "🌸", "🐬", "🦋"];
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const MEMORY_PAIRS = { easy: 3, medium: 6, hard: 8 };
function MemoryGame({ level, onChangeLevel }) {
  const pairs = MEMORY_PAIRS[level];
  const build = () => shuffle(ICON_POOL.slice(0, pairs).flatMap((i) => [i, i]));
  const [deck, setDeck] = useState(build);
  const [flipped, setFlipped] = useState([]); const [matched, setMatched] = useState([]); const [moves, setMoves] = useState(0);
  useEffect(() => { setDeck(build()); setFlipped([]); setMatched([]); setMoves(0); }, [level]);
  function flip(i) {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return;
    const next = [...flipped, i]; setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      if (deck[next[0]] === deck[next[1]]) { setMatched((m) => [...m, ...next]); setTimeout(() => setFlipped([]), 400); }
      else setTimeout(() => setFlipped([]), 800);
    }
  }
  function reset() { setDeck(build()); setFlipped([]); setMatched([]); setMoves(0); }
  const won = matched.length === deck.length;
  const cols = pairs <= 3 ? 3 : 4;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2"><Chip color={COLORS.danger}>{level === "easy" ? "سهل" : level === "medium" ? "متوسط" : "صعب"}</Chip>
        <button onClick={onChangeLevel} className="text-xs font-bold" style={{ color: COLORS.textSoft }}>تغيير المستوى</button></div>
      <p className="font-bold text-sm" style={{ color: COLORS.textSoft }}>لعبة الذاكرة — عدد المحاولات: {moves}</p>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {deck.map((icon, i) => { const shown = flipped.includes(i) || matched.includes(i); return <button key={i} onClick={() => flip(i)} className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm" style={{ backgroundColor: shown ? "#fff" : COLORS.accent2 }}>{shown ? icon : ""}</button>; })}
      </div>
      {won && <p className="font-black" style={{ color: COLORS.leaf }}>🎉 أحسنت، أنهيت اللعبة في {moves} محاولة!</p>}
      <button onClick={reset} className="text-sm font-bold flex items-center gap-1" style={{ color: COLORS.textSoft }}><RotateCcw size={14} /> إعادة</button>
    </div>
  );
}

/* ---- Chess (simplified rules, with optional AI opponent) ---- */
const START_BOARD = (() => {
  const row = (color) => ["R", "N", "B", "Q", "K", "B", "N", "R"].map((t) => ({ type: t, color }));
  const pawns = (color) => Array(8).fill(null).map(() => ({ type: "P", color }));
  return [row("b"), pawns("b"), ...Array(4).fill(null).map(() => Array(8).fill(null)), pawns("w"), row("w")];
})();
const UNICODE = { w: { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙" }, b: { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" } };
const VALUE = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
function clonedBoard(b) { return b.map((row) => row.map((c) => (c ? { ...c } : null))); }
function pathClear(board, r1, c1, r2, c2) {
  const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1); let r = r1 + dr, c = c1 + dc;
  while (r !== r2 || c !== c2) { if (board[r][c]) return false; r += dr; c += dc; } return true;
}
function isValidMove(board, from, to) {
  const [r1, c1] = from, [r2, c2] = to; const piece = board[r1][c1]; const target = board[r2][c2];
  if (!piece) return false; if (target && target.color === piece.color) return false;
  const dr = r2 - r1, dc = c2 - c1; const adr = Math.abs(dr), adc = Math.abs(dc);
  switch (piece.type) {
    case "P": {
      const dir = piece.color === "w" ? -1 : 1; const startRow = piece.color === "w" ? 6 : 1;
      if (dc === 0 && !target) { if (dr === dir) return true; if (dr === 2 * dir && r1 === startRow && !board[r1 + dir][c1]) return true; return false; }
      if (adc === 1 && dr === dir && target && target.color !== piece.color) return true; return false;
    }
    case "N": return (adr === 2 && adc === 1) || (adr === 1 && adc === 2);
    case "B": return adr === adc && adr > 0 && pathClear(board, r1, c1, r2, c2);
    case "R": return (dr === 0 || dc === 0) && (adr + adc > 0) && pathClear(board, r1, c1, r2, c2);
    case "Q": return ((adr === adc && adr > 0) || dr === 0 || dc === 0) && pathClear(board, r1, c1, r2, c2);
    case "K": return adr <= 1 && adc <= 1 && (adr + adc > 0);
    default: return false;
  }
}
function allLegalMoves(board, color) {
  const moves = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const piece = board[r][c]; if (!piece || piece.color !== color) continue;
    for (let r2 = 0; r2 < 8; r2++) for (let c2 = 0; c2 < 8; c2++) {
      if (r2 === r && c2 === c) continue;
      if (isValidMove(board, [r, c], [r2, c2])) moves.push({ from: [r, c], to: [r2, c2], captured: board[r2][c2] });
    }
  }
  return moves;
}
function applyMove(board, move) {
  const next = clonedBoard(board); const piece = next[move.from[0]][move.from[1]];
  next[move.to[0]][move.to[1]] = piece; next[move.from[0]][move.from[1]] = null;
  if (piece.type === "P" && (move.to[0] === 0 || move.to[0] === 7)) next[move.to[0]][move.to[1]] = { type: "Q", color: piece.color };
  return next;
}
function chooseAIMove(board, aiColor, level) {
  const moves = allLegalMoves(board, aiColor);
  if (moves.length === 0) return null;
  const captures = moves.filter((m) => m.captured);
  if (level === "easy") {
    if (captures.length && Math.random() < 0.3) return captures[Math.floor(Math.random() * captures.length)];
    return moves[Math.floor(Math.random() * moves.length)];
  }
  if (level === "medium") {
    if (captures.length && Math.random() < 0.8) { captures.sort((a, b) => VALUE[b.captured.type] - VALUE[a.captured.type]); return captures[0]; }
    return moves[Math.floor(Math.random() * moves.length)];
  }
  const oppColor = aiColor === "w" ? "b" : "w"; let best = null; let bestScore = -Infinity;
  for (const m of moves) {
    const after = applyMove(board, m);
    let score = m.captured ? VALUE[m.captured.type] : 0;
    const oppMoves = allLegalMoves(after, oppColor);
    let oppBest = 0; oppMoves.forEach((om) => { if (om.captured) oppBest = Math.max(oppBest, VALUE[om.captured.type]); });
    score = score - oppBest * 0.9 + Math.random() * 0.3;
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}
function ChessSetup({ onStart }) {
  const [mode, setMode] = useState(null);
  if (!mode) {
    return (
      <div className="flex flex-col items-center gap-4 mt-4">
        <p className="font-black text-lg text-center" style={{ color: COLORS.primaryDark }}>كيف تريد أن تلعب الشطرنج؟</p>
        <button onClick={() => setMode("two")} className="w-64 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2" style={{ backgroundColor: COLORS.primary }}><Users size={20} /> لاعبان (أنا وصديقي)</button>
        <button onClick={() => setMode("ai")} className="w-64 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2" style={{ backgroundColor: COLORS.accent2 }}><Bot size={20} /> لا يوجد لاعب ثانٍ؟ العب مع الذكاء الاصطناعي</button>
      </div>
    );
  }
  if (mode === "two") { onStart({ mode: "two" }); return null; }
  return <LevelPicker title="اختر مستوى الذكاء الاصطناعي" onPick={(level) => onStart({ mode: "ai", level })} />;
}
function ChessGame({ config, onChangeConfig }) {
  const [board, setBoard] = useState(() => clonedBoard(START_BOARD));
  const [sel, setSel] = useState(null); const [turn, setTurn] = useState("w"); const [msg, setMsg] = useState(""); const [thinking, setThinking] = useState(false);
  useEffect(() => { setBoard(clonedBoard(START_BOARD)); setSel(null); setTurn("w"); setMsg(""); }, [config]);
  useEffect(() => {
    if (config.mode !== "ai" || turn !== "b") return;
    setThinking(true);
    const t = setTimeout(() => {
      const move = chooseAIMove(board, "b", config.level);
      if (move) {
        const next = applyMove(board, move); setBoard(next); setTurn("w");
        setMsg(move.captured ? "استولى الذكاء الاصطناعي على قطعة! دورك الآن" : "دورك الآن");
      }
      setThinking(false);
    }, 700);
    return () => clearTimeout(t);
    }, [turn, config, board]);
  function click(r, c) {
    if (config.mode === "ai" && turn === "b") return;
    if (sel) {
      const [r1, c1] = sel;
      if (r1 === r && c1 === c) { setSel(null); return; }
      if (board[r1][c1].color !== turn) { setSel(null); return; }
      if (isValidMove(board, [r1, c1], [r, c])) {
        const move = { from: [r1, c1], to: [r, c], captured: board[r][c] };
        const next = applyMove(board, move); setBoard(next);
        setTurn(turn === "w" ? "b" : "w");
        setMsg(move.captured ? "أسرت قطعة! " + (turn === "w" ? "دور الأسود" : "دور الأبيض") : (turn === "w" ? "دور الأسود" : "دور الأبيض"));
        setSel(null);
      } else setSel(null);
    } else if (board[r][c] && board[r][c].color === turn) setSel([r, c]);
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <Chip color={COLORS.accent2}>{config.mode === "ai" ? `ضد الذكاء الاصطناعي (${config.level === "easy" ? "سهل" : config.level === "medium" ? "متوسط" : "صعب"})` : "لاعبان"}</Chip>
        <button onClick={onChangeConfig} className="text-xs font-bold" style={{ color: COLORS.textSoft }}>تغيير</button>
      </div>
      <p className="text-sm font-bold" style={{ color: COLORS.textSoft }}>{thinking ? "الذكاء الاصطناعي يفكر... 🤔" : msg || (turn === "w" ? "دور الأبيض" : "دور الأسود")}</p>
      <div dir="ltr" className="grid grid-cols-8 rounded-xl overflow-hidden shadow-md">
        {board.map((row, r) => row.map((cell, c) => {
          const dark = (r + c) % 2 === 1; const isSel = sel && sel[0] === r && sel[1] === c;
          return <button key={`${r}-${c}`} onClick={() => click(r, c)} className="w-9 h-9 flex items-center justify-center text-xl" style={{ backgroundColor: isSel ? COLORS.leafLight : dark ? "#B9C6E3" : "#F4F6FB" }}>{cell ? UNICODE[cell.color][cell.type] : ""}</button>;
        }))}
      </div>
      <button onClick={() => { setBoard(clonedBoard(START_BOARD)); setSel(null); setTurn("w"); setMsg(""); }} className="text-sm font-bold flex items-center gap-1" style={{ color: COLORS.textSoft }}><RotateCcw size={14} /> لعبة جديدة</button>
    </div>
  );
}

function GameCard({ Icon, title, desc, color, onClick }) {
  return (
    <button onClick={onClick} className="rounded-3xl p-4 shadow-sm text-right flex flex-col gap-2 active:scale-95 transition" style={{ backgroundColor: "#fff" }}>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color }}><Icon size={22} color="#fff" /></div>
      <p className="font-black text-sm" style={{ color: COLORS.text }}>{title}</p>
      <p className="text-xs" style={{ color: COLORS.textSoft }}>{desc}</p>
    </button>
  );
}
function GameHub({ onBack, onEarnStars }) {
  const [active, setActive] = useState(null);
  const [sudokuLevel, setSudokuLevel] = useState(null);
  const [crosswordLevel, setCrosswordLevel] = useState(null);
  const [memoryLevel, setMemoryLevel] = useState(null);
  const [chessConfig, setChessConfig] = useState(null);
  const games = [
    { id: "quiz", title: "أسئلة ثقافية", desc: "اختبر معلوماتك واربح نجوماً", Icon: BookOpen, color: COLORS.accent },
    { id: "sudoku", title: "سودوكو", desc: "لغز أرقام بثلاث مستويات", Icon: Grid3x3, color: COLORS.primary },
    { id: "chess", title: "الشطرنج", desc: "لاعبان أو ضد الذكاء الاصطناعي", Icon: Puzzle, color: COLORS.accent2 },
    { id: "crossword", title: "الكلمات المتقاطعة", desc: "من سهل إلى صعب", Icon: Hash, color: COLORS.leaf },
    { id: "memory", title: "لعبة الذاكرة", desc: "طابق البطاقات المتشابهة", Icon: Brain, color: COLORS.danger },
    { id: "tictactoe", title: "إكس أو", desc: "لعبة سريعة وممتعة لاثنين", Icon: Gamepad2, color: COLORS.yellow },
  ];
  function back() {
    if (active === "sudoku" && sudokuLevel) return setSudokuLevel(null);
    if (active === "crossword" && crosswordLevel) return setCrosswordLevel(null);
    if (active === "memory" && memoryLevel) return setMemoryLevel(null);
    if (active === "chess" && chessConfig) return setChessConfig(null);
    setActive(null);
  }
  return (
    <div className="min-h-screen px-5 py-6 relative" style={{ backgroundColor: COLORS.bg }}>
      <BgBlobs />
      <div className="relative" style={{ zIndex: 1 }}>
        <button onClick={active ? back : onBack} className="flex items-center gap-1 text-sm font-bold mb-4" style={{ color: COLORS.textSoft }}>{active ? "رجوع" : "رجوع للرئيسية"} <ArrowRight size={16} /></button>
        {!active ? (
          <>
            <h1 className="text-2xl font-black mb-1" style={{ color: COLORS.primaryDark, fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>منطقة اللعب 🎮</h1>
            <p className="text-sm mb-4" style={{ color: COLORS.textSoft }}>ألعاب متنوعة للجميع — اختر واحدة وابدأ المرح</p>
            <div className="grid grid-cols-2 gap-3">{games.map((g) => <GameCard key={g.id} {...g} onClick={() => setActive(g.id)} />)}</div>
          </>
        ) : (
          <div className="mt-2">
            {active === "quiz" && <QuizGame onEarnStars={onEarnStars} onBack={() => setActive(null)} />}
            {active === "sudoku" && (sudokuLevel ? <SudokuGame level={sudokuLevel} onChangeLevel={() => setSudokuLevel(null)} /> : <LevelPicker title="اختر مستوى السودوكو" onPick={setSudokuLevel} />)}
            {active === "chess" && (chessConfig ? <ChessGame config={chessConfig} onChangeConfig={() => setChessConfig(null)} /> : <ChessSetup onStart={setChessConfig} />)}
            {active === "crossword" && (crosswordLevel ? <CrosswordGame level={crosswordLevel} onChangeLevel={() => setCrosswordLevel(null)} /> : <LevelPicker title="اختر مستوى الكلمات المتقاطعة" onPick={setCrosswordLevel} />)}
            {active === "memory" && (memoryLevel ? <MemoryGame level={memoryLevel} onChangeLevel={() => setMemoryLevel(null)} /> : <LevelPicker title="اختر مستوى لعبة الذاكرة" onPick={setMemoryLevel} />)}
            {active === "tictactoe" && <TicTacToeGame />}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= APP SCREENS ================= */

function ProfileSelect({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center relative" style={{ backgroundColor: COLORS.bg }}>
      <BgBlobs />
      <div className="relative mb-8" style={{ zIndex: 1 }}>
        <div className="mb-3 flex justify-center"><Mascot size={90} /></div>
        <h1 className="text-3xl font-black" style={{ color: COLORS.primaryDark, fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>براعم</h1>
        <p className="mt-2" style={{ color: COLORS.textSoft }}>رفيقك اليومي في الصلاة والمهام والأخلاق</p>
      </div>
      <div className="relative w-full max-w-xs flex flex-col gap-4" style={{ zIndex: 1 }}>
        <button onClick={() => onSelect("child")} className="w-full py-4 rounded-3xl font-bold text-lg text-white shadow-md flex items-center justify-center gap-2 active:scale-95 transition" style={{ backgroundColor: COLORS.primary }}><Sparkles size={22} /> أنا طفل، ابدأ يومي</button>
        <button onClick={() => onSelect("parent-gate")} className="w-full py-4 rounded-3xl font-bold text-lg shadow-sm flex items-center justify-center gap-2 active:scale-95 transition border-2" style={{ borderColor: COLORS.accent2, color: COLORS.accent2, backgroundColor: "#fff" }}><Users size={22} /> منطقة الوالدين</button>
      </div>
    </div>
  );
}
function ParentGate({ onBack, onUnlock }) {
  const [pin, setPin] = useState(""); const [error, setError] = useState(false); const CORRECT = "1234";
  function submit() { if (pin === CORRECT) onUnlock(); else { setError(true); setPin(""); } }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ backgroundColor: COLORS.bg }}>
      <button onClick={onBack} className="absolute top-6 right-6 flex items-center gap-1 text-sm font-bold" style={{ color: COLORS.textSoft }}>رجوع <ArrowRight size={16} /></button>
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ backgroundColor: COLORS.accent2 }}><KeyRound size={30} color="#fff" /></div>
      <h2 className="text-xl font-black mb-1" style={{ color: COLORS.primaryDark }}>رمز دخول الوالدين</h2>
      <p className="text-sm mb-6" style={{ color: COLORS.textSoft }}>الرمز التجريبي: 1234</p>
      <input type="password" inputMode="numeric" value={pin} onChange={(e) => { setPin(e.target.value); setError(false); }} maxLength={4} className="w-40 text-center text-2xl tracking-widest py-3 rounded-2xl border-2 outline-none mb-2" style={{ borderColor: error ? COLORS.danger : COLORS.leaf }} placeholder="••••" />
      {error && <p className="text-sm font-bold mb-2" style={{ color: COLORS.danger }}>رمز غير صحيح، حاول مجدداً</p>}
      <button onClick={submit} className="mt-4 w-40 py-3 rounded-2xl font-bold text-white" style={{ backgroundColor: COLORS.primary }}>دخول</button>
    </div>
  );
}
function BottomNav({ onHome, onParent }) {
  return (
    <div className="fixed bottom-0 inset-x-0 flex justify-around items-center py-3 shadow-inner" style={{ backgroundColor: "#fff", borderTop: `1px solid ${COLORS.locked}`, zIndex: 2 }}>
      <button onClick={onHome} className="flex flex-col items-center gap-1"><Home size={22} color={COLORS.primary} /><span className="text-xs font-bold" style={{ color: COLORS.primary }}>الرئيسية</span></button>
      <button onClick={onParent} className="flex flex-col items-center gap-1"><ShieldCheck size={22} color={COLORS.textSoft} /><span className="text-xs font-bold" style={{ color: COLORS.textSoft }}>الوالدين</span></button>
    </div>
  );
}
function PrayerAlarmModal({ prayerName, onDone, onLater }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(20,30,60,0.55)" }}>
      <div className="rounded-3xl p-6 w-full max-w-xs text-center shadow-xl" style={{ backgroundColor: "#fff" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: COLORS.primary }}><BellRing size={30} color="#fff" /></div>
        <h3 className="font-black text-lg" style={{ color: COLORS.primaryDark }}>حان وقت صلاة {prayerName} 🕌</h3>
        <p className="text-sm mt-1" style={{ color: COLORS.textSoft }}>تذكير لطيف — لا تنسَ الصلاة في وقتها</p>
        <div className="flex gap-2 mt-5">
          <button onClick={onLater} className="flex-1 py-3 rounded-2xl font-bold" style={{ backgroundColor: COLORS.locked, color: COLORS.text }}>لاحقاً</button>
          <button onClick={onDone} className="flex-1 py-3 rounded-2xl font-bold text-white" style={{ backgroundColor: COLORS.primary }}>صلّيت ✅</button>
        </div>
      </div>
    </div>
  );
}
function ChildHome({ prayers, setPrayers, tasks, setTasks, quizStars, playUnlocked, lockReason, onPlay, onParent, nextPrayer }) {
  const { message, fact, story } = useTodayContent();
  const [showStory, setShowStory] = useState(false);
  const totalItems = prayers.length + tasks.length;
  const doneItems = prayers.filter((p) => p.done).length + tasks.filter((t) => t.done).length;
  const percent = Math.round((doneItems / totalItems) * 100);
  function togglePrayer(id) { setPrayers((prev) => prev.map((p) => (p.id === id ? { ...p, done: !p.done } : p))); }
  function toggleTask(id) { setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))); }
  function togglePhoto(id) { setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, photo: !t.photo } : t))); }

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }} className="pb-24 relative">
      <BgBlobs />
      {showStory && <StoryModal story={story} onClose={() => setShowStory(false)} />}
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="px-5 pt-6 pb-4" style={{ backgroundColor: COLORS.primary, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mascot size={44} />
              <div><p className="text-white/80 text-xs font-bold">مرحباً يا بطل 👋</p><h1 className="text-white text-xl font-black" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>يومك المشرق</h1></div>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-2 rounded-2xl"><Star size={18} color={COLORS.yellow} fill={COLORS.yellow} /><span className="text-white font-black">{quizStars}</span></div>
          </div>
          <div className="mt-4 bg-white/95 rounded-3xl p-3 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold" style={{ color: COLORS.textSoft }}>شجرتك تنمو معك</p>
              <p className="text-sm font-black" style={{ color: COLORS.primaryDark }}>{percent}% من مهام اليوم مكتملة</p>
              {nextPrayer && <p className="text-xs font-bold mt-1 flex items-center gap-1" style={{ color: COLORS.textSoft }}><Clock size={12} /> القادمة: {nextPrayer.name} — {nextPrayer.time}</p>}
            </div>
            <GrowingTree percent={percent} />
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="rounded-3xl p-4 flex items-start gap-3 shadow-sm" style={{ backgroundColor: COLORS.leafLight }}>
            <Heart size={22} color={COLORS.primaryDark} className="mt-1 shrink-0" />
            <p className="font-bold text-sm" style={{ color: COLORS.primaryDark }}>{message}</p>
          </div>
        </div>

        <div className="px-5 mt-5">
          <h2 className="font-black mb-2" style={{ color: COLORS.primaryDark }}>أوقات الصلاة</h2>
          <div className="grid grid-cols-5 gap-2">
            {prayers.map(({ id, name, Icon, done }) => (
              <StickerTile key={id} Icon={Icon} label={name} done={done} color={COLORS.primary} onClick={() => togglePrayer(id)} />
            ))}
          </div>
        </div>

        <div className="px-5 mt-5">
          <h2 className="font-black mb-2" style={{ color: COLORS.primaryDark }}>مهامي اليوم</h2>
          <div className="grid grid-cols-2 gap-3">
            {tasks.map((t, idx) => (
              <StickerTile
                key={t.id}
                Icon={TASK_ICONS[idx % TASK_ICONS.length]}
                label={t.title}
                done={t.done}
                color={TASK_COLORS[idx % TASK_COLORS.length]}
                onClick={() => toggleTask(t.id)}
                sub={
                  <div className="flex items-center gap-1 mt-1">
                    {t.mandatory && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ backgroundColor: t.done ? "rgba(255,255,255,0.3)" : COLORS.accent, color: "#fff" }}>أساسية</span>}
                    <span onClick={(e) => { e.stopPropagation(); togglePhoto(t.id); }} className="p-1 rounded-full" style={{ backgroundColor: t.photo ? "rgba(255,255,255,0.35)" : COLORS.locked }}><Camera size={12} color={t.done ? "#fff" : COLORS.textSoft} /></span>
                  </div>
                }
              />
            ))}
          </div>
        </div>

        <div className="px-5 mt-5">
          <button onClick={() => setShowStory(true)} className="w-full rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-95 transition" style={{ backgroundColor: "#fff" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: COLORS.accent }}><Play size={20} color="#fff" fill="#fff" /></div>
            <div className="text-right flex-1"><p className="font-black text-sm" style={{ color: COLORS.primaryDark }}>🎬 فيديو اليوم: {story.title}</p><p className="text-xs" style={{ color: COLORS.textSoft }}>اضغط للمشاهدة — قصة مصورة تفاعلية</p></div>
          </button>
        </div>

        <div className="px-5 mt-3">
          <div className="rounded-2xl p-4 shadow-sm flex items-center gap-3" style={{ backgroundColor: "#fff" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: COLORS.accent2 }}><BookOpen size={20} color="#fff" /></div>
            <p className="font-bold text-sm" style={{ color: COLORS.primaryDark }}>{fact}</p>
          </div>
        </div>

        <div className="px-5 mt-6">
          {playUnlocked ? (
            <button onClick={onPlay} className="w-full py-4 rounded-3xl font-black text-lg text-white shadow-md flex items-center justify-center gap-2 active:scale-95 transition" style={{ backgroundColor: COLORS.leaf }}><Gamepad2 size={22} /> ادخل منطقة اللعب</button>
          ) : (
            <div className="w-full py-4 rounded-3xl font-bold text-center flex flex-col items-center gap-1" style={{ backgroundColor: COLORS.locked, color: COLORS.textSoft }}><Lock size={22} /><span>منطقة اللعب مغلقة</span><span className="text-xs">{lockReason}</span></div>
          )}
        </div>
        <BottomNav onHome={() => {}} onParent={onParent} />
      </div>
    </div>
  );
}

/* ---- Parent side (unchanged logic, restyled slightly) ---- */
function ParentTabs({ tab, setTab }) {
  const tabs = [{ id: "overview", label: "نظرة عامة", Icon: ClipboardList }, { id: "report", label: "تقرير اليوم", Icon: CalendarDays }, { id: "week", label: "أسبوعي", Icon: CalendarRange }, { id: "month", label: "شهري", Icon: CalendarDays }];
  return (
    <div className="flex gap-2 px-5 mt-4 overflow-x-auto">
      {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1 py-2 px-3 rounded-2xl text-xs font-bold shrink-0" style={{ backgroundColor: tab === t.id ? COLORS.accent2 : "#fff", color: tab === t.id ? "#fff" : COLORS.textSoft, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}><t.Icon size={14} /> {t.label}</button>)}
    </div>
  );
}
function DailyReport({ prayers, tasks, quizStars, upset }) {
  const prayersDone = prayers.filter((p) => p.done).length; const tasksDone = tasks.filter((t) => t.done).length;
  const mandatoryTotal = tasks.filter((t) => t.mandatory).length; const mandatoryDone = tasks.filter((t) => t.mandatory && t.done).length;
  const total = prayers.length + tasks.length; const done = prayersDone + tasksDone; const percent = Math.round((done / total) * 100);
  let summary = "يوم جيد، استمر بالتحسن 🌱";
  if (percent >= 90 && !upset) summary = "يوم رائع ومميز! 🌟"; else if (percent >= 60) summary = "أداء جيد اليوم 👍"; else if (percent < 40) summary = "يحتاج تشجيعاً أكثر غداً 💛";
  return (
    <div className="px-5 mt-4 flex flex-col gap-3">
      <div className="rounded-3xl p-5 shadow-sm text-center" style={{ backgroundColor: "#fff" }}>
        <p className="text-xs font-bold" style={{ color: COLORS.textSoft }}>تقرير اليوم — {new Date().toLocaleDateString("ar-EG")}</p>
        <p className="text-3xl font-black mt-1" style={{ color: COLORS.primaryDark }}>{percent}%</p>
        <p className="font-bold mt-1" style={{ color: COLORS.textSoft }}>{summary}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: "#fff" }}><p className="text-xl font-black" style={{ color: COLORS.primaryDark }}>{prayersDone}/{prayers.length}</p><p className="text-xs font-bold" style={{ color: COLORS.textSoft }}>الصلوات</p></div>
        <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: "#fff" }}><p className="text-xl font-black" style={{ color: COLORS.primaryDark }}>{mandatoryDone}/{mandatoryTotal}</p><p className="text-xs font-bold" style={{ color: COLORS.textSoft }}>المهام الأساسية</p></div>
        <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: "#fff" }}><p className="text-xl font-black" style={{ color: COLORS.primaryDark }}>{tasksDone}/{tasks.length}</p><p className="text-xs font-bold" style={{ color: COLORS.textSoft }}>كل المهام
          const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const key = todayKey(d); days.push({ key, label: DAY_NAMES[d.getDay()], date: d.getDate(), percent: records[key] ?? null }); }
  return (
    <div className="px-5 mt-4"><div className="rounded-3xl p-4 shadow-sm" style={{ backgroundColor: "#fff" }}>
      <p className="font-black text-sm mb-3" style={{ color: COLORS.primaryDark }}>آخر 7 أيام</p>
      <div className="flex justify-between">{days.map((d) => (
        <div key={d.key} className="flex flex-col items-center gap-1">
          <div className="w-9 h-16 rounded-full flex items-end justify-center overflow-hidden" style={{ backgroundColor: COLORS.locked }}><div style={{ height: `${d.percent ?? 4}%`, width: "100%", backgroundColor: percentColor(d.percent), transition: "height .4s" }} /></div>
          <span className="text-xs font-bold" style={{ color: COLORS.textSoft }}>{d.label}</span><span className="text-xs" style={{ color: COLORS.textSoft }}>{d.date}</span>
        </div>))}</div>
    </div></div>
  );
}
function MonthView({ records }) {
  const now = new Date(); const year = now.getFullYear(); const month = now.getMonth();
  const firstDay = new Date(year, month, 1); const daysInMonth = new Date(year, month + 1, 0).getDate(); const startWeekday = firstDay.getDay();
  const cells = []; for (let i = 0; i < startWeekday; i++) cells.push(null); for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return (
    <div className="px-5 mt-4"><div className="rounded-3xl p-4 shadow-sm" style={{ backgroundColor: "#fff" }}>
      <p className="font-black text-sm mb-3" style={{ color: COLORS.primaryDark }}>مخطط الشهر الحالي</p>
      <div className="grid grid-cols-7 gap-1 mb-1">{DAY_NAMES.map((n) => <span key={n} className="text-[10px] text-center font-bold" style={{ color: COLORS.textSoft }}>{n.slice(0, 2)}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">{cells.map((d, idx) => { if (d == null) return <div key={idx} />; const key = todayKey(new Date(year, month, d)); const p = records[key]; return <div key={idx} className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: percentColor(p), color: p >= 50 ? "#fff" : COLORS.text }}>{d}</div>; })}</div>
      <div className="flex items-center gap-3 mt-3 text-[10px]" style={{ color: COLORS.textSoft }}>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.primary }} /> ممتاز</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.leaf }} /> جيد</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.yellow }} /> متوسط</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.locked }} /> لا بيانات</span>
      </div>
    </div></div>
  );
}
function ParentDashboard({ prayers, tasks, setTasks, upset, setUpset, quizStars, prayerTimes, setPrayerTimes, remindersOn, setRemindersOn, onBack }) {
  const [tab, setTab] = useState("overview"); const [newTask, setNewTask] = useState(""); const [newMandatory, setNewMandatory] = useState(true);
  const [records, setRecords] = useState({}); const [loadingRecords, setLoadingRecords] = useState(false);
  useEffect(() => {
    if (tab !== "week" && tab !== "month") return;
    let cancelled = false;
    async function load() {
      setLoadingRecords(true); const map = {}; const now = new Date(); const dateKeys = new Set();
      if (tab === "week") { for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dateKeys.add(todayKey(d)); } }
      else { const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(); for (let d = 1; d <= daysInMonth; d++) dateKeys.add(todayKey(new Date(now.getFullYear(), now.getMonth(), d))); }
      for (const k of dateKeys) { const v = await safeGet(`record:${k}`); if (v) { try { map[k] = JSON.parse(v).percent; } catch { /* skip */ } } }
      if (!cancelled) { setRecords(map); setLoadingRecords(false); }
    }
    load(); return () => { cancelled = true; };
  }, [tab]);
  function addTask() { if (!newTask.trim()) return; setTasks((prev) => [...prev, { id: Date.now(), title: newTask.trim(), mandatory: newMandatory, done: false, photo: false }]); setNewTask(""); }
  function removeTask(id) { setTasks((prev) => prev.filter((t) => t.id !== id)); }
  function updatePrayerTime(id, val) { setPrayerTimes((prev) => ({ ...prev, [id]: val })); }
  const prayersDone = prayers.filter((p) => p.done).length; const tasksDone = tasks.filter((t) => t.done).length;
  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: COLORS.bg }}>
      <div className="px-5 pt-6 pb-5" style={{ backgroundColor: COLORS.accent2, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-bold text-white/90 mb-2">رجوع للطفل <ArrowRight size={16} /></button>
        <h1 className="text-white text-2xl font-black" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>لوحة الوالدين</h1>
        <p className="text-white/85 text-sm mt-1">متابعة يوم طفلك وإدارة المهام والتقارير</p>
      </div>
      <ParentTabs tab={tab} setTab={setTab} />
      {tab === "overview" && (
        <>
          <div className="px-5 mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: "#fff" }}><p className="text-2xl font-black" style={{ color: COLORS.primaryDark }}>{prayersDone}/{prayers.length}</p><p className="text-xs font-bold" style={{ color: COLORS.textSoft }}>الصلوات اليوم</p></div>
            <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: "#fff" }}><p className="text-2xl font-black" style={{ color: COLORS.primaryDark }}>{tasksDone}/{tasks.length}</p><p className="text-xs font-bold" style={{ color: COLORS.textSoft }}>المهام المنجزة</p></div>
          </div>
          <div className="px-5 mt-4"><div className="rounded-2xl p-4 shadow-sm flex items-center justify-between" style={{ backgroundColor: "#fff" }}>
            <div className="pl-3"><p className="font-black text-sm" style={{ color: COLORS.primaryDark }}>أزعج أحد أفراد الأسرة اليوم؟</p><p className="text-xs" style={{ color: COLORS.textSoft }}>تفعيل هذا الخيار يقفل منطقة اللعب فوراً</p></div>
            <button onClick={() => setUpset((v) => !v)} className="w-14 h-8 rounded-full flex items-center px-1 shrink-0" style={{ backgroundColor: upset ? COLORS.danger : COLORS.locked, justifyContent: upset ? "flex-start" : "flex-end" }}><div className="w-6 h-6 rounded-full bg-white" /></button>
          </div></div>
          <div className="px-5 mt-4"><div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: "#fff" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-black text-sm flex items-center gap-2" style={{ color: COLORS.primaryDark }}><Bell size={16} /> تنبيهات مواقيت الصلاة</p>
              <button onClick={() => setRemindersOn((v) => !v)} className="w-14 h-8 rounded-full flex items-center px-1 shrink-0" style={{ backgroundColor: remindersOn ? COLORS.primary : COLORS.locked, justifyContent: remindersOn ? "flex-start" : "flex-end" }}><div className="w-6 h-6 rounded-full bg-white" /></button>
            </div>
            <p className="text-xs mb-3" style={{ color: COLORS.textSoft }}>تعمل التنبيهات أثناء فتح التطبيق فقط في هذا النموذج التجريبي، وتصدر نغمة تذكير لطيفة (وليست تسجيل أذان حقيقي).</p>
            <div className="grid grid-cols-2 gap-2">{PRAYER_DEFS.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1" style={{ backgroundColor: COLORS.bg }}>
                <span className="text-xs font-bold" style={{ color: COLORS.text }}>{p.name}</span>
                <input type="time" value={prayerTimes[p.id]} onChange={(e) => updatePrayerTime(p.id, e.target.value)} className="text-xs bg-transparent outline-none font-bold" style={{ color: COLORS.primaryDark, width: 68 }} />
              </div>))}</div>
          </div></div>
          <div className="px-5 mt-5">
            <h2 className="font-black mb-2" style={{ color: COLORS.primaryDark }}>إدارة المهام</h2>
            <div className="flex flex-col gap-2">{tasks.map((t) => (
              <div key={t.id} className="rounded-2xl p-3 flex items-center gap-2 shadow-sm" style={{ backgroundColor: "#fff" }}>
                <div className="flex-1"><p className="font-bold text-sm" style={{ color: COLORS.text }}>{t.title}</p><div className="flex gap-1 mt-1">{t.mandatory && <Chip color={COLORS.accent}>أساسية</Chip>}{t.done && <Chip color={COLORS.leaf}>منجزة</Chip>}{t.photo && <Chip color={COLORS.accent2}>موثقة بصورة 📷</Chip>}</div></div>
                <button onClick={() => removeTask(t.id)} className="p-2"><X size={18} color={COLORS.danger} /></button>
              </div>))}</div>
            <div className="rounded-2xl p-3 mt-3 shadow-sm flex flex-col gap-2" style={{ backgroundColor: "#fff" }}>
              <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="أضف مهمة جديدة..." className="w-full py-2 px-3 rounded-xl border-2 outline-none text-sm" style={{ borderColor: COLORS.locked }} />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold" style={{ color: COLORS.textSoft }}><input type="checkbox" checked={newMandatory} onChange={(e) => setNewMandatory(e.target.checked)} /> مهمة أساسية (تقفل اللعب إن لم تُنجز)</label>
                <button onClick={addTask} className="flex items-center gap-1 py-2 px-3 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: COLORS.primary }}><Plus size={16} /> إضافة</button>
              </div>
            </div>
          </div>
        </>
      )}
      {tab === "report" && <DailyReport prayers={prayers} tasks={tasks} quizStars={quizStars} upset={upset} />}
      {tab === "week" && (loadingRecords ? <p className="text-center mt-8 text-sm" style={{ color: COLORS.textSoft }}>جارِ التحميل...</p> : <WeekView records={records} />)}
      {tab === "month" && (loadingRecords ? <p className="text-center mt-8 text-sm" style={{ color: COLORS.textSoft }}>جارِ التحميل...</p> : <MonthView records={records} />)}
    </div>
  );
}

function MainApp() {
  const [screen, setScreen] = useState("select");
  const [prayers, setPrayers] = useState(PRAYER_DEFS.map((p) => ({ ...p, done: false })));
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [upset, setUpset] = useState(false);
  const [quizStars, setQuizStars] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState(DEFAULT_PRAYER_TIMES);
  const [remindersOn, setRemindersOn] = useState(false);
  const [alarm, setAlarm] = useState(null);
  const [ready, setReady] = useState(false);
  const firedRef = useRef({});
  const lastSyncedRef = useRef(""); // guards against re-applying our own writes

  const todayRecordKey = `record:${todayKey()}`;

  // initial load: settings + today's already-saved progress (in case the app
  // was reopened, or another device already logged something today)
  useEffect(() => {
    (async () => {
      const t = await safeGet("settings:tasks"); const pt = await safeGet("settings:prayerTimes"); const rem = await safeGet("settings:remindersOn");
      if (t) { try { setTasks(JSON.parse(t)); } catch { /* ignore */ } }
      if (pt) { try { setPrayerTimes(JSON.parse(pt)); } catch { /* ignore */ } }
      if (rem) setRemindersOn(rem === "true");
      const rec = await safeGet(todayRecordKey);
      if (rec) {
        try {
          const data = JSON.parse(rec);
          if (data.date === todayKey()) {
            if (data.prayers) setPrayers(mergePrayers(data.prayers));
            if (data.tasks) setTasks(data.tasks);
            if (typeof data.upset === "boolean") setUpset(data.upset);
            if (typeof data.quizStars === "number") setQuizStars(data.quizStars);
            lastSyncedRef.current = rec;
          }
        } catch { /* ignore */ }
      }
      setReady(true);
    })();
  }, []);
  useEffect(() => { if (ready) safeSet("settings:tasks", JSON.stringify(tasks)); }, [tasks, ready]);
  useEffect(() => { if (ready) safeSet("settings:prayerTimes", JSON.stringify(prayerTimes)); }, [prayerTimes, ready]);
  useEffect(() => { if (ready) safeSet("settings:remindersOn", String(remindersOn)); }, [remindersOn, ready]);

  // realtime: if the child's phone changes something, the parent's phone
  // (and vice-versa) picks it up live without needing to reopen the app
  useEffect(() => {
    const unsub = subscribeKey(todayRecordKey, (raw) => {
      if (raw === lastSyncedRef.current) return; // this is just our own write echoing back
      try {
        const data = JSON.parse(raw);
        if (data.date !== todayKey()) return;
        lastSyncedRef.current = raw;
        if (data.prayers) setPrayers(mergePrayers(data.prayers));
        if (data.tasks) setTasks(data.tasks);
        if (typeof data.upset === "boolean") setUpset(data.upset);
        if (typeof data.quizStars === "number") setQuizStars(data.quizStars);
      } catch { /* ignore */ }
    });
    return unsub;
  }, []);

  const mandatoryPending = prayers.some((p) => !p.done) || tasks.some((t) => t.mandatory && !t.done);
  const playUnlocked = !mandatoryPending && !upset;
  let lockReason = "";
  if (upset) lockReason = "تحدث مع أحد أفراد أسرتك أولاً 💛"; else if (mandatoryPending) lockReason = "أكمل صلواتك ومهامك الأساسية أولاً";

  useEffect(() => {
    if (!ready) return;
    const total = prayers.length + tasks.length; const done = prayers.filter((p) => p.done).length + tasks.filter((t) => t.done).length;
    const percent = Math.round((done / total) * 100);
    const record = { date: todayKey(), percent, prayers: prayers.map((p) => ({ id: p.id, done: p.done })), tasks, upset, quizStars };
    const json = JSON.stringify(record);
    if (json === lastSyncedRef.current) return; // nothing actually changed vs. last sync
    lastSyncedRef.current = json;
    safeSet(todayRecordKey, json);
  }, [prayers, tasks, quizStars, upset, ready]);

  useEffect(() => {
    if (!remindersOn) return;
    const interval = setInterval(() => {
      const now = hhmm(); const key = todayKey();
      PRAYER_DEFS.forEach((p) => { const target = prayerTimes[p.id]; const fireKey = `${key}-${p.id}`; if (target === now && !firedRef.current[fireKey]) { firedRef.current[fireKey] = true; setAlarm(p); playChime(); } });
    }, 15000);
    return () => clearInterval(interval);
  }, [remindersOn, prayerTimes]);

  const nextPrayer = useMemo(() => {
    const now = hhmm();
    const upcoming = PRAYER_DEFS.filter((p) => prayerTimes[p.id] > now).sort((a, b) => (prayerTimes[a.id] > prayerTimes[b.id] ? 1 : -1));
    const chosen = upcoming[0] || PRAYER_DEFS[0];
    return { name: chosen.name, time: prayerTimes[chosen.id] };
  }, [prayerTimes]);

  function dismissAlarm(markDone) { if (markDone && alarm) setPrayers((prev) => prev.map((p) => (p.id === alarm.id ? { ...p, done: true } : p))); setAlarm(null); }

  return (
    <div dir="rtl" lang="ar" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@600;800&family=Tajawal:wght@400;500;700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
      {alarm && <PrayerAlarmModal prayerName={alarm.name} onDone={() => dismissAlarm(true)} onLater={() => dismissAlarm(false)} />}
      {screen === "select" && <ProfileSelect onSelect={setScreen} />}
      {screen === "parent-gate" && <ParentGate onBack={() => setScreen("select")} onUnlock={() => setScreen("parent")} />}
      {screen === "child" && (
        <ChildHome prayers={prayers} setPrayers={setPrayers} tasks={tasks} setTasks={setTasks} quizStars={quizStars}
          playUnlocked={playUnlocked} lockReason={lockReason} onPlay={() => setScreen("play")} onParent={() => setScreen("parent-gate")} nextPrayer={nextPrayer} />
      )}
      {screen === "play" && <GameHub onBack={() => setScreen("child")} onEarnStars={(n) => setQuizStars((s) => s + n)} />}
      {screen === "parent" && (
        <ParentDashboard prayers={prayers} tasks={tasks} setTasks={setTasks} upset={upset} setUpset={setUpset} quizStars={quizStars}
          prayerTimes={prayerTimes} setPrayerTimes={setPrayerTimes} remindersOn={remindersOn} setRemindersOn={setRemindersOn} onBack={() => setScreen("child")} />
      )}
    </div>
  );
}

/* ================= FAMILY CODE GATE ================= */
// Both the parent's device and the child's device must enter the exact same
// code here so their data (tasks, prayers, reports...) syncs through Firebase.

function FamilyCodeGate({ onReady }) {
  const [code, setCode] = useState("");
  function submit() {
    const clean = code.trim().toLowerCase().replace(/\s+/g, "-");
    if (!clean) return;
    localStorage.setItem("baraem_family_code", clean);
    setFamilyCode(clean);
    onReady();
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center" style={{ backgroundColor: COLORS.bg }}>
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ backgroundColor: COLORS.primary }}>
        <Users size={30} color="#fff" />
      </div>
      <h1 className="text-xl font-black mb-2" style={{ color: COLORS.primaryDark }}>رمز عائلتك</h1>
      <p className="text-sm mb-6 max-w-xs" style={{ color: COLORS.textSoft }}>
        اختر أي رمز تحبه (مثال: <b>alsaid-family</b>). استعمل نفس الرمز بالضبط في جهاز الوالدين
        وجهاز الطفل باش تتشارك البيانات بينهم مباشرة.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="مثال: alsaid-family"
        className="w-64 text-center py-3 rounded-2xl border-2 outline-none mb-3 font-bold"
        style={{ borderColor: COLORS.leaf, color: COLORS.text }}
      />
      <button onClick={submit} className="w-64 py-3 rounded-2xl font-bold text-white" style={{ backgroundColor: COLORS.primary }}>
        دخول
      </button>
    </div>
  );
}

export default function Root() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("baraem_family_code");
    if (saved) { setFamilyCode(saved); setReady(true); }
  }, []);
  if (!ready) return <FamilyCodeGate onReady={() => setReady(true)} />;
  return <MainApp />;
                                                                                                                                                                                                                                                  }
