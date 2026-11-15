import { useRef, useState } from 'react';
import type { GuessDisplay, LayoutPref } from '../../core/save';
import { pickVoice, speak, VOICE_SAMPLE, useVoices } from '../speech';
import { LANGS, type Lang } from '../../core/types';
import { useGame } from '../useGame';
import { SaveTextTransfer } from './SaveText';
import { LevelSettingsSection, openLevelSettings } from '../difficulty/LevelSettings';

export const LANG_JA: Record<Lang, string> = { en: '英語', zh: '中国語' };

/** Settings / menu (Japanese chrome). */
export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const g = useGame();
  const { settings, save, lang } = g;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const L: Lang = lang ?? 'en';
  const vs = useVoices(L, settings.voices?.[L]);
  const chosen = pickVoice(vs.voices, L, settings.voices?.[L]);
  const [tried, setTried] = useState('');
  return (
    <div className="settings">
      <div className="settings-head">
        <h2>設定・メニュー</h2>
        <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="閉じる">
          ✕
        </button>
      </div>

      <section>
        <h3>学ぶ言語</h3>
        <div className="row-wrap">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className={`btn ${l === lang ? 'btn-primary' : ''}`}
              onClick={() => {
                if (save.progress[l]) g.chooseLanguage(l);
                else openLevelSettings({ newLang: l }); // a new language starts with レベル設定
                onClose();
              }}
            >
              {LANG_JA[l]}
              {save.progress[l] ? `（${save.progress[l]!.day}日目）` : '（新しく始める）'}
            </button>
          ))}
        </div>
        <p className="small muted">進み具合は言語ごとに別々に保存されます。</p>
      </section>

      <LevelSettingsSection onCloseSettings={onClose} />

      <section>
        <h3>表示</h3>
        <label className="check">
          <input type="checkbox" checked={settings.showPinyin} onChange={(e) => g.updateSettings({ showPinyin: e.target.checked })} />
          中国語の漢字の上にピンインを表示する
        </label>
        <label className="field">
          画面レイアウト
          <select value={settings.layout} onChange={(e) => g.updateSettings({ layout: e.target.value as LayoutPref })}>
            <option value="auto">自動（画面の幅で選ぶ）</option>
            <option value="desktop">PC 用（横長の店内）</option>
            <option value="mobile">スマホ用（縦長の店内）</option>
          </select>
        </label>
        <label className="field">
          自分の推測（意味）を文の中の言葉に
          <select value={settings.guessDisplay ?? 'under'} onChange={(e) => g.updateSettings({ guessDisplay: e.target.value as GuessDisplay })} data-testid="settings-guess">
            <option value="under">言葉の下に小さく書く</option>
            <option value="hover">触れたとき・カーソルを当てたときだけ</option>
            <option value="off">文の中には出さない（手帳と単語帳だけ）</option>
          </select>
        </label>
        <div className="voice-box" data-testid="voice-settings">
          <h4 className="voice-h">読み上げ（{LANG_JA[L]}）</h4>
          {!vs.supported ? (
            <p className="small voice-note" data-testid="no-voice">
              このブラウザは読み上げ（音声合成）に対応していません。聞くボタンは使えず、聞くだけの注文や電話は文字で表示されます。
            </p>
          ) : !vs.loaded ? (
            <p className="small muted" data-testid="voice-loading">
              音声を読み込んでいます…
            </p>
          ) : !vs.voices.length ? (
            <p className="small voice-note" data-testid="no-voice">
              この環境には{L === 'zh' ? '中国語（普通話）' : '英語'}の読み上げ音声が見つかりません。聞くボタンは使えず、聞くだけの注文は文字で表示されます（OS の設定で音声を追加すると使えます）。
            </p>
          ) : (
            <label className="field">
              声
              <select
                value={settings.voices?.[L] && chosen?.voiceURI === settings.voices[L] ? settings.voices[L] : ''}
                onChange={(e) => g.updateSettings({ voices: { ...(settings.voices ?? {}), [L]: e.target.value || undefined } })}
                data-testid="voice-select"
              >
                <option value="">自動（{vs.voices[0].name}・{vs.voices[0].lang}）</option>
                {vs.voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name}・{v.lang}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="field">
            読み上げの速さ {settings.speechRate.toFixed(1)}
            <input
              type="range"
              min={0.5}
              max={1.3}
              step={0.1}
              value={settings.speechRate}
              onChange={(e) => g.updateSettings({ speechRate: Number(e.target.value) })}
              data-testid="voice-rate"
            />
          </label>
          <div className="row-wrap">
            <button
              type="button"
              className="btn"
              disabled={!chosen}
              onClick={() => setTried(speak(VOICE_SAMPLE[L], L, settings.speechRate, chosen?.voiceURI) ? `「${VOICE_SAMPLE[L]}」（${chosen?.name}）` : '読み上げられませんでした。')}
              data-testid="voice-test"
            >
              🔊 声を試す
            </button>
            {tried ? (
              <span className="small muted" aria-live="polite" data-testid="voice-tried">
                {tried}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <h3>音</h3>
        <label className="check">
          <input type="checkbox" checked={settings.muted} onChange={(e) => g.updateSettings({ muted: e.target.checked })} data-testid="settings-mute" />
          効果音を消す
        </label>
        <label className="field">
          効果音の音量 {Math.round(settings.volume * 100)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            disabled={settings.muted}
            onChange={(e) => g.updateSettings({ volume: Number(e.target.value) })}
          />
        </label>
        <label className="check">
          <input type="checkbox" checked={settings.ambient} onChange={(e) => g.updateSettings({ ambient: e.target.checked })} />
          店の環境音（波の音・遠くのカモメ）を流す
        </label>
      </section>

      <section>
        <h3>セーブデータ</h3>
        <div className="row-wrap">
          <button type="button" className="btn" onClick={() => g.exportFile()}>
            ファイルに書き出す
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            ファイルから読み込む
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const err = g.importText(await f.text());
              setMsg(err ? `読み込めませんでした：${err}` : '読み込みました。');
              e.target.value = '';
            }}
          />
        </div>
        <SaveTextTransfer onImported={setMsg} />
        {msg ? <p className="small">{msg}</p> : null}
        {lang ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (confirm(`${LANG_JA[lang]}の進み具合をすべて消して最初からやり直します。よろしいですか？`)) {
                g.resetLanguage(lang);
                onClose();
              }
            }}
          >
            {LANG_JA[lang]}の進み具合をリセット
          </button>
        ) : null}
      </section>

      <section>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            g.leaveToTitle();
            onClose();
          }}
        >
          タイトルへ戻る
        </button>
      </section>
    </div>
  );
}
