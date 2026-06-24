import React from 'react';

const Loader = ({ full = false, size = 'md' }) => {
  const dimensions = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';

  const spinner = (
    <div
      className={`${dimensions} animate-spin rounded-full border-4 border-primary-200 border-t-primary-600`}
      role="status"
      aria-label="Loading"
    />
  );

  if (!full) return spinner;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">{spinner}</div>
  );
};

export default Loader;
