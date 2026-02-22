'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, X, Save } from 'lucide-react';
import Link from 'next/link';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="
              relative w-[400px] max-w-[90vw]
              bg-zinc-900/95 backdrop-blur-xl
              border border-zinc-700/50
              rounded-2xl shadow-2xl shadow-black/40
              p-6
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="
                w-12 h-12 rounded-xl
                bg-gradient-to-br from-blue-500 to-indigo-600
                flex items-center justify-center
                shadow-lg shadow-blue-500/20
              ">
                <Save className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Title & Description */}
            <h2 className="text-lg font-bold text-white text-center mb-2">
              다이어그램을 저장하시겠어요?
            </h2>
            <p className="text-sm text-zinc-400 text-center mb-6">
              로그인하면 다이어그램이 자동 저장되고,<br />
              언제든 다시 불러올 수 있습니다.
            </p>

            {/* Buttons */}
            <div className="space-y-2.5">
              <Link
                href="/auth/login?callbackUrl=/"
                className="
                  w-full flex items-center justify-center gap-2
                  py-2.5 px-4 rounded-xl
                  bg-blue-600 hover:bg-blue-700
                  text-white font-medium text-sm
                  transition-colors
                "
              >
                <LogIn className="w-4 h-4" />
                로그인
              </Link>

              <Link
                href="/auth/register?callbackUrl=/"
                className="
                  w-full flex items-center justify-center gap-2
                  py-2.5 px-4 rounded-xl
                  bg-zinc-800 hover:bg-zinc-700
                  text-zinc-200 font-medium text-sm
                  border border-zinc-700/50
                  transition-colors
                "
              >
                <UserPlus className="w-4 h-4" />
                회원가입
              </Link>

              <button
                onClick={onClose}
                className="
                  w-full py-2 px-4 rounded-xl
                  text-zinc-500 hover:text-zinc-300 text-sm
                  transition-colors
                "
              >
                나중에
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
