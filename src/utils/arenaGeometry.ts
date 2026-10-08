export const ARENA_CARD = { w: 150, h: 98 };
export const WINNER_CARD = { w: 240, h: 216 };

export interface SlotGeometry {
  left: number;
  top: number;
  /** Unit vector pointing at the pentagon's centre. */
  toward: {x: number;y: number;};
  /** Resting 3D tilt so the card leans toward the centre. */
  tilt: {rotateX: number;rotateY: number;};
}

export interface ArenaGeometry {
  cx: number;
  cy: number;
  slots: SlotGeometry[];
  winner: {left: number;top: number;};
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const ANGLES = [-90, -18, 54, 126, 198];

/** Five card positions on an ellipse-shaped pentagon that fits inside the stage. */
export function pentagonLayout(width: number, height: number): ArenaGeometry {
  const { w, h } = ARENA_CARD;
  const rx = clamp((width / 2 - w / 2 - 6) / 0.951, 90, 210);
  const ry = clamp((height - h - 12) / 1.809, 56, 118);
  const cx = width / 2;
  const cy = ry + h / 2 + Math.max(6, (height - (1.809 * ry + h)) / 2);

  const slots = ANGLES.map((deg) => {
    const a = deg * Math.PI / 180;
    const dx = rx * Math.cos(a);
    const dy = ry * Math.sin(a);
    const len = Math.hypot(dx, dy) || 1;
    return {
      left: cx + dx - w / 2,
      top: cy + dy - h / 2,
      toward: { x: -dx / len, y: -dy / len },
      tilt: { rotateY: -(dx / rx) * 16, rotateX: dy / ry * 12 }
    };
  });

  return {
    cx,
    cy,
    slots,
    winner: { left: cx - WINNER_CARD.w / 2, top: Math.max(18, (height - WINNER_CARD.h) / 2) }
  };
}