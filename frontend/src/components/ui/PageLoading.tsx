import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface PageLoadingProps {
  message: string;
}

/** Spinner centrado para la carga inicial de una página. */
export const PageLoading: React.FC<PageLoadingProps> = ({ message }) => (
  <div className="flex items-center justify-center py-24">
    <div className="flex flex-col items-center gap-3 text-neutral-400">
      <LoadingSpinner size="lg" />
      <p className="text-sm">{message}</p>
    </div>
  </div>
);
