import * as d3 from "d3";

/**
 * TransformState class to manage SVG element transformations
 */
export class TransformState {
  constructor(element) {
    this.element = element; // D3 selection
    this.translateX = 0;
    this.translateY = 0;
    this.rotation = 0;
    this.rotationCenterX = 0;
    this.rotationCenterY = 0;
    this.scaleX = 1;
    this.scaleY = 1;

    // Initialize from existing transform if present
    this._parseExistingTransform();
  }

  /**
   * Parse existing transform attribute if it exists
   * Note: This is a simplified parser and may not handle all transform types
   */
  _parseExistingTransform() {
    const currentTransform = this.element.attr("transform");
    if (!currentTransform) return;

    // Simple regex-based parsing (could be enhanced for more complex transforms)
    const translateMatch = /translate\(\s*([^,]+),\s*([^)]+)\)/.exec(
      currentTransform
    );
    if (translateMatch) {
      this.translateX = parseFloat(translateMatch[1]);
      this.translateY = parseFloat(translateMatch[2]);
    }

    const rotateMatch = /rotate\(\s*([^,]+)(?:,\s*([^,]+),\s*([^)]+))?\)/.exec(
      currentTransform
    );
    if (rotateMatch) {
      this.rotation = parseFloat(rotateMatch[1]);
      if (rotateMatch[2] && rotateMatch[3]) {
        this.rotationCenterX = parseFloat(rotateMatch[2]);
        this.rotationCenterY = parseFloat(rotateMatch[3]);
      }
    }

    const scaleMatch = /scale\(\s*([^,)]+)(?:,\s*([^)]+))?\)/.exec(
      currentTransform
    );
    if (scaleMatch) {
      this.scaleX = parseFloat(scaleMatch[1]);
      this.scaleY = scaleMatch[2] ? parseFloat(scaleMatch[2]) : this.scaleX;
    }
  }

  /**
   * Apply all current transformations to the element
   */
  apply() {
    let transformString = "";

    // Add translation if any
    if (this.translateX !== 0 || this.translateY !== 0) {
      transformString += `translate(${this.translateX}, ${this.translateY}) `;
    }

    // Add rotation if any
    if (this.rotation !== 0) {
      if (this.rotationCenterX !== 0 || this.rotationCenterY !== 0) {
        transformString += `rotate(${this.rotation}, ${this.rotationCenterX}, ${this.rotationCenterY}) `;
      } else {
        transformString += `rotate(${this.rotation}) `;
      }
    }

    // Add scaling if not 1:1
    if (this.scaleX !== 1 || this.scaleY !== 1) {
      transformString += `scale(${this.scaleX}, ${this.scaleY}) `;
    }

    // Apply the transform
    this.element.attr("transform", transformString.trim());
    return this;
  }

  /**
   * Set absolute translation values
   */
  setTranslate(x, y) {
    this.translateX = x;
    this.translateY = y;
    return this;
  }

  /**
   * Add to current translation values
   */
  translate(dx, dy) {
    this.translateX += dx;
    this.translateY += dy;
    return this;
  }

  /**
   * Set absolute rotation with optional center point
   */
  setRotation(angle, centerX, centerY) {
    this.rotation = angle;
    if (centerX !== undefined && centerY !== undefined) {
      this.rotationCenterX = centerX;
      this.rotationCenterY = centerY;
    }
    return this;
  }

  /**
   * Add to current rotation
   */
  rotate(dAngle) {
    this.rotation += dAngle;
    return this;
  }

  /**
   * Set rotation center point
   */
  setRotationCenter(x, y) {
    this.rotationCenterX = x;
    this.rotationCenterY = y;
    return this;
  }

  /**
   * Set rotation center to the element's bounding box center
   */
  setRotationCenterToElementCenter() {
    const bbox = this.element.node().getBBox();
    this.rotationCenterX = bbox.x + bbox.width / 2;
    this.rotationCenterY = bbox.y + bbox.height / 2;
    return this;
  }

  /**
   * Set absolute scale values
   */
  setScale(sx, sy = sx) {
    this.scaleX = sx;
    this.scaleY = sy;
    return this;
  }

  /**
   * Multiply current scale by factors
   */
  scale(sx, sy = sx) {
    this.scaleX *= sx;
    this.scaleY *= sy;
    return this;
  }

  /**
   * Reset all transformations
   */
  reset() {
    this.translateX = 0;
    this.translateY = 0;
    this.rotation = 0;
    this.rotationCenterX = 0;
    this.rotationCenterY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    return this;
  }
}

/**
 * Create a transform state manager for a D3 selection
 */
export function createTransform(element) {
  return new TransformState(element);
}

/**
 * Helper to make an element draggable
 */
export function makeDraggable(element, onDragStart, onDragEnd) {
  const transform = createTransform(element);

  // Apply initial transform if needed
  transform.apply();

  const drag = d3
    .drag()
    .on("start", function (event) {
      if (onDragStart) onDragStart(event, transform);
    })
    .on("drag", function (event) {
      transform.translate(event.dx, event.dy).apply();
    })
    .on("end", function (event) {
      if (onDragEnd) onDragEnd(event, transform);
    });

  element.call(drag);

  return transform;
}

/**
 * Helper to make an element rotatable
 * This is a simplified version - you might want to enhance it based on your needs
 */
export function makeRotatable(element, handleRadius = 10) {
  const transform = createTransform(element);

  // Set rotation center to element center
  transform.setRotationCenterToElementCenter().apply();

  // Create rotation handle
  const bbox = element.node().getBBox();
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;

  const parent = d3.select(element.node().parentNode);
  const handle = parent
    .append("circle")
    .attr("cx", centerX)
    .attr("cy", bbox.y - handleRadius * 2)
    .attr("r", handleRadius)
    .attr("fill", "steelblue")
    .attr("cursor", "move")
    .attr("class", "rotation-handle");

  const dragHandle = d3.drag().on("drag", function (event) {
    const dx = event.x - centerX;
    const dy = event.y - centerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    transform.setRotation(angle + 90).apply();

    // Update handle position
    handle
      .attr(
        "cx",
        centerX + (Math.cos((angle * Math.PI) / 180) * bbox.height) / 2
      )
      .attr(
        "cy",
        centerY + (Math.sin((angle * Math.PI) / 180) * bbox.height) / 2
      );
  });

  handle.call(dragHandle);

  return transform;
}
