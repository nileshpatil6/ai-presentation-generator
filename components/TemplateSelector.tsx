
import React from 'react';
import { Template } from '../types';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          disabled={disabled}
          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all focus:outline-none focus:ring-4
            ${selectedTemplateId === template.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex flex-col items-center">
            <div className={`w-16 h-12 rounded ${template.style.preview.bg} flex items-center justify-center p-1 gap-1`}>
              <div className={`w-1/3 h-3/4 ${template.style.preview.accent} rounded-sm`}></div>
              <div className="w-2/3 h-full flex flex-col gap-1">
                 <div className={`w-full h-1/4 ${template.style.preview.text} rounded-sm`}></div>
                 <div className={`w-3/4 h-1/4 ${template.style.preview.text} rounded-sm`}></div>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-center text-gray-700 dark:text-gray-300">{template.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;
