/**
 * Seedream Image Generation Service
 * Uses BytePlus ModelArk API for AI image generation
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

const MODELARK_API_KEY = process.env.MODELARK_API_KEY || '9b2ca95e-e649-4d61-b060-06e91e5fff60';
const MODELARK_BASE_URL = process.env.MODELARK_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3';
const SEEDREAM_MODEL = process.env.SEEDREAM_MODEL || 'seedream-4-5-251128';

// Islamic compliance guidelines
const COMPLIANCE_NOTES = `
IMPORTANT NOTES:
- TEXT Accuracy is top priority.
- IMAGE SHOULD HAVE EDUCATIONAL VALUE
- Image to be compliant to Islamic Values.
If prompt contains human images:
- SHOW MALES ONLY or FEMALES ONLY IN an IMAGE. DO NOT MIX.
- Use male student images mostly, unless prompt explicitly references female
- If any female figures are shown, they must wear full hijab covering hair completely.
- Do not mix male and female figures in the same image - show either all male students OR all female students, never both together.
`;

/**
 * Generate an image using Seedream API
 * @param {string} prompt - Image generation prompt
 * @param {object} options - Generation options
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
async function generateImage(prompt, options = {}) {
  try {
    const {
      aspectRatio = '16:9',
      size = '2K',
      outputFormat = 'png',
      outputQuality = 90,
    } = options;

    // Add compliance notes to prompt
    const fullPrompt = `${prompt}\n${COMPLIANCE_NOTES}`;

    console.log('Generating image with prompt:', prompt.substring(0, 100) + '...');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MODELARK_API_KEY}`,
    };

    const payload = {
      model: SEEDREAM_MODEL,
      prompt: fullPrompt,
      num_outputs: 1,
      aspect_ratio: aspectRatio,
      size: size,
      output_format: outputFormat,
      output_quality: outputQuality,
      watermark: false,
    };

    const response = await axios.post(
      `${MODELARK_BASE_URL}/images/generations`,
      payload,
      {
        headers,
        timeout: 120000, // 2 minutes timeout
      }
    );

    const result = response.data;

    if (result.data && result.data.length > 0) {
      const imageUrl = result.data[0].url;
      if (imageUrl) {
        console.log('Image generated successfully');
        return { success: true, imageUrl };
      }
    }

    return { success: false, error: 'No image URL in response' };
  } catch (error) {
    console.error('Error generating image:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Generate a course cover image
 * @param {object} course - Course object with title, description, subject
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
async function generateCourseImage(course) {
  const subject = course.subject?.name || 'Education';
  const level = course.level || '';

  const prompt = `Create a professional, modern educational course cover image for "${course.title}".
Subject: ${subject}
${level ? `Level: ${level}` : ''}

Design requirements:
- Clean, professional design suitable for an online learning platform
- Educational theme with abstract or symbolic representation of the subject
- Modern gradient background with subtle patterns
- No text overlay (text will be added separately)
- High quality, visually appealing composition
- Colors should be vibrant but professional
- Include subtle visual elements related to ${subject} (books, icons, symbols)`;

  return generateImage(prompt, { aspectRatio: '16:9' });
}

/**
 * Generate a learning pack cover image
 * @param {object} pack - Learning pack object with title, description
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
async function generatePackImage(pack) {
  const prompt = `Create a professional, modern educational learning pack cover image for "${pack.title}".
${pack.description ? `Description: ${pack.description.substring(0, 200)}` : ''}

Design requirements:
- Premium, professional design for a course bundle/collection
- Multiple layered elements suggesting a comprehensive learning package
- Modern gradient background with elegant patterns
- No text overlay (text will be added separately)
- High quality, visually appealing composition
- Colors should convey premium quality and professionalism
- Include subtle visual elements suggesting multiple courses bundled together`;

  return generateImage(prompt, { aspectRatio: '16:9' });
}

/**
 * Generate image with custom prompt
 * @param {string} customPrompt - Custom prompt for image generation
 * @param {object} options - Generation options
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
async function generateCustomImage(customPrompt, options = {}) {
  return generateImage(customPrompt, options);
}

module.exports = {
  generateImage,
  generateCourseImage,
  generatePackImage,
  generateCustomImage,
};
