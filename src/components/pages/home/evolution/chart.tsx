"use client";

import { Evolution } from "@/@types/pages/Home";
import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Scale,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

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
    <div data-el="chart" className="mt-12 rounded-md bg-white/5 p-6 shadow-lg">
      <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row lg:items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Ganhos Acumulados
          </h3>
          <p className="text-sm text-gray-400">
            Evolução desde nossa fundação em 2018
          </p>
        </div>
        <span className="text-prime-red/75 text-xl font-bold">
          ${Number(content.at(-1)?.amount).toLocaleString("en-US")}
        </span>
      </div>

      <div className="h-[275px] md:h-[425px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
