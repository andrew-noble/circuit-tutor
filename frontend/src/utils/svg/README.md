# SVG Utilities

This module provides utilities for working with SVG elements in D3.js, with a focus on transformations and element creation.

## Structure

- `index.js` - Main entry point that exports all utilities
- `transforms.js` - Utilities for managing SVG transformations
- `elements.js` - Utilities for creating and manipulating SVG elements

## Usage

### Basic SVG Creation

```javascript
import { createSvg } from "../utils/svg";

// Create an SVG canvas
const svg = createSvg("#container", 800, 600);
```

### Creating Elements from References

```javascript
import { createSvgElementFromReference } from "../utils/svg";

// Create an element from a symbol or external SVG
const element = createSvgElementFromReference(svg, "#my-symbol", 100, 50);
```

### Creating Transformable Elements

```javascript
import { createTransformableElement } from "../utils/svg";

// Create an element with initial position and rotation
const transformableElement = createTransformableElement(
  svg,
  "#my-symbol",
  100,
  50,
  {
    x: 200,
    y: 150,
    rotation: 45,
  }
);

// Access the element and its transform manager
const { element, transform } = transformableElement;
```

### Applying Transformations

```javascript
import { createTransform } from "../utils/svg";

// Create a transform manager for an existing element
const transform = createTransform(element);

// Apply transformations
transform.setTranslate(100, 100).rotate(45).apply();

// Chain transformations
transform
  .translate(10, 20) // Relative movement
  .rotate(15) // Relative rotation
  .apply();

// Set rotation center to element center
transform.setRotationCenterToElementCenter().rotate(30).apply();

// Reset transformations
transform.reset().apply();
```

## Interactive Features (Currently Disabled)

The utilities include support for making elements draggable and rotatable, but these features are currently disabled. To enable them, uncomment the relevant sections in `elements.js`.

## Examples

See the examples in `src/examples/svg-transforms` for demonstrations of how to use these utilities.
