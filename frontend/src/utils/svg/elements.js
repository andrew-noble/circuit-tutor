import * as d3 from "d3";
import { createTransform, makeDraggable, makeRotatable } from "./transforms.js";

/**
 * Create an SVG canvas
 * @param {string|Element} parent - CSS selector or DOM element to append SVG to
 * @param {number} width - Width of the SVG
 * @param {number} height - Height of the SVG
 * @param {Object} options - Additional options
 * @param {string} options.id - ID to assign to the SVG
 * @param {string} options.style - CSS style to apply
 * @returns {Object} D3 selection of the created SVG
 */
export function createSvg(parent, width, height, options = {}) {
  const svg = d3
    .select(parent)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Apply optional attributes
  if (options.id) {
    svg.attr("id", options.id);
  } else {
    svg.attr("id", "d3-canvas");
  }

  if (options.style) {
    svg.attr("style", options.style);
  } else {
    svg.attr("style", "border: 1px solid #ccc;"); // Default style
  }

  return svg; // Returns a D3 selection, not native DOM element
}

/**
 * Create an SVG element from a reference (e.g., a symbol or external SVG)
 * @param {Object} parent - D3 selection of parent element
 * @param {string} src - Source reference (e.g., "#my-sprite")
 * @param {number} width - Element width
 * @param {number} height - Element height
 * @returns {Object} D3 selection of the created element
 */
export function createSvgElementFromReference(parent, src, width, height) {
  const element = parent.append("use").attr("href", src);

  element.attr("width", width);
  element.attr("height", height);

  return element; // Returns a D3 selection
}

/**
 * Create a transformable SVG element from a reference
 * @param {Object} parent - D3 selection of parent element
 * @param {string} src - Source reference (e.g., "#my-sprite")
 * @param {number} width - Element width
 * @param {number} height - Element height
 * @param {Object} options - Configuration options
 * @param {boolean} options.draggable - Make element draggable (currently disabled)
 * @param {boolean} options.rotatable - Make element rotatable (currently disabled)
 * @param {number} options.x - Initial x position
 * @param {number} options.y - Initial y position
 * @param {number} options.rotation - Initial rotation angle
 * @returns {Object} Object containing the element and its transform manager
 */
export function createTransformableElement(
  parent,
  src,
  width,
  height,
  options = {}
) {
  // Create the element
  const element = createSvgElementFromReference(parent, src, width, height);

  // Create transform manager
  const transform = createTransform(element);

  // Set initial position if provided
  if (options.x !== undefined && options.y !== undefined) {
    transform.setTranslate(options.x, options.y);
  }

  // Set initial rotation if provided
  if (options.rotation !== undefined) {
    // Set rotation center to element center by default
    const bbox = element.node().getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;

    transform.setRotationCenter(centerX, centerY);
    transform.setRotation(options.rotation);
  }

  // Apply initial transforms
  transform.apply();

  // Make draggable if requested (currently disabled)
  /* 
  if (options.draggable) {
    makeDraggable(element, options.onDragStart, options.onDragEnd);
  }
  */

  // Make rotatable if requested (currently disabled)
  /*
  if (options.rotatable) {
    makeRotatable(element, options.handleRadius);
  }
  */

  return {
    element,
    transform,
  };
}
