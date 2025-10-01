import { useCallback, useMemo, useState } from 'react';

export type ViewMode = 'todayOrPlaying' | 'playingOrLast7Days';

interface UseOptimizedViewModeProps {
  currentViewMode: ViewMode;
  loading: boolean;
  onViewModeChange: (mode: ViewMode) => void;
}

export function useOptimizedViewMode({
  currentViewMode,
  loading,
  onViewModeChange
}: UseOptimizedViewModeProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleViewModeChange = useCallback(async (newMode: ViewMode) => {
    if (newMode === currentViewMode || isTransitioning) {
      return; // Prevent unnecessary calls and double-clicks
    }

    setIsTransitioning(true);
    
    try {
      // Add slight delay to prevent rapid clicking
      await new Promise(resolve => setTimeout(resolve, 100));
      onViewModeChange(newMode);
    } finally {
      // Reset transitioning state after a short delay
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentViewMode, isTransitioning, onViewModeChange]);

  const buttonProps = useMemo(() => ({
    todayOrPlaying: {
      variant: (currentViewMode === 'todayOrPlaying' ? 'contained' : 'outlined') as 'contained' | 'outlined',
      disabled: loading || isTransitioning,
      text: loading && currentViewMode === 'todayOrPlaying' ? 'Đang tải...' : 'Hôm nay + Đang chơi',
      onClick: () => handleViewModeChange('todayOrPlaying')
    },
    playingOrLast7Days: {
      variant: (currentViewMode === 'playingOrLast7Days' ? 'contained' : 'outlined') as 'contained' | 'outlined',
      disabled: loading || isTransitioning,
      text: loading && currentViewMode === 'playingOrLast7Days' ? 'Đang tải...' : 'Đang chơi + 7 ngày qua',
      onClick: () => handleViewModeChange('playingOrLast7Days')
    }
  }), [currentViewMode, loading, isTransitioning, handleViewModeChange]);

  const commonButtonSx = useMemo(() => ({
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover:not(:disabled)': {
      transform: 'translateY(-1px)',
      boxShadow: 2
    },
    '&:active:not(:disabled)': {
      transform: 'translateY(0)',
      boxShadow: 1
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  }), []);

  return {
    buttonProps,
    commonButtonSx,
    isTransitioning
  };
}