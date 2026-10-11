import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every route change immediately resets the viewport scroll position to the top
 * across both the browser window and any nested layout containers.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If navigating with an anchor hash (e.g. #section), smoothly scroll to that element
    if (hash) {
      const targetElement = document.getElementById(hash.replace('#', ''));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Instantly reset window scroll position
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });

    // Reset document element and body scroll
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }

    // Check parent layout containers (<main>, #root) in case any have their own scroll offsets
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
      mainContainer.scrollLeft = 0;
    }

    const rootContainer = document.getElementById('root');
    if (rootContainer) {
      rootContainer.scrollTop = 0;
      rootContainer.scrollLeft = 0;
    }
  }, [pathname, search]);

  return null;
};
