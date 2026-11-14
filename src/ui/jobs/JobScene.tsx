/**
 * A workplace as a scene: the place drawn behind (art per job), the person you work with or for
 * (drawn, talking in a speech bubble — target language only), the bench of the task's archetype
 * (sort / trade / make / check / respond), and the shift's frame: the boss's greeting, the task
 * counter, the reaction, the end of the shift with wages and a rank-up.
 * Desktop: a 1600×1000 stage scaled to the window; phone: the same pieces stacked.
 */
import { useEffect, useRef, useState } from 'react';
import { currentShift, jobById, rankName, shiftTally } from '../../jobs/engine';
import { personOf } from '../../jobs/templates';
import type { JobContent, ShiftState, TaskAnswer, TaskInstance, TaskResult } from '../../jobs/types';
import { CustomerArt, lookFor, type Expression, type Pose } from '../art/customer';
import { skyAt } from '../art/sky';
import { SpeakButton, WordText } from '../components/WordText';
import { useSpeechAvailable } from '../speech';
import { useMobile } from '../layout';
import { BookProps, CornerHooks } from '../scene/parts';
import { useStageScale } from '../scene/ShopScene';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { useReducedMotion } from '../uiState';
import { lineMs, useTalkBurst } from '../useTalk';
import { JobBackdrop } from './art';
import { JobAmbient } from './ambient';
import { Raster } from '../art/Raster';
import { LevelTag, RankProgress } from './bits';
import { SortBench, TradeBench } from './benches';
import { CheckDesk, MakeBench, RespondDesk } from './benches2';

const PART_T = [0.1, 0.38, 0.7];

export interface BenchProps {
  task: TaskInstance;
  jc: JobContent;
  /** The result of this task (after handing in). */
  result: TaskResult | null;
  onSubmit: (a: TaskAnswer) => void;
}

function Bench(props: BenchProps) {
  switch (props.task.spec.arch) {
    case 'sort':
      return <SortBench {...props} />;
    case 'trade':
      return <TradeBench {...props} />;
    case 'make':
      return <MakeBench {...props} />;
    case 'check':
      return <CheckDesk {...props} />;
    case 'respond':
      return <RespondDesk {...props} />;
  }
}

/** Seconds allowed for a timed task (optional time pressure). */
function timeFor(t: TaskInstance): number {
  const s = t.spec;
  const n = s.arch === 'sort' ? s.items.length : s.arch === 'check' ? (s.docs[s.target]?.fields?.length ?? 3) : s.arch === 'respond' ? 3 : 3;
  return 30 + n * 8;
}

export function JobScene({ onSettings }: { onSettings: () => void }) {
  const g = useGame();
  const mobile = useMobile();
  const { ref, scale } = useStageScale(1600, 1000);
  const { data, progress } = g;
  const shift = progress ? currentShift(progress) : null;
  const job = data && shift ? jobById(data, shift.job) : undefined;
  const jc = job && data ? job.content[data.lang] : undefined;
  if (!data || !progress || !shift || !job || !jc) return null;
  const sky = skyAt(PART_T[Math.min(2, shift.part)]);
  const task = shift.phase === 'task' || shift.phase === 'result' ? shift.tasks[shift.index] : null;
  const result = shift.phase === 'result' ? (shift.results[shift.index] ?? null) : null;
  const rank = progress.jobs?.jobs[job.id]?.rank ?? 1;
  const head = (
    <div className="js-head">
      <span className="js-sign">
        <WordText text={jc.sign} interactive={false} />
      </span>
      <span className="js-rank">
        {job.nameJa}・位「{rankName(rank)}」 <LevelTag job={job} rank={rank} />
      </span>
      {task ? (
        <span className="js-count" data-testid="task-count">
          {shift.index + 1} / {shift.tasks.length}
        </span>
      ) : null}
      <span className="js-coins">🪙 {progress.town.money}</span>
    </div>
  );
  const body =
    shift.phase === 'intro' ? (
      <Intro shift={shift} jc={jc} />
    ) : shift.phase === 'done' ? (
      <Done shift={shift} />
    ) : task ? (
      <TaskView key={task.key + shift.index} task={task} jc={jc} result={result} />
    ) : null;
  if (mobile)
    return (
      <div className={`m-job job-${job.id} ${task ? `arch-${task.spec.arch}` : ''}`} data-testid="job-scene" data-job={job.id} data-phase={shift.phase}>
        <div className="m-job-back">
          <JobBackdrop job={job.id} sky={sky} />
        </div>
        {head}
        {body}
        <div className="m-job-books">
          <BookProps compact />
        </div>
        <div className="m-hub-hooks">
          <CornerHooks onSettings={onSettings} />
        </div>
      </div>
    );
  return (
    <div className="scene-viewport" ref={ref}>
      <div className={`stage job-stage job-${job.id} ${task ? `arch-${task.spec.arch}` : ''}`} style={{ width: 1600, height: 1000, transform: `translate(-50%, -50%) scale(${scale})` }} data-testid="job-scene" data-job={job.id} data-phase={shift.phase}>
        <div className="js-backdrop">
          {/* the interior never changes during a shift: shown as a pre-rasterised image under the moving life */}
          <Raster className="job-backdrop" label={`job-${job.id}`}>
            <JobBackdrop job={job.id} sky={sky} />
          </Raster>
          <JobAmbient job={job.id} />
        </div>
        {head}
        {body}
        <div className="js-books">
          <BookProps compact />
        </div>
        <CornerHooks onSettings={onSettings} />
      </div>
    </div>
  );
}

