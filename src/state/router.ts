import { useEffect, useState } from 'react';

/** Tiny hash router: #/talk, #/drafts/abc. Works on static hosting. */
export function useRoute() {
  const get = () => (location.hash.replace(/^#/, '') || '/today').split('/').filter(Boolean);
  const [parts, setParts] = useState(get);
  useEffect(() => {
    const on = () => {
      setParts(get());
      window.scrollTo(0, 0);
    };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return parts;
}

export const go = (path: string) => {
  location.hash = path;
};
