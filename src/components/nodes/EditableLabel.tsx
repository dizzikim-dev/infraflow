'use client';

import { useState, useRef, useEffect, memo, useCallback } from 'react';

interface EditableLabelProps {
  value: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  className?: string;
  placeholder?: string;
  maxLength?: number;
}

/**
 * Inline editable text component
 * Double-click to edit, Enter to save, Escape to cancel
 */
export const EditableLabel = memo(function EditableLabel({
  value,
  isEditing,
  onStartEdit,
  onCommit,
  onCancel,
  className = '',
  placeholder = '',
  maxLength = 50,
}: EditableLabelProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset edit value when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus and select input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent React Flow keyboard shortcuts

    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = editValue.trim();
      if (trimmedValue && trimmedValue !== value) {
        onCommit(trimmedValue);
      } else if (!trimmedValue) {
        // Revert to original if empty
        setEditValue(value);
        onCancel();
      } else {
        // No change
        onCancel();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditValue(value); // Reset to original
      onCancel();
    }
  }, [editValue, value, onCommit, onCancel]);

  const handleBlur = useCallback(() => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== value) {
      onCommit(trimmedValue);
    } else {
      setEditValue(value); // Reset if empty or unchanged
      onCancel();
    }
  }, [editValue, value, onCommit, onCancel]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection
    e.preventDefault();
    onStartEdit();
  }, [onStartEdit]);

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection when clicking input
  }, []);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onClick={handleInputClick}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`
          bg-zinc-800
          border border-blue-500
          rounded px-1
          outline-none
          text-white
          w-full
          ${className}
        `}
        style={{ minWidth: '60px' }}
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      className={`
        cursor-text
        hover:bg-zinc-700/50
        rounded px-0.5 -mx-0.5
        transition-colors duration-150
        ${className}
      `}
      title="더블클릭하여 편집"
    >
      {value || placeholder}
    </span>
  );
});

export default EditableLabel;
