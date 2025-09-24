/**
 * EDITABLE TEXT - In-Place Text Editing Component
 * 
 * Provides click-to-edit functionality for text content in preview mode.
 * Automatically switches between display and edit modes based on preview context.
 * 
 * Features:
 * - Click to edit in preview mode, static display in public mode
 * - Real-time validation based on field schema (maxLength, etc.)
 * - Support for multiline text with textarea
 * - Automatic saving on blur/enter
 * - Rich text support with dangerouslySetInnerHTML
 * 
 * Usage: Replace any <p>, <h1>, <span> etc. with <EditableText>
 * 
 * Example:
 * <EditableText 
 *   path="sections.hero.title" 
 *   value="Welcome to our site" 
 *   className="text-2xl font-bold" 
 * />
 */

'use client';

import React, { useEffect, useState } from 'react';
import { usePreviewContext } from '@/theme/core/preview-context';

interface EditableTextProps {
  path: string;           // "sections.hero.shortHeadline" or "site.brand"
  value: string;
  className?: string;
  children?: React.ReactNode;
  placeholder?: string;
}

export function EditableText({ 
  path, 
  value, 
  className = '', 
  children,
  placeholder
}: EditableTextProps) {
  try {
    const { 
      isPreviewMode, 
      updateField, 
      isFieldEditable, 
      getValue 
    } = usePreviewContext();
    
    // Get the current value (which might be edited)
    const currentValue = getValue(path) || value;
    const isEditable = isFieldEditable(path);
    
    // Safety check: ensure currentValue is a string
    const displayValue = typeof currentValue === 'string' ? currentValue : String(currentValue || '');
    
    // If not in preview mode or not editable, render normally
    if (!isPreviewMode || !isEditable) {
      return children || <span className={className}>{displayValue}</span>;
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      const newValue = e.target.innerText;
      if (newValue !== displayValue) {
        updateField(path, newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.currentTarget.innerText = displayValue;
        e.currentTarget.blur();
      }
    };
    
    // Preview mode with contentEditable
    const [isEmpty, setIsEmpty] = useState(displayValue === '');
    useEffect(() => {
      setIsEmpty(displayValue === '');
    }, [displayValue]);

    return (
      <div className="relative">
        {isEmpty && placeholder && (
          <span className="absolute inset-0 text-gray-400 pointer-events-none select-none">
            {placeholder}
          </span>
        )}
        <div
          contentEditable
          suppressContentEditableWarning
          className={`${className} hover:outline-2 hover:outline-dashed hover:outline-blue-300 focus:outline-2 focus:outline-solid focus:outline-blue-500 cursor-text`}
          onBlur={(e) => {
            const newValue = e.target.innerText;
            // If user didn't change and placeholder was visible, keep empty string
            if (placeholder && newValue === placeholder && displayValue === '') {
              updateField(path, '');
              return;
            }
            handleBlur(e);
          }}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            const txt = (e.currentTarget as HTMLDivElement).innerText;
            setIsEmpty(txt.trim().length === 0);
          }}
          style={{ minHeight: '1em' }}
        >
          {displayValue}
        </div>
      </div>
    );
    
  } catch (error) {
    // Fallback if preview context fails
    console.error('Preview context error:', error);
    return children || <span className={className}>{value}</span>;
  }
}

// Specialized component for CTA buttons
export function EditableCTA({ 
  path, 
  cta, 
  className = '',
  children 
}: {
  path: string;
  cta: { label: string; href: string };
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <EditableText 
        path={`${path}.label`}
        value={cta.label}
        className={className}
      />
      {children}
    </>
  );
}

// Specialized component for arrays (like services, testimonials)
export function EditableList({ 
  path, 
  items, 
  renderItem,
  className = ''
}: {
  path: string;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}) {
  const { isPreviewMode, addArrayItem, removeArrayItem, moveArrayItem, canAddArrayItem } = usePreviewContext();

  const canAdd = canAddArrayItem(path);
  
  // Defensive programming: ensure items is an array
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className={className}>
      {safeItems.map((item, index) => (
        <div key={index} className="group">
          {renderItem(item, index)}
          {isPreviewMode && (
            <div className="flex gap-2 justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => moveArrayItem(path, index, Math.max(0, index - 1))}
              >
                Move Up
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => moveArrayItem(path, index, Math.min(safeItems.length - 1, index + 1))}
              >
                Move Down
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                onClick={() => removeArrayItem(path, index)}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
      {isPreviewMode && (
        <div className="mt-3">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded ${canAdd ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            onClick={() => canAdd && addArrayItem(path)}
            disabled={!canAdd}
          >
            Add Item
          </button>
        </div>
      )}
    </div>
  );
} 