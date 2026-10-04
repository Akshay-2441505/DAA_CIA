import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { PriceSlot } from '../types';

interface PriceChartProps {
  slots: PriceSlot[];
  height?: number;
  highlightWindow?: { start_time: string; end_time: string };
}

export const PriceChart: React.FC<PriceChartProps> = ({ slots, height = 240 }) => {
  if (!slots || slots.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm border border-dashed border-surface-border rounded-xl">
        Loading electricity market price signal...
      </div>
    );
  }

  // Format data for chart
  const data = slots.map((s) => {
    const timeStr = s.start_time.includes('T')
      ? s.start_time.split('T')[1].substring(0, 5)
      : s.start_time;
    return {
      index: s.index,
      time: timeStr,
      price: s.price_rs_kwh,
      mwh: s.price_rs_mwh,
      fullStart: s.start_time,
      fullEnd: s.end_time,
    };
  });

  const prices = slots.map((s) => s.price_rs_kwh);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const avgP = prices.reduce((a, b) => a + b, 0) / prices.length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-text-muted">
            <span className="w-2.5 h-2.5 rounded-sm bg-energy-green/80" />
            IEX MCP (₹/kWh)
          </span>
          <span className="text-text-muted">
            Avg: <strong className="text-text-primary">₹{avgP.toFixed(2)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-text-muted">
          <span>Min: <span className="text-energy-green">₹{minP.toFixed(2)}</span></span>
          <span>Max: <span className="text-rose-400">₹{maxP.toFixed(2)}</span></span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9CFF72" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#9CFF72" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              stroke="#6E7684"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              interval={15} // Show tick roughly every 4 hours (16 * 15m)
            />

            <YAxis
              stroke="#6E7684"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              domain={[Math.floor(minP * 0.9), Math.ceil(maxP * 1.1)]}
              tickFormatter={(v) => `₹${v}`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-surface-elevated border border-surface-border p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-text-primary">Time: {d.time} (Block #{d.index + 1})</div>
                      <div className="text-energy-green font-medium">₹{d.price.toFixed(4)} / kWh</div>
                      <div className="text-text-muted">₹{d.mwh.toFixed(0)} / MWh (IEX DAM)</div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine
              y={avgP}
              stroke="#6E7684"
              strokeDasharray="3 3"
              label={{ value: 'Avg', fill: '#6E7684', fontSize: 10, position: 'right' }}
            />

            <Area
              type="monotone"
              dataKey="price"
              stroke="#9CFF72"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
