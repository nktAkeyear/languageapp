import { LANGS } from '../../core/types';
import { TeapotEmblem } from '../art/props';
import { HarbourPanorama } from '../story/StoryStage';
import { useGame } from '../useGame';
import { LANG_JA } from './Settings';

const LANG_DESC = {
  en: '港に来る船乗りや商人は英語で注文する。',
  zh: '港に来る船乗りや商人は中国語（普通話）で注文する。',
};

export function TitleScreen() {
  const g = useGame();
  return (
    <div className="title-screen">
      <HarbourPanorama t={0.08} />
      <div className="title-card">
        <div className="title-ill" aria-hidden>
          <TeapotEmblem />
        </div>
        <h1>港町の調香茶房</h1>
        <p>
          港町の小さな茶房を、先代から受け継いだ。
          <br />
          お客さんの言葉は分からない。先代のレシピ帳も読めない。
          <br />
          それでも、絵と、表情と、ひと口の反応から、少しずつ読み解いていこう。
        </p>
        <div className="title-langs">
          {LANGS.map((l) => (
            <button key={l} type="button" className="btn btn-primary btn-big lang-btn" data-lang={l} onClick={() => g.chooseLanguage(l)}>
              <span className="lang-name">{LANG_JA[l]}</span>
              <span className="small">{g.save.progress[l] ? `続きから（${g.save.progress[l]!.day}日目）` : LANG_DESC[l]}</span>
            </button>
          ))}
        </div>
        <p className="small muted">訳は出てきません。言葉をタップすると手帳に記録とメモが残せます。</p>
      </div>
    </div>
  );
}
