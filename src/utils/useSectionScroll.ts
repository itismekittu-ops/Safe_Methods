import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Returns a handler that scrolls to a section on the homepage.
 * If the user is on another route, it first navigates home, then scrolls.
 * Pass `"top"` to scroll to the very top of the homepage.
 */
export function useSectionScroll() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    const doScroll = () => {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      // Allow the homepage to mount before scrolling.
      setTimeout(doScroll, 120);
    } else {
      doScroll();
    }
  };

  return scrollToSection;
}