"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  type Scale,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { Evolution } from "@/@types/pages/Home";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type ChartProps = {
  content: Evolution["accumulatedEarnings"];
};

export default function Chart({ content }: ChartProps) {
  const data = {
    labels: content.map((item) => item.title),
    datasets: [
      {
        label: "Ganhos Acumulados ($)",
        data: content.map((item) => item.amount),
        borderColor: "#e11d48",
        backgroundColor: "rgba(225, 29, 72, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#e11d48",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: "#fff" },
      },
      tooltip: {
        backgroundColor: "#1e1e2e",
        titleColor: "#fff",
        bodyColor: "#ddd",
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: {
          color: "#9ca3af",
          callback: function (this: Scale<any>, tickValue: string | number) {
            const num =
              typeof tickValue === "string" ? parseFloat(tickValue) : tickValue;
            return `$${num / 1000000}M`;
          },
        },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  return (
    <div className="h-[275px] md:h-[425px]">
      <Line data={data} options={options} />
    </div>
  );
}
