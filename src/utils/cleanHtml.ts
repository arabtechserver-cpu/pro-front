export const cleanHtmlToText = (html: string): string => {
  if (!html) return '';

  // 1. Replace <br>, <br/>, <br />, </p>, and </div> with newlines
  let text = html.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');

  // 2. Strip all remaining HTML tags
  text = text.replace(/<[^>]*>?/gm, '');

  // 3. Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');

  // 4. Trim excessive whitespace and newlines
  text = text.replace(/\n\s*\n/g, '\n\n').trim();

  return text;
};
