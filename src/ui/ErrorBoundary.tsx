import { Component, type ReactNode } from 'react';

/** Last-resort guard so a rendering bug never leaves a blank page (the save stays intact). */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="title-screen">
        <div className="title-card">
          <h2>問題が起きました</h2>
          <p className="small">セーブデータはブラウザに残っています。再読み込みしてください。</p>
          <pre className="small" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {String(this.state.error.message)}
          </pre>
          <button type="button" className="btn btn-primary" onClick={() => location.reload()}>
            再読み込み
          </button>
        </div>
      </div>
    );
  }
}
