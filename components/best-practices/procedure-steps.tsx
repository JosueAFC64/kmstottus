'use client';

import React, { useState } from 'react';
import type { BestPracticeStep } from '@/types/best-practice';
import { Icon } from '@/components/ui';

interface ProcedureStepsProps {
  value: BestPracticeStep[];
  onChange: (steps: BestPracticeStep[]) => void;
  error?: string;
}

export function ProcedureSteps({ value, onChange, error }: ProcedureStepsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addStep = () => {
    const newStep: BestPracticeStep = {
      step: value.length + 1,
      title: '',
      description: '',
    };
    onChange([...value, newStep]);
  };

  const removeStep = (index: number) => {
    const newSteps = value.filter((_, i) => i !== index);
    // Renumerar pasos
    onChange(newSteps.map((step, i) => ({ ...step, step: i + 1 })));
  };

  const updateStep = (index: number, field: keyof BestPracticeStep, newValue: string) => {
    const newSteps = [...value];
    newSteps[index] = { ...newSteps[index], [field]: newValue };
    onChange(newSteps);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return;
    
    const newSteps = [...value];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    // Renumerar pasos
    onChange(newSteps.map((step, i) => ({ ...step, step: i + 1 })));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveStep(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[#495057]">
          Procedimiento Recomendado
        </label>
        <span className="text-xs text-[#868e96]">
          {value.length} paso{value.length !== 1 ? 's' : ''}
        </span>
      </div>

      {value.length === 0 ? (
        <div className="border-2 border-dashed border-[#dee2e6] rounded-lg p-6 text-center">
          <Icon.Document className="w-8 h-8 text-[#adb5bd] mx-auto mb-2" />
          <p className="text-sm text-[#868e96] mb-3">No hay pasos registrados</p>
          <button
            type="button"
            onClick={addStep}
            className="px-4 py-2 bg-[#1a472a] text-white rounded-lg hover:bg-[#0f2d1a] transition-colors text-sm"
          >
            Agregar primer paso
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((step, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white border rounded-lg p-4 transition-all ${
                draggedIndex === index
                  ? 'border-[#1a472a] bg-[#f8f9fa] opacity-50'
                  : 'border-[#dee2e6] hover:border-[#1a472a]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Drag handle y número */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveStep(index, index - 1)}
                    disabled={index === 0}
                    className="p-1 text-[#868e96] hover:text-[#495057] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover arriba"
                  >
                    <Icon.ChevronLeft className="w-4 h-4 rotate-90" />
                  </button>
                  <div className="w-8 h-8 bg-[#1a472a] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <span className="text-white text-sm font-semibold">{step.step}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => moveStep(index, index + 1)}
                    disabled={index === value.length - 1}
                    className="p-1 text-[#868e96] hover:text-[#495057] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover abajo"
                  >
                    <Icon.ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>

                {/* Campos del paso */}
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    placeholder={`Paso ${step.step}: Título`}
                    className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a] focus:border-transparent text-sm font-medium"
                  />
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    placeholder={`Descripción detallada del paso ${step.step}`}
                    rows={2}
                    className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a] focus:border-transparent text-sm resize-none"
                  />
                </div>

                {/* Botón eliminar */}
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="p-2 text-[#868e96] hover:text-[#dc3545] hover:bg-[#f8d7da] rounded-lg transition-colors"
                  title="Eliminar paso"
                >
                  <Icon.Trash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Botón agregar */}
          <button
            type="button"
            onClick={addStep}
            className="w-full py-3 border-2 border-dashed border-[#dee2e6] rounded-lg text-[#495057] hover:border-[#1a472a] hover:text-[#1a472a] transition-colors flex items-center justify-center gap-2"
          >
            <Icon.Plus className="w-5 h-5" />
            Agregar paso
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-[#dc3545]">{error}</p>
      )}
    </div>
  );
}
