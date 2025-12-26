/**
 * SafeHTML Component
 * Renders HTML content safely using DOMPurify
 */

import React from 'react';
import DOMPurify from 'dompurify';

// Configure DOMPurify
const purifyConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a',
    'blockquote', 'pre', 'code',
    'hr',
    'span',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  ADD_ATTR: ['target'], // Allow target attribute
};

// Force all links to open in new tab
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Safely render HTML content
 * @param {string} html - The HTML content to render
 * @param {string} className - CSS class names
 * @param {boolean} truncate - If true, truncates to 2 lines
 */
export default function SafeHTML({ html, className = '', truncate = false }) {
  if (!html) {
    return null;
  }

  // Sanitize the HTML
  const cleanHTML = DOMPurify.sanitize(html, purifyConfig);

  // Base styles for rendered content
  const baseStyles = `
    prose prose-sm max-w-none
    prose-p:my-2 prose-p:leading-relaxed
    prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
    prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
    prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
    ${truncate ? 'line-clamp-2' : ''}
    ${className}
  `;

  return (
    <div
      className={baseStyles}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
}

/**
 * Get plain text from HTML (for SEO, previews, etc.)
 */
export function getPlainText(html) {
  if (!html) return '';
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  return clean.trim();
}
