// The ONLY bridge between the engines and React.
// The SessionEngine instance lives in a ref (stable across renders); a version
// counter forces a re-render after each mutation. Components never touch the
// engine directly — they read the returned state and call start/answer/proceed.
//
// Two-phase answering (UI-only, engine unchanged):
//   answer(key) -> engine.submit() records the result; we enter "feedback" mode.
//   proceed()   -> engine.next() advances; we leave feedback mode.
import { useRef, useState, useCallback } from "react";
import { SessionEngine } from "../engines/sessionEngine.js";
import { createQuestionEngine } from "../engines/questionEngine.js";

export function useSession() {
  const engineRef = useRef(null);
  const [feedback, setFeedback] = useState(null); // null = answering; {} = showing result
  const [, bump] = useState(0);
  const rerender = useCallback(() => bump((v) => v + 1), []);
  const questionStartRef = useRef(null); // timestamp when the current question was shown
  const sessionStartRef = useRef(null); // ISO string for when the session began

  const start = useCallback(
    (config) => {
      // config.bank is the question array fetched from /api/questions.
      // We filter by subject inside createQuestionEngine so the engine only
      // sees the relevant slice (bank is already pre-filtered by level from the API).
      engineRef.current = new SessionEngine({
        config,
        questionEngine: createQuestionEngine(config.subject || null, config.bank),
      });
      engineRef.current.next(); // load the first question
      sessionStartRef.current = new Date().toISOString();
      questionStartRef.current = Date.now();
      setFeedback(null);
      rerender();
    },
    [rerender],
  );

  const answer = useCallback(
    (key) => {
      const e = engineRef.current;
      if (!e || feedback) return; // ignore taps while feedback is showing
      const elapsed = questionStartRef.current
        ? Date.now() - questionStartRef.current
        : 0;
      e.submit(key, elapsed); // records result + timing
      const last = e.answers[e.answers.length - 1];
      setFeedback({
        isCorrect: last.isCorrect,
        selected: last.selected,
        correct: last.correct,
      });
      rerender();
    },
    [feedback, rerender],
  );

  const proceed = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    if (!e.isComplete()) e.next(); // advance to the next question
    questionStartRef.current = Date.now(); // reset timer for next question
    setFeedback(null);
    rerender();
  }, [rerender]);

  const reset = useCallback(() => {
    engineRef.current = null;
    sessionStartRef.current = null;
    questionStartRef.current = null;
    setFeedback(null);
    rerender();
  }, [rerender]);

  // Returns current results regardless of completion (used for partial-exit saves).
  const getResults = useCallback(
    () => engineRef.current?.getResults() ?? null,
    [],
  );

  const e = engineRef.current;
  return {
    started: !!e,
    currentQuestion: e?.current ?? null,
    feedback, // null while answering; { isCorrect, selected, correct } while showing result
    progress: e ? { answered: e.answers.length, total: e.config.length } : null,
    isComplete: e ? e.isComplete() : false,
    results: e && e.isComplete() ? e.getResults() : null,
    sessionStartedAt: sessionStartRef.current,
    start,
    answer,
    proceed,
    reset,
    getResults,
  };
}
