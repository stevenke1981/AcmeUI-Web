import { afterEach, describe, expect, it, vi } from 'vitest';
import { activateModal } from '../src/index';

const cleanups: Array<() => void> = [];
afterEach(() => { cleanups.splice(0).forEach(fn => fn()); document.body.innerHTML = ''; });
function fixture() {
  document.body.innerHTML = '<button id="outside">Outside</button><div id="overlay"><section tabindex="-1"><button>First</button></section></div>';
  return document.querySelector<HTMLElement>('section')!;
}
describe('shared Modal lifecycle contract', () => {
  it.each(['nested', 'sibling'])('rejects a second %s activation without disturbing the first', location => {
    const panel = fixture(), close = vi.fn(); cleanups.push(activateModal(panel, close));
    const second = document.createElement('section'); second.tabIndex = -1;
    (location === 'nested' ? panel : document.body).append(second);
    expect(() => activateModal(second, vi.fn())).toThrow(/one open Modal/);
    expect(document.getElementById('outside')!.hasAttribute('inert')).toBe(true);
    document.getElementById('outside')!.focus(); expect(panel.contains(document.activeElement)).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); expect(close).toHaveBeenCalledTimes(1);
  });
  it('uses the panel fallback when there are no sequential controls and restores focus idempotently', () => {
    const panel = fixture(), opener = document.getElementById('outside')!; panel.innerHTML = ''; opener.focus();
    const release = activateModal(panel, vi.fn()); cleanups.push(release);
    expect(document.activeElement).toBe(panel); opener.focus(); expect(document.activeElement).toBe(panel);
    release(); release(); expect(document.activeElement).toBe(opener);
    expect(opener.hasAttribute('inert')).toBe(false);
    cleanups.push(activateModal(panel, vi.fn())); expect(document.activeElement).toBe(panel);
  });
  it('rejects a disconnected panel before any isolation or listener registration', () => {
    const panel = fixture(); panel.remove();
    expect(() => activateModal(panel, vi.fn())).toThrow(/connected/);
    expect(document.querySelector('[inert]')).toBeNull();
  });
  it('permits sequential activation of different panels after releasing the first', () => {
    const first = fixture(), second = document.createElement('section'); second.tabIndex = -1; document.body.append(second);
    const releaseFirst = activateModal(first, vi.fn()); cleanups.push(releaseFirst);
    expect(second.hasAttribute('inert')).toBe(true); releaseFirst();
    const releaseSecond = activateModal(second, vi.fn()); cleanups.push(releaseSecond);
    expect(second.hasAttribute('inert')).toBe(false); expect(document.activeElement).toBe(second);
    expect(document.getElementById('overlay')!.hasAttribute('inert')).toBe(true);
    releaseSecond(); expect(document.querySelector('[inert]')).toBeNull();
  });
  it('contains all effects in the owner document', () => {
    const frame = document.createElement('iframe'); document.body.append(frame);
    const doc = frame.contentDocument!;
    doc.body.innerHTML = '<button>Outside</button><section tabindex="-1"><input></section>';
    const panel = doc.querySelector('section')!, outside = doc.querySelector('button')!;
    outside.focus(); const close = vi.fn(), release = activateModal(panel, close); cleanups.push(release);
    expect(outside.hasAttribute('inert')).toBe(true); expect(frame.hasAttribute('inert')).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); expect(close).not.toHaveBeenCalled();
    doc.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); expect(close).toHaveBeenCalledTimes(1);
    release(); expect(outside.hasAttribute('inert')).toBe(false); expect(doc.activeElement).toBe(outside);
  });
});
