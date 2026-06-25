'use client';

import { useEffect } from 'react';

export default function BrewMapRuntime({ bodyClassName = '' }) {
  useEffect(() => {
    const classes = bodyClassName.split(' ').filter(Boolean);
    if (classes.length) document.body.classList.add(...classes);

    let cancelled = false;
    import('../../src/main.js').catch((error) => {
      if (!cancelled) console.error(`BrewMap runtime failed to start. ${error.message}`);
    });

    return () => {
      cancelled = true;
      if (classes.length) document.body.classList.remove(...classes);
    };
  }, [bodyClassName]);

  return null;
}
