# SVG Transforms Example

This example demonstrates how to use the SVG utilities to create and transform SVG elements.

## Running the Example

You can run this example by:

1. Starting the Vite development server:

   ```
   cd frontend
   npx vite
   ```

2. Navigating to:
   ```
   http://localhost:5173/src/examples/svg-transforms/
   ```

## What This Example Demonstrates

- Creating an SVG canvas
- Defining SVG symbols (resistor, capacitor, voltage source)
- Creating elements from these symbols
- Applying initial transformations (position, rotation)
- Programmatically transforming elements using buttons

## Code Structure

- `index.html` - The HTML page that loads the example
- `example.js` - The JavaScript code that initializes the example

## Interactive Features

The example includes buttons to:

- Rotate the resistor by 45 degrees
- Move the capacitor to the right
- Reset the voltage source to its initial position

## Notes

The draggable and rotatable functionality is currently disabled in this example. To enable these features, you would need to uncomment the relevant sections in the `createTransformableElement` function in the SVG utilities.
