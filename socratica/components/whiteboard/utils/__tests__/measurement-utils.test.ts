import { describe, it, expect } from "vitest";
import {
  calculateAngle,
  calculateDistance,
  formatAngle,
  formatDistance,
} from "@/components/whiteboard/utils/measurement-utils";

describe("Measurement Utilities", () => {
  describe("calculateDistance", () => {
    it("calculates distance between two points correctly", () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      const distance = calculateDistance(p1, p2);
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it("calculates distance for horizontal line", () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 10, y: 0 };
      const distance = calculateDistance(p1, p2);
      expect(distance).toBe(10);
    });

    it("calculates distance for vertical line", () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 0, y: 10 };
      const distance = calculateDistance(p1, p2);
      expect(distance).toBe(10);
    });

    it("returns 0 for same point", () => {
      const p1 = { x: 5, y: 5 };
      const p2 = { x: 5, y: 5 };
      const distance = calculateDistance(p1, p2);
      expect(distance).toBe(0);
    });
  });

  describe("calculateAngle", () => {
    it("calculates 90 degree angle correctly", () => {
      // Right angle: vertex at (0,0), points at (1,0) and (0,1)
      const p1 = { x: 1, y: 0 };
      const p2 = { x: 0, y: 0 }; // vertex
      const p3 = { x: 0, y: 1 };
      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(90, 1);
    });

    it("calculates 180 degree angle correctly", () => {
      // Straight line: vertex at (0,0), points at (-1,0) and (1,0)
      const p1 = { x: -1, y: 0 };
      const p2 = { x: 0, y: 0 }; // vertex
      const p3 = { x: 1, y: 0 };
      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(180, 1);
    });

    it("calculates 45 degree angle correctly", () => {
      // 45 degree angle
      const p1 = { x: 1, y: 0 };
      const p2 = { x: 0, y: 0 }; // vertex
      const p3 = { x: 1, y: 1 };
      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(45, 1);
    });

    it("returns 0 for collinear points", () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 1, y: 1 }; // vertex
      const p3 = { x: 2, y: 2 };
      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(0, 1);
    });

    it("handles zero-length vectors", () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 0, y: 0 }; // vertex (same as p1)
      const p3 = { x: 1, y: 1 };
      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBe(0);
    });
  });

  describe("formatAngle", () => {
    it("formats angle with one decimal place", () => {
      const formatted = formatAngle(45.678);
      expect(formatted).toBe("45.7°");
    });

    it("formats angle with degree symbol", () => {
      const formatted = formatAngle(90);
      expect(formatted).toBe("90.0°");
    });

    it("handles zero angle", () => {
      const formatted = formatAngle(0);
      expect(formatted).toBe("0.0°");
    });
  });

  describe("formatDistance", () => {
    it("formats distance with one decimal place", () => {
      const formatted = formatDistance(10.567);
      expect(formatted).toBe("10.6 px");
    });

    it("formats distance with px unit", () => {
      const formatted = formatDistance(100);
      expect(formatted).toBe("100.0 px");
    });

    it("handles zero distance", () => {
      const formatted = formatDistance(0);
      expect(formatted).toBe("0.0 px");
    });
  });
});


