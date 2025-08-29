import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function toHtmlSafe(mdOrHtml) {
  if (!mdOrHtml) return '';
  const s = mdOrHtml.trim();
  const raw = s.startsWith('<') ? s : marked.parse(s);
  return DOMPurify.sanitize(raw);
}

