import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../utils/analytics';

const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Timeout allows document.title to update prior to sending page_view event
    const timer = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
};

export default RouteTracker;
