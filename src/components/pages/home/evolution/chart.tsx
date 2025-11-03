"use client";

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

export default function Chart() {
  const data = {
    labels: ["2018", "2019", "2020", "2021", "2022", "2023"],
    datasets: [
      {
        label: "Ganhos Acumulados ($)",
        data: [100000, 300000, 750000, 1200000, 1700000, 2250000],
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
    <div className="mt-12 rounded-md bg-white/5 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Ganhos Acumulados
          </h3>
          <p className="text-sm text-gray-400">
            Evolução desde nossa fundação em 2018
          </p>
        </div>
        <span className="text-prime-red/75 text-xl font-bold">$2,250,000+</span>
      </div>

      <div className="h-[275px] md:h-[425px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