function Person({ id, jc, ex, pose, talking }: { id: string; jc: JobContent; ex: Expression; pose: Pose; talking: boolean }) {
  const { data } = useGame();
  const p = personOf(data!, jc, id);
  return (
    <div className="js-person" data-person={id}>
      <CustomerArt look={lookFor(p.id, p.avatar)} ex={ex} pose={pose} talking={talking} />
      <span className="js-name">{p.name}</span>
    </div>
  );
}

function Bubble({ text, hidden, onReveal, tag }: { text: string; hidden?: boolean; onReveal?: () => void; tag?: string }) {
  const { lang } = useGame();
  const rm = useReducedMotion();
  if (!text) return null;
  return (
    <div className={`js-bubble ${hidden ? 'js-audio' : ''}`} data-testid="job-bubble" lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      {tag ? <span className="js-bubble-tag">{tag}</span> : null}
      {hidden ? (
        <span className="js-audio-row">
          <SpeakButton text={text} label="聞く" big />
          <button type="button" className="btn btn-small" onClick={onReveal}>
            文字で見る
          </button>
        </span>
      ) : (
        <>
          <WordText text={text} reveal={rm ? undefined : lineMs(text, false)} />
          <SpeakButton text={text} label="" className="speak-round" />
        </>
      )}
    </div>
  );
}

function Intro({ shift, jc }: { shift: ShiftState; jc: JobContent }) {
  const g = useGame();
  const talking = useTalkBurst(`intro${shift.part}`, lineMs(shift.startLine, false));
  return (
    <>
      <div className="js-left">
        <Bubble text={shift.startLine} />
        <Person id={jc.boss} jc={jc} ex="happy" pose="wave" talking={talking} />
      </div>
      <div className="js-work js-intro">
        <p className="hand">今日の仕事は {shift.tasks.length} 件。</p>
        <button type="button" className="cv-btn cv-next" data-testid="shift-begin" onClick={() => (sfx('page'), g.jobs.begin())}>
          仕事を始める
        </button>
      </div>
    </>
  );
}

