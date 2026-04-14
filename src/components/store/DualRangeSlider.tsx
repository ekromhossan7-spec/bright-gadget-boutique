import { useCallback, useRef, useEffect } from "react";

interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
}

const DualRangeSlider = ({ min, max, value, onValueChange, step = 1, className = "" }: DualRangeSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const minGap = step;

  const percent1 = max > min ? ((value[0] - min) / (max - min)) * 100 : 0;
  const percent2 = max > min ? ((value[1] - min) / (max - min)) * 100 : 100;

  const handleMin = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (value[1] - val >= minGap) {
      onValueChange([val, value[1]]);
    }
  }, [value, onValueChange, minGap]);

  const handleMax = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val - value[0] >= minGap) {
      onValueChange([value[0], val]);
    }
  }, [value, onValueChange, minGap]);

  return (
    <div className={className}>
      <div className="relative w-full h-[50px]">
        {/* Track */}
        <div
          ref={trackRef}
          className="absolute w-full h-[5px] top-0 bottom-0 my-auto rounded-full"
          style={{
            background: `linear-gradient(to right, hsl(var(--muted)) ${percent1}%, hsl(var(--primary)) ${percent1}%, hsl(var(--primary)) ${percent2}%, hsl(var(--muted)) ${percent2}%)`,
          }}
        />
        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleMin}
          className="dual-range-input"
        />
        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={handleMax}
          className="dual-range-input"
        />
      </div>
    </div>
  );
};

export default DualRangeSlider;
