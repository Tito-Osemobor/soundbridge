import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/features/shared/api';
import { connectApple } from '@/features/connections/apple';
import { demo, platforms } from '@/features/demo/data';

const label = id => platforms.find(item => item.id === id)?.name || id;
const TERMINAL = ['completed', 'paused', 'failed'];
const activeJobKey = 'soundbridge.activeTransfer';

export default function Workspace({ mode = 'demo' }) {
  const isDemo = mode === 'demo';
  const [connections, setConnections] = useState([]);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [playlists, setPlaylists] = useState({});
  const [playlistErrors, setPlaylistErrors] = useState({});
  const [playlistId, setPlaylistId] = useState(null);
  const [job, setJob] = useState(null);
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reloadConnections = useCallback(async () => {
    const rows = isDemo ? await demo.connections() : await api('/api/connections');
    setConnections(rows);
  }, [isDemo]);

  useEffect(() => {
    reloadConnections().catch(err => setError(err.message));
    const outcome = new URLSearchParams(window.location.search).get('connection');
    if (outcome) setNotice(outcome === 'success' ? 'Service connected. Choose a playlist to continue.' :
      outcome === 'denied' ? 'Connection was cancelled.' : 'Connection failed. Please try again.');
  }, [reloadConnections]);

  useEffect(() => {
    if (isDemo) return;
    const id = window.localStorage.getItem(activeJobKey);
    if (!id) return;
    api(`/api/transfers/${encodeURIComponent(id)}`).then(saved => {
      setSource(saved.source);
      setDestination(saved.destination);
      setPlaylistId(saved.sourcePlaylistId);
      setPlaylists(previous => ({
        ...previous,
        [saved.source]: [{ id: saved.sourcePlaylistId, name: saved.sourceName,
          count: saved.items?.length || 0, creator: 'Selected playlist' }],
      }));
      setJob(saved);
      if (saved.status === 'ready') setChoices(saved.items.map(item => item.selectedId));
    }).catch(err => {
      window.localStorage.removeItem(activeJobKey);
      setError(`Could not restore the previous transfer: ${err.message}`);
    });
  }, [isDemo]);

  useEffect(() => {
    if (!source || playlists[source]) return;
    setLoading(true);
    (isDemo ? demo.playlists(source) : api(`/api/playlists?provider=${source}`))
      .then(items => {
        setPlaylists(previous => ({ ...previous, [source]: items }));
        setPlaylistErrors(previous => ({ ...previous, [source]: null }));
      })
      .catch(err => setPlaylistErrors(previous => ({ ...previous, [source]: err.message })))
      .finally(() => setLoading(false));
  }, [source, playlists, isDemo]);

  useEffect(() => {
    if (!job || TERMINAL.includes(job.status) || job.status === 'ready') return;
    const timer = setInterval(async () => {
      try {
        const next = isDemo ? await demo.get(job.id) : await api(`/api/transfers/${job.id}`);
        setJob(next);
        if (next.status === 'ready') setChoices(next.items.map(item => item.selectedId));
      } catch (err) {
        setError(err.message);
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [job?.id, job?.status, isDemo]);

  const connectedIds = useMemo(() => new Set(connections.map(item => item.platform)), [connections]);
  const selected = (playlists[source] || []).find(item => item.id === playlistId);
  const step = !source ? 1 : !playlistId || !destination ? 2 : !job ? 3 :
    job.status === 'ready' ? 4 : 5;
  const done = job?.items?.filter(item => item.status === 'done').length || 0;

  async function connect(id) {
    setError('');
    if (isDemo) return;
    if (id === 'APPLE_MUSIC') {
      try {
        setLoading(true);
        await connectApple();
        await reloadConnections();
        setNotice('Apple Music connected.');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      window.location.assign(`/api/connections/start/${id}`);
    }
  }

  async function refresh() {
    if (!source) return;
    setLoading(true);
    setError('');
    try {
      const items = isDemo ? await demo.playlists(source) : await api(`/api/playlists?provider=${source}`);
      setPlaylists(previous => ({ ...previous, [source]: items }));
      setPlaylistErrors(previous => ({ ...previous, [source]: null }));
    } catch (err) {
      setPlaylistErrors(previous => ({ ...previous, [source]: err.message }));
    } finally {
      setLoading(false);
    }
  }

  async function begin() {
    setError('');
    setLoading(true);
    try {
      const input = { source, destination, playlistId };
      const next = isDemo ? await demo.start(input) : await api('/api/transfers', {
        method: 'POST', body: JSON.stringify(input),
      });
      setJob(next);
      if (!isDemo) window.localStorage.setItem(activeJobKey, next.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    setError('');
    try {
      await (isDemo ? demo.confirm(job.id, choices) : api(`/api/transfers/${job.id}/confirm`, {
        method: 'POST', body: JSON.stringify({ choices }),
      }));
      setJob(previous => ({ ...previous, status: 'running' }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function retry() {
    setError('');
    try {
      await (isDemo ? demo.retry(job.id) : api(`/api/transfers/${job.id}/retry`, { method: 'POST' }));
      setJob(previous => ({ ...previous, status: previous.stage === 'writing' ? 'running' : 'matching' }));
    } catch (err) {
      setError(err.message);
    }
  }

  function reset() {
    if (!isDemo) window.localStorage.removeItem(activeJobKey);
    setJob(null); setSource(null); setDestination(null); setPlaylistId(null); setChoices([]);
  }

  function changeSelection(update) {
    if (!isDemo) window.localStorage.removeItem(activeJobKey);
    setJob(null);
    setChoices([]);
    update();
  }

  return <div className="app-shell">
    <header className="site-header">
      <Link href="/" className="brand">Sound<span>Bridge</span></Link>
      <div className="header-actions">
        <span className="mode-pill">{isDemo ? 'Interactive demo' : 'Local workspace'}</span>
        <Link href={isDemo ? (process.env.NEXT_PUBLIC_DEMO_ONLY === '1' ? 'https://github.com/Tito-Osemobor/soundbridge#run-real-transfers' : '/hub') : '/demo'} className="header-link">{isDemo ? 'Real setup' : 'Try demo'}</Link>
      </div>
    </header>
    <main className="workspace">
      <div className="workspace-intro">
        <p className="eyebrow">YOUR MUSIC, YOUR WAY</p>
        <h1>Move the music.<br /><em>Keep the feeling.</em></h1>
        <p>Connect your services, pick a playlist, and review every uncertain match before SoundBridge creates a private copy.</p>
      </div>
      {isDemo && <div className="info-banner">Sample data only. This tour never connects to a music account or changes a playlist. <Link href="/">How real transfers work →</Link></div>}
      {!isDemo && <div className="info-banner">This workspace runs locally. YouTube Music uses YouTube playlists and music videos; only music videos may appear in YouTube Music.</div>}
      {notice && <div className="notice" role="status">{notice}</div>}
      {error && <div className="error" role="alert">{error}</div>}
      <div className="stepper" aria-label="Transfer progress">
        {['Connect', 'Choose', 'Preview', 'Review', 'Transfer'].map((name, index) =>
          <div key={name} className={`step ${step >= index + 1 ? 'active' : ''}`}>
            <b>{String(index + 1).padStart(2, '0')}</b><span>{name}</span>
          </div>)}
      </div>
      <section className="panel">
        <div className="panel-heading"><div><p className="eyebrow">01 / YOUR SERVICES</p><h2>Connected platforms</h2></div><span className="panel-note">Choose a source below</span></div>
        <div className="provider-grid">
          {platforms.map(item => <div key={item.id} className="provider-card">
            <span className={`provider-mark ${item.color}`}>{item.mark}</span>
            <div><strong>{item.name}</strong><small>{connectedIds.has(item.id) ? isDemo ? 'Connected for demo' : 'Connected' : 'Not connected'}</small></div>
            {!connectedIds.has(item.id) && <button className="text-button" onClick={() => connect(item.id)} disabled={loading}>Connect</button>}
            {connectedIds.has(item.id) && <span className="connected-dot" aria-label="Connected" />}
          </div>)}
        </div>
      </section>
      <div className="work-grid">
        <section className="panel">
          <div className="panel-heading"><div><p className="eyebrow">02 / SOURCE</p><h2>Pick a playlist</h2></div><button className="text-button" onClick={refresh} disabled={!source || loading}>Refresh</button></div>
          <div className="tabs" role="group" aria-label="Source platform">
            {platforms.filter(item => connectedIds.has(item.id)).map(item =>
              <button key={item.id} className={source === item.id ? 'selected' : ''} onClick={() => changeSelection(() => { setSource(item.id); setPlaylistId(null); setDestination(null); })}>{item.name}</button>)}
          </div>
          <div className="playlist-list">
            {!source && <p className="empty">Select a connected service to see its playlists.</p>}
            {source && loading && !playlists[source] && <p className="empty">Loading playlists…</p>}
            {source && playlistErrors[source] && <p className="error" role="alert">{label(source)} playlists: {playlistErrors[source]} <button className="text-button" onClick={refresh}>Try again</button></p>}
            {source && !loading && playlists[source]?.length === 0 && <p className="empty">No playlists found. Try refreshing this service.</p>}
            {(playlists[source] || []).map(item =>
              <label className={`playlist-row ${playlistId === item.id ? 'selected' : ''}`} key={item.id}>
                <input type="radio" name="playlist" checked={playlistId === item.id} onChange={() => changeSelection(() => setPlaylistId(item.id))} />
                <span className="playlist-art">♫</span>
                <span><strong>{item.name}</strong><small>{item.count} tracks · {item.creator}</small></span>
              </label>)}
          </div>
        </section>
        <section className="panel destination-panel">
          <div className="panel-heading"><div><p className="eyebrow">03 / DESTINATION</p><h2>Where should it go?</h2></div></div>
          <div className="destination-list">
            {platforms.filter(item => item.id !== source && connectedIds.has(item.id)).map(item =>
              <button key={item.id} className={`destination-row ${destination === item.id ? 'selected' : ''}`} onClick={() => changeSelection(() => setDestination(item.id))}>
                <span className={`provider-mark ${item.color}`}>{item.mark}</span>
                <span><strong>{item.name}</strong><small>New private playlist</small></span><span className="choice-ring" />
              </button>)}
            {!source && <p className="empty">Choose a source first.</p>}
          </div>
          <div className="summary-box"><span>TRANSFER SUMMARY</span><strong>{selected?.name || 'Your playlist'} → {destination ? label(destination) : 'Destination'}</strong><small>New private playlist · Existing playlists stay untouched</small>{destination === 'YOUTUBE_MUSIC' && selected && <small>{selected.count} searches estimated. YouTube projects commonly allow 100 searches per day; a paused transfer can be retried later.</small>}</div>
          {!job && <button className="primary-button" onClick={begin} disabled={!selected || !destination || loading}>{loading ? 'Preparing…' : 'Preview matches'} <span>↗</span></button>}
        </section>
      </div>
      {job && <section className="panel transfer-panel">
        <div className="panel-heading"><div><p className="eyebrow">04 / TRANSFER</p><h2>{job.status === 'ready' ? 'Review matches' : job.status === 'completed' ? 'Transfer complete' : job.status === 'matching' ? 'Finding matches…' : job.status === 'running' ? 'Building your playlist…' : 'Transfer needs attention'}</h2></div><span className="panel-note">{job.items?.length || 0} source tracks</span></div>
        {job.status === 'ready' && <>
          <p className="help-text">Strong matches are selected. Check uncertain tracks, choose an alternative, or skip them. Nothing is created until you confirm.</p>
          <div className="match-list">{job.items.map((item, index) =>
            <div className="match-row" key={index}>
              <span><strong>{item.source.title}</strong><small>{item.source.artist || 'Artist unavailable'}</small></span>
              <select aria-label={`Match for ${item.source.title}`} value={choices[index] || ''} onChange={event => setChoices(previous => previous.map((choice, position) => position === index ? event.target.value || null : choice))}>
                <option value="">Skip this track</option>
                {item.candidates.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.title} — {candidate.artist}</option>)}
              </select>
            </div>)}</div>
          <button className="primary-button" onClick={confirm} disabled={!choices.some(Boolean)}>Create private playlist <span>↗</span></button>
        </>}
        {job.status !== 'ready' && <>
          <p className="help-text">{done} of {job.items?.filter(item => item.selectedId).length || 0} selected tracks added. {job.error && `Reason: ${job.error}`}</p>
          <div className="progress-track"><div style={{ width: `${job.items?.length ? done / job.items.length * 100 : 0}%` }} /></div>
          {job.status === 'completed' && <button className="secondary-button" onClick={reset}>Start another transfer</button>}
          {['paused', 'failed'].includes(job.status) && <button className="primary-button" onClick={retry}>Retry {job.stage === 'writing' ? 'remaining tracks' : 'matching'}</button>}
        </>}
      </section>}
      <footer className="footer">SoundBridge <span>·</span> Playlists have a new way home.</footer>
    </main>
  </div>;
}
