'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackRatingProps {
  /** Whether to show the rating widget */
  show: boolean;
  /** Called when user submits a rating */
  onRate: (rating: number) => void;
  /** Called when user dismisses without rating */
  onDismiss: () => void;
  /** Whether the rating was already submitted */
  submitted: boolean;
  /** Delay before showing the widget (ms) */
  showDelay?: number;
  /** Auto-hide timeout (ms) */
  autoHideTimeout?: number;
}

const SHOW_DELAY = 3000;
const AUTO_HIDE_TIMEOUT = 30000;
const THANK_YOU_DURATION = 1500;

export function FeedbackRating({
  show,
  onRate,
  onDismiss,
  submitted,
  showDelay = SHOW_DELAY,
  autoHideTimeout = AUTO_HIDE_TIMEOUT,
}: FeedbackRatingProps) {
  const [visible, setVisible] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Show after delay
  useEffect(() => {
    if (show && !submitted) {
      showTimerRef.current = setTimeout(() => {
        setVisible(true);
      }, showDelay);
    } else if (!show) {
      setVisible(false);
      setHoveredStar(0);
      setSelectedStar(0);
      setShowThankYou(false);
    }

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [show, submitted, showDelay]);

  // Auto-hide after timeout
  useEffect(() => {
    if (visible && !submitted) {
      autoHideTimerRef.current = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, autoHideTimeout);
    }

    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, [visible, submitted, autoHideTimeout, onDismiss]);

  // Show thank you message after submission
  useEffect(() => {
    if (submitted && visible) {
      setShowThankYou(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setShowThankYou(false);
      }, THANK_YOU_DURATION);
      return () => clearTimeout(timer);
    }
  }, [submitted, visible]);

  const handleStarClick = useCallback(
    (star: number) => {
      setSelectedStar(star);
      onRate(star);
    },
    [onRate]
  );

  const handleDismiss = useCallback(() => {
    setVisible(false);
    onDismiss();
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
          data-testid="feedback-rating"
        >
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4">
            {showThankYou ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-emerald-400 font-medium whitespace-nowrap"
              >
                감사합니다!
              </motion.span>
            ) : (
              <>
                <span className="text-sm text-zinc-400 whitespace-nowrap">
                  이 결과가 도움이 되었나요?
                </span>
                <div className="flex gap-1" role="radiogroup" aria-label="평점">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`${star}점`}
                      role="radio"
                      aria-checked={selectedStar === star}
                    >
                      <svg
                        className={`w-5 h-5 transition-colors ${
                          star <= (hoveredStar || selectedStar)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-zinc-600 fill-transparent'
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="닫기"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
