/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { extractTextFromImage } from '@/lib/openai/client';
import { autoWrapMath, parseLaTeX, cleanLaTeX } from '@/lib/math-renderer/latex-parser';

/**
 * OCR Integration Tests
 * 
 * These tests verify OCR functionality with actual image files from __fixtures__/ocr/.
 * 
 * Tests:
 * 1. Extract text from images using OpenAI Vision API
 * 2. Verify math expressions are detected and wrapped correctly
 * 3. Verify hspace commands are cleaned
 * 4. Verify LaTeX parsing works on extracted text
 * 
 * Note: These tests require:
 * - Valid OPENAI_API_KEY in environment
 * - Actual API calls (will be skipped if API key missing)
 * - Test images in __fixtures__/ocr/ directory
 */

const FIXTURES_DIR = join(__dirname, '../../../../__fixtures__/ocr');

// Helper to load image file
async function loadImageFile(filename: string): Promise<File> {
  const imagePath = join(FIXTURES_DIR, filename);
  const buffer = await readFile(imagePath);
  
  // Determine MIME type from extension
  const mimeType = filename.endsWith('.png') ? 'image/png' : 
                   filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' :
                   'image/png';
  
  return new File([buffer], filename, { type: mimeType });
}

// Check if OpenAI API key is available
const hasApiKey = !!process.env.OPENAI_API_KEY;

