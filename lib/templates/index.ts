import { Template, TemplateType } from '@/lib/types';
import { breakingNewsTemplate } from './breaking-news';
import { internationalTemplate } from './international';
import { minimalDarkTemplate } from './minimal-dark';
import { redAlertTemplate } from './red-alert';

export const templates: Record<TemplateType, Template> = {
  'breaking-news': breakingNewsTemplate,
  'international': internationalTemplate,
  'minimal-dark': minimalDarkTemplate,
  'red-alert': redAlertTemplate,
};

export function getTemplate(type: TemplateType): Template {
  return templates[type] || minimalDarkTemplate;
}

export function getTemplateList() {
  return Object.entries(templates).map(([key, value]) => ({
    id: key,
    name: value.name,
  }));
}
