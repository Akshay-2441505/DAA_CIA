import React from 'react';
import { PriceSlot } from '../types';

interface PriceRibbonProps {
  slots: PriceSlot[];
  occupiedSlotIndices?: Set<number>;
}

export const PriceRibbon: React.FC<PriceRibbonProps> = ({ slots, occupiedSlotIndices = new Set() }) => {
  if (!slots || slots.length === 0) return null;

  const prices = slots.map((s) => s.price_rs_kwh);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  return (
    <div className="w-full space-y-1.5 my-3">
      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-energy-green" />
          Off-peak Low (₹{minP.toFixed(2)})
        </span>
        <span className="uppercase tracking-wider font-semibold text-[10px]">24-Hour Electricity Price Intensity</span>
        <span className="flex items-center gap-1">
          Peak High (₹{maxP.toFixed(2)})
          <span className="w-2 h-2 rounded-full bg-rose-500" />
        </span>
      </div>

      <div className="h-3 w-full rounded-md flex overflow-hidden border border-surface-border bg-surface-secondary/40">
        {slots.map((s) => {
          const ratio = (s.price_rs_kwh - minP) / range;
          const isOccupied = occupiedSlotIndices.has(s.index);

          // Interpolate from lime green (low) to amber (mid) to red (high)
          let bgColor = '#9CFF72';
          if (ratio > 0.66) {
            bgColor = '#F43F5E'; // rose
          } else if (ratio > 0.33) {
            bgColor = '#FBBF24'; // amber
          } else {
            bgColor = '#9CFF72'; // lime
          }

          return (
            <div
              key={s.index}
              title={`Block ${s.index + 1}: ${s.start_time.substring(11, 16)} - ₹${s.price_rs_kwh.toFixed(2)}/kWh`}
              className={`flex-1 transition-opacity relative group ${
                isOccupied ? 'ring-1 ring-white/60 z-10' : ''
              }`}
              style={{
                backgroundColor: bgColor,
                opacity: 0.25 + ratio * 0.7,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
