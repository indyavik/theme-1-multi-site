'use client';

import React, { useState } from 'react';
import { usePreviewContext, SectionPicker } from '@/theme/core/preview-context';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface EditableSectionProps {
  sectionId: string;
  sectionType: string;
  path: string;
  className?: string;
  children: React.ReactNode;
  sectionIndex: number;
  canRemove?: boolean;
  canAddBefore?: boolean;
  canAddAfter?: boolean;
}

export function EditableSection({ 
  sectionId,
  sectionType,
  path,
  className = '',
  children,
  sectionIndex,
  canRemove = true,
  canAddBefore = true,
  canAddAfter = true
}: EditableSectionProps) {
  const { isPreviewMode, addSection, removeSection, moveSection } = usePreviewContext();
  const [showControls, setShowControls] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<'before' | 'after' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | null>(null);

  // If not in preview mode, render normally
  if (!isPreviewMode) {
    return <div className={className}>{children}</div>;
  }

  const handleRemove = () => {
    removeSection(sectionId);
    setShowRemoveConfirm(false);
  };

  const handleAddBefore = () => {
    setPendingPosition('before');
    setShowSectionPicker(true);
  };

  const handleAddAfter = () => {
    setPendingPosition('after');
    setShowSectionPicker(true);
  };

  const handleSelectSection = (sectionType: string) => {
    if (pendingPosition === 'before') {
      addSection(sectionType, 'main', sectionIndex);
    } else if (pendingPosition === 'after') {
      addSection(sectionType, 'main', sectionIndex + 1);
    }
    setShowSectionPicker(false);
    setPendingPosition(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverPosition(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Determine if we're in the top or bottom half of the section
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'before' : 'after';
    setDragOverPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the section entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX < rect.left || 
      clientX > rect.right || 
      clientY < rect.top || 
      clientY > rect.bottom
    ) {
      setDragOverPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedSectionId = e.dataTransfer.getData('text/plain');
    
    if (draggedSectionId === sectionId) {
      setDragOverPosition(null);
      return; // Can't drop on itself
    }

    const newPosition = dragOverPosition === 'before' ? sectionIndex : sectionIndex + 1;
    moveSection(draggedSectionId, newPosition);
    setDragOverPosition(null);
  };

  return (
    <div 
      id={`section-${sectionId}`}
      className={`group relative ${className} ${isDragging ? 'opacity-50' : ''} ${
        dragOverPosition === 'before' ? 'border-t-4 border-blue-500' : ''
      } ${dragOverPosition === 'after' ? 'border-b-4 border-blue-500' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable={isPreviewMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Add Section Button - Before */}
      {showControls && canAddBefore && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            size="sm"
            variant="outline"
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md border-blue-300 text-blue-600 hover:bg-blue-50"
            onClick={handleAddBefore}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Above
          </Button>
        </div>
      )}
      
      {/* Visual indicator for where section will be added - Before */}
      {showControls && canAddBefore && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Section Controls Overlay */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          {canRemove && (
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow-md"
              onClick={() => setShowRemoveConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="bg-white shadow-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Section Content */}
      <div className="relative">
        {/* Drop zone indicator - before */}
      {dragOverPosition === 'before' && (
        <div className="absolute -top-1 left-0 right-0 h-2 bg-blue-500/20 rounded-full z-20" />
      )}
      
      {children}
      
      {/* Drop zone indicator - after */}
      {dragOverPosition === 'after' && (
        <div className="absolute -bottom-1 left-0 right-0 h-2 bg-blue-500/20 rounded-full z-20" />
      )}
        
        {/* Hover Overlay */}
        {showControls && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-300 bg-blue-50/20 pointer-events-none" />
        )}
      </div>

      {/* Add Section Button - After */}
      {showControls && canAddAfter && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            size="sm"
            variant="outline"
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md border-blue-300 text-blue-600 hover:bg-blue-50"
            onClick={handleAddAfter}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Below
          </Button>
        </div>
      )}
      
      {/* Visual indicator for where section will be added - After */}
      {showControls && canAddAfter && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Remove Confirmation Dialog */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Remove Section</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove the {sectionType} section? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRemoveConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemove}
              >
                Remove Section
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Section Picker Modal */}
      <SectionPicker 
        isOpen={showSectionPicker}
        onClose={() => {
          setShowSectionPicker(false);
          setPendingPosition(null);
        }}
        onSelect={handleSelectSection}
      />
    </div>
  );
}
