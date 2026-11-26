// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import i18n from '../lib/i18n'; // ✅ Import i18n instance


i18n.changeLanguage('en');

afterEach(() => {
  cleanup();
});

// jsdom does not implement <dialog>.showModal()/close(); emulate just enough for our Modal component.
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal ||= function showModal(this: HTMLDialogElement) { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close ||= function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: { ...(globalThis.crypto ?? {}), randomUUID: () => `test-${Math.random().toString(16).slice(2)}-${Date.now()}` },
  });
}

// jsdom has no IntersectionObserver (used by motion's whileInView); treat everything as visible.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(el: Element) { this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    root = null; rootMargin = ''; thresholds = [];
  } as unknown as typeof IntersectionObserver;
}
