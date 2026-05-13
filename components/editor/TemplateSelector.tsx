'use client';

import { Card } from '@/components/ui/card';
import { templates } from '@/lib/templates';
import { TemplateType } from '@/lib/types';

interface TemplateSelectorProps {
  selected: TemplateType;
  onChange: (template: TemplateType) => void;
}

export default function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  const templateList = (Object.entries(templates) as [TemplateType, any][]).map(
    ([key, template]) => ({
      id: key,
      name: template.name,
      colors: template.colors,
    })
  );

  return (
    <div className="space-y-2">
      {templateList.map((template) => (
        <Card
          key={template.id}
          className={`p-3 border-2 cursor-pointer transition ${
            selected === template.id
              ? 'border-primary bg-primary/10'
              : 'border-border bg-muted/30 hover:bg-muted/50'
          }`}
          onClick={() => onChange(template.id as TemplateType)}
        >
          {/* Color Preview */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: template.colors.primary }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: template.colors.accent }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: template.colors.background }}
              />
            </div>
            <p className="text-xs font-medium text-foreground">{template.name}</p>
          </div>

          {/* Template Preview */}
          <div
            className="w-full h-16 rounded-md overflow-hidden border border-border/50 flex items-center justify-center text-center p-2"
            style={{ backgroundColor: template.colors.background }}
          >
            <div>
              <p
                className="text-xs font-bold leading-tight"
                style={{ color: template.colors.text }}
              >
                Preview
              </p>
              <p
                className="text-xs"
                style={{ color: template.colors.accent }}
              >
                Template
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
