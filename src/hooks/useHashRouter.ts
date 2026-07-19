import { useState, useEffect, useCallback } from 'react';
import type { Language } from '@/types/content';

export interface Route {
  type: 'roadmap' | 'lesson';
  lang: Language;
  course?: string;
  module?: string;
  slug?: string;
}

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');

  if (!path) {
    return { type: 'roadmap', lang: 'uk' };
  }

  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) {
    return { type: 'roadmap', lang: 'uk' };
  }

  const lang = (parts[0] === 'en' ? 'en' : 'uk') as Language;

  if (parts.length === 1) {
    return { type: 'roadmap', lang };
  }

  if (parts.length >= 4) {
    return {
      type: 'lesson',
      lang,
      course: parts[1],
      module: parts[2],
      slug: parts[3],
    };
  }

  return { type: 'roadmap', lang };
}

export function useHashRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((newRoute: Route) => {
    let hash = `#/${newRoute.lang}`;

    if (newRoute.type === 'lesson' && newRoute.course && newRoute.module && newRoute.slug) {
      hash = `#/${newRoute.lang}/${newRoute.course}/${newRoute.module}/${newRoute.slug}`;
    }

    window.location.hash = hash;
  }, []);

  const goToRoadmap = useCallback((lang?: Language) => {
    navigate({ type: 'roadmap', lang: lang || route.lang });
  }, [navigate, route.lang]);

  const goToLesson = useCallback((course: string, module: string, slug: string, lang?: Language) => {
    navigate({
      type: 'lesson',
      lang: lang || route.lang,
      course,
      module,
      slug,
    });
  }, [navigate, route.lang]);

  const updateLanguage = useCallback((newLang: Language) => {
    if (route.type === 'lesson') {
      navigate({ ...route, lang: newLang });
    } else {
      navigate({ type: 'roadmap', lang: newLang });
    }
  }, [navigate, route]);

  return {
    route,
    navigate,
    goToRoadmap,
    goToLesson,
    updateLanguage,
  };
}
