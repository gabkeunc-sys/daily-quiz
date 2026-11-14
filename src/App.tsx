import { useEffect, useState } from 'react';
import { QUESTIONS } from './questions';
import { getItem, setItem } from './store';
import { todayKST, dayDiff, labelKR } from './today';

type Rec = { streak: number; total: number; lastSolved: string | null; lastPick: number | null };
const EMPTY: Rec = { streak: 0, total: 0, lastSolved: null, lastPick: null };

export default function App() {
  const today = todayKST();
  const idx = (Math.floor(Date.parse(today) / 86400e3) % QUESTIONS.length + QUESTIONS.length) % QUESTIONS.length;
  const Q = QUESTIONS[idx];
  const [rec, setRec] = useState<Rec | null>(null);

  useEffect(() => { getItem('rec').then(v => setRec(v ? JSON.parse(v) : EMPTY)); }, []);
  if (!rec) return <div className="wrap" />;

  const solvedToday = rec.lastSolved === today;
  const pick = solvedToday ? rec.lastPick : null;

  async function choose(i: number) {
    if (!rec || solvedToday) return;
    const correct = i === Q.answer;
    const continued = rec.lastSolved !== null && dayDiff(rec.lastSolved, today) === 1;
    const next: Rec = {
      streak: correct ? (continued ? rec.streak + 1 : 1) : 0,
      total: rec.total + (correct ? 1 : 0),
      lastSolved: today, lastPick: i,
    };
    setRec(next);
    await setItem('rec', JSON.stringify(next));
  }

  return (
    <div className="wrap">
      <header>
        <h1>하루 상식 한 문제</h1>
        <p className="date">{labelKR(today)}</p>
      </header>
      <section className="card">
        <span className="field">{Q.field}</span>
        <p className="q">{Q.q}</p>
      </section>
      <div className="choices">
        {Q.choices.map((c, i) => {
          let cls = 'choice';
          if (pick !== null) { if (i === Q.answer) cls += ' right'; else if (i === pick) cls += ' wrong'; else cls += ' dim'; }
          return <button key={i} className={cls} disabled={solvedToday} onClick={() => choose(i)}>{i + 1}. {c}</button>;
        })}
      </div>
      {pick !== null && (
        <section className="result">
          <p className="verdict">{pick === Q.answer ? '정답이에요' : `아쉬워요. 정답은 ${Q.answer + 1}번이에요`}</p>
          <p className="why">{Q.why}</p>
          <p className="tomorrow">내일 새 문제가 열려요</p>
        </section>
      )}
      <footer>연속 정답 {rec.streak}일 · 맞힌 문제 {rec.total}개</footer>
    </div>
  );
}
