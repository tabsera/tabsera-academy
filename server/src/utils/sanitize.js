/**
 * HTML Sanitization Utility
 * Cleans HTML content to prevent XSS attacks
 */

const sanitizeHtml = require('sanitize-html');

// Configuration for allowed HTML elements and attributes
const sanitizeConfig = {
  allowedTags: [
    // Text formatting
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists
    'ul', 'ol', 'li',
    // Links
    'a',
    // Block elements
    'blockquote', 'pre', 'code',
    // Line break
    'hr',
    // Spans for styling
    'span',
  ],
  allowedAttributes: {
    'a': ['href', 'target', 'rel'],
    'span': ['class', 'style'],
    '*': ['class'],
  },
  allowedStyles: {
    '*': {
      'color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(\d+,\s*\d+,\s*\d+\)$/],
      'background-color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(\d+,\s*\d+,\s*\d+\)$/],
      'text-align': [/^(left|right|center|justify)$/],
    },
  },
  // Force all links to open in new tab with security attributes
  transformTags: {
    'a': (tagName, attribs) => {
      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      };
    },
  },
  // Remove empty tags
  exclusiveFilter: (frame) => {
    return !frame.text.trim() && !['br', 'hr'].includes(frame.tag);
  },
};

/**
 * Sanitize HTML content for safe storage and display
 * @param {string} html - The HTML content to sanitize
 * @returns {string} - Sanitized HTML
 */
const sanitizeDescription = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return sanitizeHtml(html, sanitizeConfig);
};

/**
 * Strip all HTML tags, returning plain text
 * @param {string} html - The HTML content
 * @returns {string} - Plain text without HTML tags
 */
const stripHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

module.exports = {
  sanitizeDescription,
  stripHtml,
  sanitizeConfig,
};
