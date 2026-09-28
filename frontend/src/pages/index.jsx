import Link from 'next/link';

export default function Home() {
  return <div className="app-shell">
    <header className="site-header">
      <Link href="/" className="brand">Sound<span>Bridge</span></Link>
      <nav className="header-actions"><Link href="/demo" className="header-link">Explore demo</Link><a className="nav-cta" href="https://github.com/Tito-Osemobor/soundbridge#run-real-transfers">Run it yourself ↗</a></nav>
    </header>
    <main className="home-main">
      <div className="hero">
        <p className="eyebrow">A BETTER WAY TO MOVE YOUR MUSIC</p>
        <h1>Your playlists<br />belong <em>everywhere.</em></h1>
        <p>Bring the songs you love from Spotify, YouTube Music, or Apple Music to a new home. Review the tricky matches. Keep your originals.</p>
        <div className="hero-actions"><Link href="/demo" className="primary-button">Try the interactive demo <span>↗</span></Link><a href="https://github.com/Tito-Osemobor/soundbridge#run-real-transfers" className="secondary-button">Set up real transfers</a></div>
        <small>The public demo uses sample music. Real transfers run locally with your own provider credentials.</small>
      </div>
      <div className="feature-strip">
        <article><span>01</span><h2>Connect</h2><p>Authorize your music services in a clear, guided flow.</p></article>
        <article><span>02</span><h2>Review</h2><p>See potential matches and decide what to keep or skip.</p></article>
        <article><span>03</span><h2>Move</h2><p>Create a new private playlist while the originals stay put.</p></article>
      </div>
      <div className="compat-note"><strong>About YouTube Music</strong><p>SoundBridge uses the official YouTube Data API. YouTube playlists can contain general videos, and only music videos may appear in the YouTube Music app.</p></div>
    </main>
    <footer className="footer">Designed &amp; built by Tito Osemobor <span>·</span> SoundBridge</footer>
  </div>;
}
