import { useState, useEffect, useCallback } from 'react';

export interface Route {
  type: 'landing' | 'course' | 'lesson';
  course?: string;
  module?: string;
  slug?: string;
  anchor?: string;
}

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');

  if (!path) {
    return { type: 'landing' };
  }

  // Parse anchor from path (format: path::anchor)
  const [pathPart, rawAnchor] = path.split('::');
  // Decode URL-encoded anchor (e.g., %D1%88%D1%96%D1%81%D1%82%D1%8C -> шість)
  const anchor = rawAnchor ? decodeURIComponent(rawAnchor) : undefined;
  const parts = pathPart.split('/').filter(Boolean);

  if (parts.length === 0) {
    return { type: 'landing' };
  }

  // #/course-slug
  if (parts.length === 1) {
    return { type: 'course', course: parts[0] };
  }

  // #/course-slug/module-slug/lesson-slug or #/course-slug/module-slug/lesson-slug::anchor
  if (parts.length >= 3) {
    return {
      type: 'lesson',
      course: parts[0],
      module: parts[1],
      slug: parts[2],
      anchor,
    };
  }

  // #/course-slug/something - treat as course
  return { type: 'course', course: parts[0] };
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

  const goToLanding = useCallback(() => {
    window.location.hash = '#/';
  }, []);

  const goToCourse = useCallback((courseSlug: string) => {
    window.location.hash = `#/${courseSlug}`;
  }, []);

  const goToLesson = useCallback((course: string, module: string, slug: string, anchor?: string) => {
    const base = `#/${course}/${module}/${slug}`;
    window.location.hash = anchor ? `${base}::${anchor}` : base;
  }, []);

  const scrollToAnchor = useCallback((anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    route,
    goToLanding,
    goToCourse,
    goToLesson,
    scrollToAnchor,
  };
}
