import { useState, useEffect, useCallback } from 'react';

export interface Route {
  type: 'landing' | 'course' | 'lesson';
  course?: string;
  module?: string;
  slug?: string;
}

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');

  if (!path) {
    return { type: 'landing' };
  }

  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) {
    return { type: 'landing' };
  }

  // #/course-slug
  if (parts.length === 1) {
    return { type: 'course', course: parts[0] };
  }

  // #/course-slug/module-slug/lesson-slug
  if (parts.length >= 3) {
    return {
      type: 'lesson',
      course: parts[0],
      module: parts[1],
      slug: parts[2],
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

  const goToLesson = useCallback((course: string, module: string, slug: string) => {
    window.location.hash = `#/${course}/${module}/${slug}`;
  }, []);

  return {
    route,
    goToLanding,
    goToCourse,
    goToLesson,
  };
}
