import { PageElement } from './types';

export interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number;
}

export interface SnapResult {
  x: number;
  y: number;
  guides: SnapGuide[];
}

const SNAP_THRESHOLD = 0.8; // Sensitivity in %

/**
 * Pre-calculates all possible alignment lines.
 */
export function getSnapTargets(elements: PageElement[], activeId: string) {
  const xTargets = [0, 50, 100];
  const yTargets = [0, 50, 100];

  elements.forEach(el => {
    if (el.id === activeId) return;
    xTargets.push(el.x);                
    xTargets.push(el.x + el.width);     
    xTargets.push(el.x + el.width / 2); 

    yTargets.push(el.y);                 
    yTargets.push(el.y + el.height);     
    yTargets.push(el.y + el.height / 2); 
  });

  return {
    xTargets: [...new Set(xTargets)],
    yTargets: [...new Set(yTargets)]
  };
}

/**
 * Checks a SINGLE value (like an edge position) against targets.
 * Used for resizing specific edges.
 */
export function snapValue(value: number, targets: number[]): { snapped: number; guide: number | null } {
  let bestTarget: number | null = null;
  let minDiff = SNAP_THRESHOLD;

  for (const t of targets) {
    const diff = Math.abs(t - value);
    if (diff < minDiff) {
      minDiff = diff;
      bestTarget = t;
    }
  }

  if (bestTarget !== null) {
    return { snapped: bestTarget, guide: bestTarget };
  }
  return { snapped: value, guide: null };
}

/**
 * Checks the dragging element's position against targets (Move Logic).
 */
export function calculateSnap(
  proposedX: number,
  proposedY: number,
  width: number,
  height: number,
  targets: { xTargets: number[]; yTargets: number[] }
): SnapResult {
  let newX = proposedX;
  let newY = proposedY;
  const guides: SnapGuide[] = [];

  // X-Axis (Left, Center, Right)
  let minDiffX = SNAP_THRESHOLD;
  let snapX: number | null = null;
  const xPoints = [
    { value: proposedX, offset: 0 },
    { value: proposedX + width / 2, offset: width / 2 },
    { value: proposedX + width, offset: width } 
  ];

  for (const target of targets.xTargets) {
    for (const point of xPoints) {
      const diff = Math.abs(target - point.value);
      if (diff < minDiffX) {
        minDiffX = diff;
        snapX = target - point.offset;
      }
    }
  }

  if (snapX !== null) {
    newX = snapX;
    // Find which target we actually hit for the visual guide
    const matched = targets.xTargets.find(t => 
       Math.abs(t - newX) < 0.1 || Math.abs(t - (newX+width/2)) < 0.1 || Math.abs(t - (newX+width)) < 0.1
    );
    if (matched !== undefined) guides.push({ type: 'vertical', position: matched });
  }

  // Y-Axis (Top, Middle, Bottom)
  let minDiffY = SNAP_THRESHOLD;
  let snapY: number | null = null;
  const yPoints = [
    { value: proposedY, offset: 0 },
    { value: proposedY + height / 2, offset: height / 2 },
    { value: proposedY + height, offset: height }
  ];

  for (const target of targets.yTargets) {
    for (const point of yPoints) {
      const diff = Math.abs(target - point.value);
      if (diff < minDiffY) {
        minDiffY = diff;
        snapY = target - point.offset;
      }
    }
  }

  if (snapY !== null) {
    newY = snapY;
    const matched = targets.yTargets.find(t => 
       Math.abs(t - newY) < 0.1 || Math.abs(t - (newY+height/2)) < 0.1 || Math.abs(t - (newY+height)) < 0.1
    );
    if (matched !== undefined) guides.push({ type: 'horizontal', position: matched });
  }

  return { x: newX, y: newY, guides };
}