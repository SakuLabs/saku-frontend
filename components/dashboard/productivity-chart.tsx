'use client';

import {
  RadialBar,
  RadialBarChart,
  Label,
  PolarRadiusAxis,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  rate: { label: "Completion" },
} satisfies ChartConfig;

// Isolated so recharts (heavy) is code-split out of the dashboard's initial bundle.
export function ProductivityChart({ completionRate }: { completionRate: number }) {
  const chartData = [{ name: "completion", rate: completionRate }];

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square w-full max-w-[180px] sm:max-w-[250px]"
    >
      <RadialBarChart
        data={chartData}
        startAngle={-90}
        endAngle={270}
        innerRadius="64%"
        outerRadius="88%"
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-white/5 last:fill-transparent"
          polarRadius={[86, 74]}
        />
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          dataKey="rate"
          tick={false}
        />
        <RadialBar
          dataKey="rate"
          background={{ fill: "rgba(255, 255, 255, 0.05)" }}
          cornerRadius={10}
          fill="url(#productivity-gradient)"
        />
        <defs>
          <linearGradient id="productivity-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-white text-4xl font-bold"
                    >
                      {completionRate}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-white/50 text-xs uppercase tracking-widest"
                    >
                      Efficiency
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}
