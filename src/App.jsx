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
