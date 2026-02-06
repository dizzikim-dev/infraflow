'use client';

import { motion } from 'framer-motion';
import { useAnimation } from '@/hooks/useAnimation';
import { AnimationSequence } from '@/types';

interface AnimationControlPanelProps {
  sequence: AnimationSequence | null;
  onClose?: () => void;
}

const speedOptions = [0.5, 1, 1.5, 2];

export function AnimationControlPanel({
  sequence,
  onClose,
}: AnimationControlPanelProps) {
  const {
    isPlaying,
    currentStepIndex,
    speed,
    play,
    pause,
    stop,
    togglePlay,
    setSpeed,
    nextStep,
    prevStep,
    loadSequence,
  } = useAnimation();

  const handlePlay = () => {
    if (sequence && currentStepIndex < 0) {
      loadSequence(sequence);
    }
    togglePlay();
  };

  const totalSteps = sequence?.steps.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-24 left-1/2 -translate-x-1/2"
    >
      <div className="bg-zinc-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-zinc-700 p-4">
        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎬</span>
            <span className="text-white font-medium text-sm">
              {sequence?.name || 'Animation'}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Step {Math.max(0, currentStepIndex + 1)}</span>
            <span>/ {totalSteps}</span>
          </div>
          <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{
                width: totalSteps > 0
                  ? `${((currentStepIndex + 1) / totalSteps) * 100}%`
                  : '0%',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          {/* Previous */}
          <button
            onClick={prevStep}
            disabled={currentStepIndex <= 0}
            className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous Step"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlay}
            disabled={!sequence}
            className={`
              p-3 rounded-full transition-all
              ${isPlaying
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-blue-500 hover:bg-blue-600'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Stop */}
          <button
            onClick={stop}
            disabled={currentStepIndex < 0}
            className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Stop"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={nextStep}
            disabled={currentStepIndex >= totalSteps - 1}
            className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next Step"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* Speed Control */}
        <div className="mt-3 flex items-center justify-center gap-1">
          <span className="text-xs text-zinc-500 mr-2">Speed:</span>
          {speedOptions.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`
                px-2 py-1 text-xs rounded transition-colors
                ${speed === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600 hover:text-white'
                }
              `}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Current Step Info */}
        {sequence && currentStepIndex >= 0 && currentStepIndex < sequence.steps.length && (
          <div className="mt-3 text-center">
            <div className="text-xs text-zinc-400">
              {sequence.steps[currentStepIndex].from} → {sequence.steps[currentStepIndex].to}
            </div>
            {sequence.steps[currentStepIndex].label && (
              <div className="text-xs text-blue-400 mt-1">
                {sequence.steps[currentStepIndex].label}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
