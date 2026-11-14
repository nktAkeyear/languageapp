/**
 * Save export / import as text: the fallback that always works. In sandboxed hosts (e.g. the
 * claude.ai copy of the game) a file download via <a download> silently does nothing, so the
 * save can also be shown as text and copied (clipboard, or select-and-copy by hand), and a save
 * can be imported by pasting its text.
 */
import { useRef, useState } from 'react';
import { useGame } from '../useGame';

type Mode = null | 'export' | 'import';

export function SaveTextTransfer({ onImported }: { onImported(msg: string): void }) {
  const g = useGame();
  const [mode, setMode] = useState<Mode>(null);
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const area = useRef<HTMLTextAreaElement>(null);

  const selectAll = () => {
    const el = area.current;
    if (!el) return;
    el.focus();
    el.select();
    el.setSelectionRange(0, el.value.length);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setNote('コピーしました。メモ帳などに貼り付けて保存してください。');
      return;
    } catch {
      /* clipboard blocked: fall back to selecting the text */
    }
    selectAll();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    setNote(ok ? 'コピーしました。メモ帳などに貼り付けて保存してください。' : '全体を選択しました。長押し（パソコンでは Ctrl+C / ⌘C）でコピーしてください。');
  };

  return (
    <div className="save-text">
      <div className="row-wrap">
        <button
          type="button"
          className="btn"
          data-testid="export-text"
          onClick={() => {
            setText(g.exportText());
            setNote('');
            setMode(mode === 'export' ? null : 'export');
          }}
        >
          テキストで書き出す（コピー）
        </button>
        <button
          type="button"
          className="btn"
          data-testid="import-text"
          onClick={() => {
            setText('');
            setNote('');
            setMode(mode === 'import' ? null : 'import');
          }}
        >
          テキストを貼り付けて読み込む
        </button>
      </div>
      <p className="small muted">ファイルの書き出しが動かない環境（ブラウザ内の埋め込み表示など）では、テキストでやり取りできます。</p>
      {mode ? (
        <div className="save-text-box" role="dialog" aria-label={mode === 'export' ? 'セーブデータ（テキスト）' : 'セーブデータを貼り付ける'}>
          <textarea
            ref={area}
            className="save-text-area"
            value={text}
            readOnly={mode === 'export'}
            onFocus={mode === 'export' ? selectAll : undefined}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === 'import' ? 'ここに書き出したテキストを貼り付ける' : undefined}
            rows={7}
            spellCheck={false}
            data-testid="save-text"
          />
          <div className="row-wrap">
            {mode === 'export' ? (
              <button type="button" className="btn btn-primary" onClick={copy} data-testid="copy-save">
                コピー
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={!text.trim()}
                data-testid="load-text"
                onClick={() => {
                  const err = g.importText(text);
                  if (err) setNote(`読み込めませんでした：${err}`);
                  else {
                    setMode(null);
                    onImported('読み込みました。');
                  }
                }}
              >
                読み込む
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => setMode(null)}>
              閉じる
            </button>
          </div>
          {note ? <p className="small">{note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
