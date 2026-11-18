"use client";

import { useState } from "react";
import type {
  PointerEvent as ReactPointerEvent,
} from "react";

import type {
  SketchPoint,
  SketchShape,
} from "../types/content.types";

type Tool = "freehand" | "line" | "circle" | "rectangle";

function renderShape(shape: SketchShape, index: number) {
  const common = {
    key: `${shape.type}-${index}`,
    fill: "none",
    stroke: "#6d28d9",
    strokeWidth: 4,
    strokeLinecap: "round" as const,
  };

  switch (shape.type) {
    case "line":
      return (
        <line
          {...common}
          x1={shape.x1}
          y1={shape.y1}
          x2={shape.x2}
          y2={shape.y2}
        />
      );
    case "circle":
      return <circle {...common} cx={shape.cx} cy={shape.cy} r={shape.r} />;
    case "rectangle":
      return (
        <rect
          {...common}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
        />
      );
    case "freehand":
      return (
        <polyline
          {...common}
          points={shape.points.map(({ x, y }) => `${x},${y}`).join(" ")}
        />
      );
  }
}

export function SketchDrawing({
  shapes,
}: {
  shapes: SketchShape[];
}) {
  return (
    <svg
      viewBox="0 0 1000 600"
      className="aspect-[5/3] w-full rounded-lg bg-white"
      role="img"
      aria-label="Hình phác thảo bài học"
    >
      {shapes.map(renderShape)}
    </svg>
  );
}

export default function SketchEditor({
  shapes,
  onChange,
}: {
  shapes: SketchShape[];
  onChange: (shapes: SketchShape[]) => void;
}) {
  const [tool, setTool] = useState<Tool>("freehand");
  const [start, setStart] = useState<SketchPoint | null>(null);
  const [draft, setDraft] = useState<SketchShape | null>(null);

  function getPoint(event: ReactPointerEvent<SVGSVGElement>): SketchPoint {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1000, ((event.clientX - bounds.left) / bounds.width) * 1000)),
      y: Math.max(0, Math.min(600, ((event.clientY - bounds.top) / bounds.height) * 600)),
    };
  }

  function beginDrawing(event: ReactPointerEvent<SVGSVGElement>) {
    const point = getPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    setStart(point);

    switch (tool) {
      case "freehand":
        setDraft({ type: "freehand", points: [point] });
        break;
      case "line":
        setDraft({
          type: "line",
          x1: point.x,
          y1: point.y,
          x2: point.x,
          y2: point.y,
        });
        break;
      case "circle":
        setDraft({ type: "circle", cx: point.x, cy: point.y, r: 1 });
        break;
      case "rectangle":
        setDraft({
          type: "rectangle",
          x: point.x,
          y: point.y,
          width: 1,
          height: 1,
        });
        break;
    }
  }

  function continueDrawing(event: ReactPointerEvent<SVGSVGElement>) {
    if (!start || !draft) return;

    const point = getPoint(event);
    switch (draft.type) {
      case "freehand":
        if (draft.points.length < 2000) {
          setDraft({ ...draft, points: [...draft.points, point] });
        }
        break;
      case "line":
        setDraft({ ...draft, x2: point.x, y2: point.y });
        break;
      case "circle":
        setDraft({
          ...draft,
          r: Math.max(
            1,
            Math.hypot(point.x - start.x, point.y - start.y)
          ),
        });
        break;
      case "rectangle":
        setDraft({
          ...draft,
          x: Math.min(start.x, point.x),
          y: Math.min(start.y, point.y),
          width: Math.max(1, Math.abs(point.x - start.x)),
          height: Math.max(1, Math.abs(point.y - start.y)),
        });
        break;
    }
  }

  function finishDrawing() {
    if (
      draft &&
      (draft.type !== "freehand" || draft.points.length >= 2)
    ) {
      onChange([...shapes, draft]);
    }
    setStart(null);
    setDraft(null);
  }

  const tools: Array<{ value: Tool; label: string }> = [
    { value: "freehand", label: "Nét tự do" },
    { value: "line", label: "Đường thẳng" },
    { value: "circle", label: "Đường tròn" },
    { value: "rectangle", label: "Hình chữ nhật" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tools.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={tool === item.value}
            onClick={() => setTool(item.value)}
            className={`rounded-lg border px-3 py-2 text-sm ${
              tool === item.value
                ? "border-violet-600 bg-violet-50 text-violet-700"
                : "border-slate-300"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange([])}
          className="ml-auto rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          Xóa hình
        </button>
      </div>

      <svg
        viewBox="0 0 1000 600"
        className="aspect-[5/3] w-full touch-none rounded-lg border border-slate-300 bg-white"
        aria-label="Bảng vẽ"
        onPointerDown={beginDrawing}
        onPointerMove={continueDrawing}
        onPointerUp={finishDrawing}
        onPointerCancel={finishDrawing}
      >
        {shapes.map(renderShape)}
        {draft && renderShape(draft, shapes.length)}
      </svg>
    </div>
  );
}
