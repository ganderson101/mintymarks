// Pure UI: lets the user pick a level + difficulty + session length, then fires onStart({ level, length, difficulties }).
// Session length is chosen here and passed into config -- never hardcoded in the engine.
// Difficulty tiers are queried dynamically from the question engine so unavailable tiers are hidden.
import { useState, useMemo } from "react";
import { createQuestionEngine, DIFFICULTY_TIERS } from "../engines/questionEngine.js";

const LEVELS = [
  { value: "ks2", label: "Years 3-6 (KS2)" },
  { value: "ks3", label: "Years 7-9 (KS3)" },
  { value: "gcse", label: "GCSE Maths" },
];

const TIER_ORDER = ["easy", "medium", "hard"];
const TIER_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard" };

// Subject-agnostic engine used only for tier availability lookups at the start screen.
const lookupEngine = createQuestionEngine(null);

export default function StartScreen({ onStart }) {
  const [level, setLevel] = useState("ks3");
  const [difficulty, setDifficulty] = useState("all"); // "all" | "easy" | "medium" | "hard"
  const [length, setLength] = useState(10);
  const [lengthStr, setLengthStr] = useState("10");

  // Which tiers have questions for the selected level -- recomputed on level change.
  const availableTiers = useMemo(() => lookupEngine.getAvailableTiers(level), [level]);

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    // Reset difficulty if the current selection doesn't exist for the new level.
    const tiers = lookupEngine.getAvailableTiers(newLevel);
    if (difficulty !== "all" && !tiers.includes(difficulty)) {
      setDifficulty("all");
    }
  };

  const handleStart = () => {
    const difficulties = difficulty === "all" ? null : DIFFICULTY_TIERS[difficulty];
    onStart({ level, length, difficulties });
  };

  const adjustLength = (delta) => {
    const next = Math.min(100, Math.max(1, length + delta));
    setLength(next);
    setLengthStr(String(next));
  };

  return (
    <div>
      <h1 className="title">MintyMarks</h1>
      <p className="subtitle">Adaptive quiz session.</p>

      <p className="field-label">Level</p>
      <div className="level-picker">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            className={"level-btn" + (level === l.value ? " active" : "")}
            onClick={() => handleLevelChange(l.value)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <p className="field-label">Difficulty</p>
      <div className="level-picker">
        <button
          className={"level-btn" + (difficulty === "all" ? " active" : "")}
          onClick={() => setDifficulty("all")}
        >
          All
        </button>
        {TIER_ORDER.filter((t) => availableTiers.includes(t)).map((t) => (
          <button
            key={t}
            className={"level-btn" + (difficulty === t ? " active" : "")}
            onClick={() => setDifficulty(t)}
          >
            {TIER_LABELS[t]}
          </button>
        ))}
      </div>

      <label className="field">
        <span>Questions this session</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            className="stepper-btn"
            onClick={() => adjustLength(-1)}
            aria-label="Decrease"
          >&#x2212;</button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={lengthStr}
            style={{ width: 52, textAlign: "center" }}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setLengthStr(raw);
              const v = parseInt(raw, 10);
              if (!isNaN(v)) setLength(Math.min(100, Math.max(1, v)));
            }}
            onBlur={() => {
              const v = parseInt(lengthStr, 10);
              const clamped = isNaN(v) || v < 1 ? 1 : Math.min(100, v);
              setLength(clamped);
              setLengthStr(String(clamped));
            }}
          />
          <button
            type="button"
            className="stepper-btn"
            onClick={() => adjustLength(1)}
            aria-label="Increase"
          >+</button>
        </div>
      </label>

      <button
        className="btn-primary"
        onClick={handleStart}
      >
        Start session
      </button>
    </div>
  );
}