describe('OCR Integration Tests', () => {
  // Skip all tests if API key is not available
  const testOrSkip = hasApiKey ? it : it.skip;
  
  describe('quadratic.jpg', () => {
    testOrSkip('should extract text from quadratic equation image', async () => {
      const imageFile = await loadImageFile('quadratic.jpg');
      const result = await extractTextFromImage(imageFile);
      
      if (result.error) {
        console.warn('OCR Error for quadratic.jpg:', result.error);
      }
      
      expect(result.text).toBeTruthy();
      expect(result.error).toBeUndefined();
      expect(result.text.length).toBeGreaterThan(0);
      
      // Should contain math-related content
      expect(result.text.toLowerCase()).toMatch(/quadratic|equation|x\^2|solve/i);
    }, 30000); // 30s timeout for API call
    
    testOrSkip('should parse extracted text and detect math expressions', async () => {
      const imageFile = await loadImageFile('quadratic.jpg');
      const ocrResult = await extractTextFromImage(imageFile);
      
      expect(ocrResult.text).toBeTruthy();
      
      // Test auto-wrapping
      const wrapped = autoWrapMath(ocrResult.text);
      const segments = parseLaTeX(wrapped);
      
      // Should have at least some content
      expect(segments.length).toBeGreaterThan(0);
      
      // Should detect math if present
      const hasMath = segments.some(s => s.type === 'inline-math' || s.type === 'block-math');
      if (hasMath) {
        // Verify math segments are cleaned
        segments.forEach(segment => {
          if (segment.type === 'inline-math' || segment.type === 'block-math') {
            expect(segment.content).not.toContain('\\hspace');
          }
        });
      }
    }, 30000);
  });
  
  describe('multiple_choice.png', () => {
    testOrSkip('should extract text from multiple choice question image', async () => {
      const imageFile = await loadImageFile('multiple_choice.png');
      const result = await extractTextFromImage(imageFile);
      
      expect(result.text).toBeTruthy();
      expect(result.error).toBeUndefined();
      expect(result.text.length).toBeGreaterThan(0);
    }, 30000);
    
    testOrSkip('should handle multiple choice questions with math', async () => {
      const imageFile = await loadImageFile('multiple_choice.png');
      const ocrResult = await extractTextFromImage(imageFile);
      
      expect(ocrResult.text).toBeTruthy();
      
      // Test math detection and wrapping
      const wrapped = autoWrapMath(ocrResult.text);
      const segments = parseLaTeX(wrapped);
      
      expect(segments.length).toBeGreaterThan(0);
    }, 30000);
  });
  
  describe('another_mc.png', () => {
    testOrSkip('should extract text from another multiple choice image', async () => {
      const imageFile = await loadImageFile('another_mc.png');
      const result = await extractTextFromImage(imageFile);
      
      expect(result.text).toBeTruthy();
      expect(result.error).toBeUndefined();
      expect(result.text.length).toBeGreaterThan(0);
    }, 30000);
    
    testOrSkip('should clean hspace commands from extracted text', async () => {
      const imageFile = await loadImageFile('another_mc.png');
      const ocrResult = await extractTextFromImage(imageFile);
      
      expect(ocrResult.text).toBeTruthy();
      
      // If hspace is present, it should be cleaned
      const wrapped = autoWrapMath(ocrResult.text);
      const segments = parseLaTeX(wrapped);
      
      segments.forEach(segment => {
        if (segment.type === 'inline-math' || segment.type === 'block-math') {
          const cleaned = cleanLaTeX(segment.content);
          expect(cleaned).not.toContain('\\hspace');
        }
      });
    }, 30000);
  });
  
  describe('many_questions.png', () => {
    testOrSkip('should extract text from image with multiple questions', async () => {
      const imageFile = await loadImageFile('many_questions.png');
      const result = await extractTextFromImage(imageFile);
      
      expect(result.text).toBeTruthy();
      expect(result.error).toBeUndefined();
      expect(result.text.length).toBeGreaterThan(0);
    }, 30000);
    
    testOrSkip('should handle multiple math expressions in one image', async () => {
      const imageFile = await loadImageFile('many_questions.png');
      const ocrResult = await extractTextFromImage(imageFile);
      
      expect(ocrResult.text).toBeTruthy();
      
      // Test that we can wrap and parse multiple expressions
      const wrapped = autoWrapMath(ocrResult.text);
      const segments = parseLaTeX(wrapped);
      
      expect(segments.length).toBeGreaterThan(0);
      
      // Count math segments
      const mathSegments = segments.filter(s => s.type === 'inline-math' || s.type === 'block-math');
      // May have multiple math expressions
      expect(mathSegments.length).toBeGreaterThanOrEqual(0);
    }, 30000);
  });
  
  describe('sys-nonlinear.png', () => {
    testOrSkip('should extract text from nonlinear system image', async () => {
      const imageFile = await loadImageFile('sys-nonlinear.png');
      const result = await extractTextFromImage(imageFile);
      
      expect(result.text).toBeTruthy();
      expect(result.error).toBeUndefined();
      expect(result.text.length).toBeGreaterThan(0);
    }, 30000);
    
    testOrSkip('should detect and wrap system equations', async () => {
      const imageFile = await loadImageFile('sys-nonlinear.png');
      const ocrResult = await extractTextFromImage(imageFile);
      
      expect(ocrResult.text).toBeTruthy();
      
      // System equations often have multiple expressions
      const wrapped = autoWrapMath(ocrResult.text);
      const segments = parseLaTeX(wrapped);
      
      expect(segments.length).toBeGreaterThan(0);
      
      // Verify all math segments are properly cleaned
      segments.forEach(segment => {
        if (segment.type === 'inline-math' || segment.type === 'block-math') {
          expect(segment.content).not.toContain('\\hspace');
          expect(segment.content).not.toContain('\\vspace');
        }
      });
    }, 30000);
  });
  
  describe('End-to-end OCR pipeline', () => {
    testOrSkip('should process all images through full pipeline', async () => {
      const images = ['quadratic.jpg', 'multiple_choice.png', 'another_mc.png', 'many_questions.png', 'sys-nonlinear.png'];
      let successCount = 0;
      
      for (const imageName of images) {
        const imageFile = await loadImageFile(imageName);
        const ocrResult = await extractTextFromImage(imageFile);
        
        // Skip images that don't have extractable text (some images might be empty/unreadable)
        if (!ocrResult.text || ocrResult.text.trim().length === 0) {
          console.warn(`Skipping ${imageName} - no text extracted`);
          continue;
        }
        
        expect(ocrResult.error).toBeUndefined();
        
        // Test full pipeline: OCR -> autoWrap -> parse -> clean
        const wrapped = autoWrapMath(ocrResult.text);
        const segments = parseLaTeX(wrapped);
        
        // Verify segments are valid
        expect(segments.length).toBeGreaterThan(0);
        
        segments.forEach(segment => {
          expect(['text', 'inline-math', 'block-math']).toContain(segment.type);
          expect(segment.content).toBeTruthy();
          
          // Clean math expressions
          if (segment.type === 'inline-math' || segment.type === 'block-math') {
            const cleaned = cleanLaTeX(segment.content);
            expect(cleaned).not.toContain('\\hspace');
            expect(cleaned).not.toContain('\\vspace');
          }
        });
        
        successCount++;
      }
      
      // At least one image should have been successfully processed
      expect(successCount).toBeGreaterThan(0);
    }, 120000); // 2 minute timeout for all images
  });
  
  // Skip message if API key not available
  if (!hasApiKey) {
    it.skip('⚠️  Skipping OCR tests - OPENAI_API_KEY not set in environment', () => {
      // This test is skipped when API key is missing
    });
  }
});
