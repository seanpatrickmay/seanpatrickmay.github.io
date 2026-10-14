import { useEffect, useState } from 'react';

const STORAGE_KEY = 'motion-paused';
const CLASS_NAME = 'motion-paused';

function readStored() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function applyPaused(paused) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle(CLASS_NAME, paused);
}

export function useMotionPause() {
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const sync = () => {
      const current = document.documentElement.classList.contains(CLASS_NAME);
      setPaused(current);
    };
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        applyPaused(readStored());
        sync();
      }
    };
    applyPaused(readStored());
    sync();
    setMounted(true);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', onStorage);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setMotionPaused = (next) => {
    setPaused(next);
    applyPaused(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {}
  };

  return {
    mounted,
    paused,
    togglePaused: () => setMotionPaused(!document.documentElement.classList.contains(CLASS_NAME)),
  };
}