function TaskView({ task, jc, result }: { task: TaskInstance; jc: JobContent; result: TaskResult | null }) {
  const g = useGame();
  // Without a voice for the language, a heard-only request is shown as text (like the tea house).
  const canSpeak = useSpeechAvailable(g.lang ?? 'en');
  const [revealed, setRevealed] = useState(false);
  const [left, setLeft] = useState(() => (task.timed ? timeFor(task) : 0));
  const late = useRef(false);
  const rm = useReducedMotion();
  useEffect(() => {
    if (!task.timed || result) return;
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [task.timed, result]);
  useEffect(() => {
    if (task.timed && left === 0) late.current = true;
  }, [left, task.timed]);
  const sayKey = result ? `r:${task.key}` : `s:${task.key}`;
  const shown = result ? result.reaction : task.say;
  const talking = useTalkBurst(sayKey, lineMs(shown, false));
  const face: Expression = result ? (result.outcome === 'perfect' ? 'delighted' : result.outcome === 'minor' ? 'neutral' : result.outcome === 'bad' ? 'angry' : 'puzzled') : 'listen';
  const pose: Pose = result ? (result.outcome === 'perfect' ? 'heart' : 'open') : task.spec.arch === 'trade' || task.spec.arch === 'make' ? 'explain' : 'chin';
  useEffect(() => {
    if (!result) return;
    sfx(result.outcome === 'perfect' ? 'happy' : result.outcome === 'minor' ? 'clink' : 'fail');
    if (result.coins + result.bonus > 0) window.setTimeout(() => sfx('coin'), 500);
  }, [result]);
  const onSubmit = (a: TaskAnswer) => {
    sfx(task.spec.arch === 'check' ? 'stamp' : 'serve');
    g.jobs.submit(a, late.current);
  };
  return (
    <>
      <div className="js-left">
        {result ? (
          <Bubble text={result.reaction} tag={result.outcome === 'perfect' ? undefined : undefined} />
        ) : (
          <Bubble text={task.say} hidden={task.audioOnly && canSpeak && !revealed} onReveal={() => setRevealed(true)} />
        )}
        {result && task.audioOnly && task.say ? (
          <div className="js-said">
            <span className="hand small muted">さっきの注文：</span>
            <WordText text={task.say} />
          </div>
        ) : null}
        <Person id={task.person} jc={jc} ex={face} pose={pose} talking={talking} />
      </div>
      <div className="js-work">
        {task.timed && !result ? (
          <div className={`js-timer ${left < 10 ? 'low' : ''} ${rm ? 'rm' : ''}`} data-testid="task-timer" aria-label={`残り${left}秒`}>
            ⏳ {left}
          </div>
        ) : null}
        <Bench task={task} jc={jc} result={result} onSubmit={onSubmit} />
        {result ? (
          <div className="js-result" data-testid="task-result" data-outcome={result.outcome}>
            <span className={`js-outcome out-${result.outcome}`}>{OUTCOME_JA[result.outcome]}</span>
            <span className="js-pay">
              +{result.coins}
              {result.bonus ? `（+${result.bonus}）` : ''} 🪙
            </span>
            <button type="button" className="cv-btn cv-next" data-testid="task-next" onClick={() => (sfx('page'), g.jobs.next())}>
              次へ
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export const OUTCOME_JA = { perfect: '完璧', minor: 'まあまあ', fail: 'うまくいかなかった', bad: '大失敗' } as const;

function Done({ shift }: { shift: ShiftState }) {
  const g = useGame();
  const data = g.data!;
  const job = jobById(data, shift.job)!;
  const jc = job.content[data.lang]!;
  const tally = shiftTally(shift);
  const coins = shift.results.reduce((a, r) => a + r.coins + r.bonus, 0);
  const talking = useTalkBurst(`end${shift.part}`, lineMs(shift.endLine, false));
  useEffect(() => {
    if (shift.rankUp) sfx('chapter');
  }, [shift.rankUp]);
  return (
    <>
      <div className="js-left">
        <Bubble text={shift.endLine} />
        <Person id={jc.boss} jc={jc} ex="happy" pose="wave" talking={talking} />
      </div>
      <div className="js-work js-done" data-testid="shift-done">
        <h3>今日の{job.nameJa}の仕事、おしまい</h3>
        <div className="js-tally">
          {(['perfect', 'minor', 'fail', 'bad'] as const).map((k) => (tally[k] ? <span key={k} className={`js-outcome out-${k}`}>{OUTCOME_JA[k]} ×{tally[k]}</span> : null))}
        </div>
        <p className="js-wage">お給金 {coins} 枚</p>
        {shift.rankUp ? (
          <div className="js-rankup" data-testid="rank-up">
            <div className="js-rankup-badge">{rankName(shift.rankUp)}</div>
            <p>
              位が上がった！ これからは「{rankName(shift.rankUp)}」。<LevelTag job={job} rank={shift.rankUp} />
            </p>
            <p className="small">{job.ranks.find((r) => r.rank === shift.rankUp)?.noteJa}</p>
            {job.ranks.find((r) => r.rank === shift.rankUp)?.reward?.coins ? <p className="small">ごほうび：{job.ranks.find((r) => r.rank === shift.rankUp)!.reward!.coins} 枚</p> : null}
          </div>
        ) : (
          <RankProgress job={job} />
        )}
        <button type="button" className="cv-btn cv-next" data-testid="shift-leave" onClick={() => (sfx('steps'), g.jobs.leave())}>
          町へ戻る
        </button>
      </div>
    </>
  );
}
