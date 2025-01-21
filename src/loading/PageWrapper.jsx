import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Loader from './Loader';

const PageWrapper = ({ children }) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const { loadingStates } = useSelector(state => state.interiorBilling);
  const { loading: authLoading } = useSelector(state => state.auth);

  useEffect(() => {
    // Only show initial loading for 500ms
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Only show loader for initial page load and authentication
  // Don't block for data fetching operations
  const showLoader = initialLoading || authLoading;

  if (showLoader) {
    return <Loader />;
  }

  return (
    <div className="animate-fade-in">
      {children}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PageWrapper;