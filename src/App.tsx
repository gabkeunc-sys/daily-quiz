import { useEffect, useRef, useState } from 'react';
import { QUESTIONS } from './questions';
import { getItem, setItem } from './store';
import { todayKST, dayDiff, labelKR } from './today';
import { BONUS } from './bonus';
import { adSupported, preloadRewarded, showRewarded } from './ads';

type Rec = { streak: number; total: number; lastSolved: string | null; lastPick: number | null };
const EMPTY: Rec = { streak: 0, total: 0, lastSolved: null, lastPick: null };
// 보너스 문제 기록. 연속 정답(rec)과는 따로 저장해요.
type Bonus = { date: string; pick: number | null };

export default function App() {
  const today = todayKST();
  const idx = (Math.floor(Date.parse(today) / 86400e3) % QUESTIONS.length + QUESTIONS.length) % QUESTIONS.length;
  const Q = QUESTIONS[idx];
  const [rec, setRec] = useState<Rec | null>(null);

  const dayNo = Math.floor(Date.parse(today) / 86400e3);
  const B = BONUS[(dayNo % BONUS.length + BONUS.length) % BONUS.length];
  const [bonus, setBonus] = useState<Bonus | null>(null);
  const [adState, setAdState] = useState<'loading' | 'ready' | 'none' | 'showing'>('loading');
  const [note, setNote] = useState('');
  const cleanup = useRef<() => void>(() => {});

  useEffect(() => {
    getItem('rec').then(v => setRec(v ? JSON.parse(v) : EMPTY));
    getItem('bonus').then(v => { const b = v ? JSON.parse(v) as Bonus : null; setBonus(b && b.date === today ? b : null); });
  }, []);

  // 광고는 화면이 열릴 때 미리 불러 둬요.
  function preload() {
    if (!adSupported()) { setAdState('none'); return; }
    setAdState('loading');
    cleanup.current = preloadRewarded(() => setAdState('ready'), () => setAdState('none'));
  }
  useEffect(() => { preload(); return () => cleanup.current(); }, []);

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

  function watchAd() {
    if (adState !== 'ready') return;
    setAdState('showing'); setNote('');
    showRewarded(async earned => {
      if (earned) {
        const b: Bonus = { date: today, pick: null };
        setBonus(b); await setItem('bonus', JSON.stringify(b));
      } else {
        setNote('광고를 끝까지 보면 열려요');
      }
      preload();
    });
  }

  async function chooseBonus(i: number) {
    if (!bonus || bonus.pick !== null) return;
    const b: Bonus = { date: today, pick: i };
    setBonus(b); await setItem('bonus', JSON.stringify(b));
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
      {pick !== null && !bonus && (
        <section className="bonus-ask">
          <button className="bonus-btn" disabled={adState !== 'ready'} onClick={watchAd}>광고 보고 보너스 문제 풀기</button>
          <p className="bonus-note">
            {adState === 'none' ? '광고는 토스 앱에서만 볼 수 있어요' : adState === 'loading' ? '광고를 준비하고 있어요' : note || '보너스 문제는 연속 정답 기록에 들어가지 않아요'}
          </p>
        </section>
      )}
      {pick !== null && bonus && (
        <section className="bonus">
          <span className="field">보너스 · {B.field}</span>
          <p className="q">{B.q}</p>
          <div className="choices">
            {B.choices.map((c, i) => {
              let cls = 'choice';
              if (bonus.pick !== null) { if (i === B.answer) cls += ' right'; else if (i === bonus.pick) cls += ' wrong'; else cls += ' dim'; }
              return <button key={i} className={cls} disabled={bonus.pick !== null} onClick={() => chooseBonus(i)}>{i + 1}. {c}</button>;
            })}
          </div>
          {bonus.pick !== null && <p className="why">{bonus.pick === B.answer ? '정답이에요. ' : `정답은 ${B.answer + 1}번이에요. `}{B.why}</p>}
        </section>
      )}
      <footer>연속 정답 {rec.streak}일 · 맞힌 문제 {rec.total}개</footer>
    </div>
  );
}
