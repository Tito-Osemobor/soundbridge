import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Workspace from './Workspace';
import { api } from '@/features/shared/api';

vi.mock('next/link', () => ({ default: ({ children, href, ...rest }) => <a href={href} {...rest}>{children}</a> }));
vi.mock('@/features/shared/api', () => ({ api: vi.fn() }));
afterEach(() => { cleanup(); window.localStorage.clear(); vi.clearAllMocks(); });

test('demo guides both provider directions through review and completion', async () => {
  const user = userEvent.setup();
  render(<Workspace mode="demo" />);
  await screen.findAllByText('Connected for demo');
  await user.click(screen.getByRole('button', { name: 'Spotify' }));
  await screen.findByText('Late Night Drive');
  await user.click(screen.getByText('Late Night Drive'));
  await user.click(screen.getByRole('button', { name: /YouTube Music New private playlist/i }));
  await user.click(screen.getByRole('button', { name: /Preview matches/i }));
  await screen.findByText('Review matches', {}, { timeout: 3000 });
  expect(screen.getByLabelText('Match for Pink + White').value).toBe('');
  await user.selectOptions(screen.getByLabelText('Match for Pink + White'), 'match-1');
  await user.click(screen.getByRole('button', { name: /Create private playlist/i }));
  await screen.findByText('Transfer complete', {}, { timeout: 3000 });
  await user.click(screen.getByRole('button', { name: /Start another transfer/i }));
  await user.click(screen.getByRole('button', { name: 'YouTube Music' }));
  await screen.findByText('Soundtrack to Summer');
  await user.click(screen.getByText('Soundtrack to Summer'));
  await user.click(screen.getByRole('button', { name: /Spotify New private playlist/i }));
  await user.click(screen.getByRole('button', { name: /Preview matches/i }));
  await screen.findByText('Review matches', {}, { timeout: 3000 });
});

test('cannot preview without a source playlist and destination', async () => {
  render(<Workspace mode="demo" />);
  await waitFor(() => expect(screen.getByRole('button', { name: /Preview matches/i }).disabled).toBe(true));
});

test('restores an in-progress real transfer after a page refresh', async () => {
  window.localStorage.setItem('soundbridge.activeTransfer', 'saved-job');
  api.mockImplementation(path => {
    if (path === '/api/connections') return Promise.resolve([
      { platform: 'SPOTIFY' }, { platform: 'YOUTUBE_MUSIC' },
    ]);
    if (path === '/api/transfers/saved-job') return Promise.resolve({
      id: 'saved-job', source: 'SPOTIFY', destination: 'YOUTUBE_MUSIC',
      sourcePlaylistId: 'playlist-1', sourceName: 'Saved songs', status: 'ready',
      items: [{ source: { title: 'Track one', artist: 'Artist' },
        candidates: [{ id: 'candidate-1', title: 'Track one', artist: 'Artist' }],
        selectedId: 'candidate-1', status: 'pending' }],
    });
    return Promise.resolve([]);
  });
  render(<Workspace mode="real" />);
  await screen.findByText('Review matches');
  expect(screen.getAllByText(/Saved songs/).length).toBeGreaterThan(0);
  expect(screen.getByLabelText('Match for Track one').value).toBe('candidate-1');
});
