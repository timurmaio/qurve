import { ChartProvider } from "../../src/components/ChartContext";
import { Line } from "../../src/components/Line";
import { LinePath } from "../../src/components/LinePath";
import { useEffect, useMemo, useState } from "react";
import { appleStock } from "../../src/mock";

export default function Home() {
  const width = 800;
  const height = 400;
  const padding = 50;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const periods = [
    { label: '1d', days: 1 },
    { label: '1w', days: 7 },
    { label: '1m', days: 30 },
    { label: '3m', days: 90 },
    { label: '6m', days: 180 },
    { label: 'all', days: Infinity }
  ];

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    if (selectedPeriod === 'all') return appleStock;
    
    const dates = appleStock.map(d => new Date(d.date));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const cutoffDate = new Date(maxDate);
    cutoffDate.setDate(cutoffDate.getDate() - periods.find(p => p.label === selectedPeriod)?.days!);
    
    return appleStock.filter(d => new Date(d.date) >= cutoffDate);
  }, [selectedPeriod]);

  // Calculate scales
  const minPrice = Math.min(...filteredData.map(d => d.close));
  const maxPrice = Math.max(...filteredData.map(d => d.close));
  const priceRange = maxPrice - minPrice;

  // Helper function to convert data to coordinates
  const getX = (index: number) => padding + (index * (width - 2 * padding) / (filteredData.length - 1));
  const getY = (price: number) => height - padding - ((price - minPrice) * (height - 2 * padding) / priceRange);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Apple Stock Price Chart</h1>
      <div className="mb-4 flex gap-2">
        {periods.map(period => (
          <button
            key={period.label}
            onClick={() => setSelectedPeriod(period.label)}
            className={`px-4 py-2 rounded ${selectedPeriod === period.label
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {period.label}
          </button>
        ))}
      </div>
      <ChartProvider width={width} height={height}>
        {/* Draw axes */}
        <Line 
          x1={padding} 
          y1={height - padding} 
          x2={width - padding} 
          y2={height - padding} 
          color="#666" 
          lineWidth={2} 
        />
        <Line 
          x1={padding} 
          y1={padding} 
          x2={padding} 
          y2={height - padding} 
          color="#666" 
          lineWidth={2} 
        />

        {/* Draw price line and points */}
        <LinePath data={filteredData} getX={getX} getY={getY} />
      </ChartProvider>
    </div>
  );
}