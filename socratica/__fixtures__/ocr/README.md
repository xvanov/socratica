# OCR Test Fixtures

This directory contains PNG images used for testing OCR functionality.

## Usage

Place test images here with descriptive names:

- `polynomial-equation.png` - Test image with polynomial equations
- `fraction-equation.png` - Test image with fractions
- `hspace-test.png` - Test image that includes `\hspace` commands
- `plain-text-math.png` - Test image with math expressions without LaTeX delimiters

## Test Examples

```typescript
import { readFile } from 'fs/promises';
import path from 'path';

const imagePath = path.join(__dirname, '../__fixtures__/ocr/polynomial-equation.png');
const imageBuffer = await readFile(imagePath);
const imageFile = new File([imageBuffer], 'polynomial-equation.png', { type: 'image/png' });
```

## Notes

- Keep images small (< 500KB) for fast test execution
- Use descriptive filenames that indicate what the image tests
- Add corresponding expected output files (`.expected.txt`) if needed


