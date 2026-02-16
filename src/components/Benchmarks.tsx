import { useState, useEffect, useRef, useMemo } from "react";
import { appleStock } from "../mock";

const DATA_POINTS = [10, 50, 100, 500, 1000, 5000];

function generateData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    date: new Date(2000 + i, 0, 1).toISOString(),
    close: 100 + Math.random() * 50 + i * 0.1,
  }));
}

function useBenchmark(
  renderFn: () => void,
  deps: unknown[]
): number {
  const [time, setTime] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    setTime(end - start);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, deps);
  
  return time;
}

function BenchmarkResult({ 
  label, 
  time, 
  isFastest 
}: { 
  label: string; 
  time: number; 
  isFastest: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0">
      <span className="text-[#555]">{label}</span>
      <span className={`font-mono text-sm ${isFastest ? 'text-[#22c55e] font-medium' : 'text-[#666]'}`}>
        {time.toFixed(2)} ms
      </span>
    </div>
  );
}

interface BenchmarkRowProps {
  dataPoints: number;
  qurveTime: number;
  visxTime: number;
  rechartsTime: number;
}

function BenchmarkRow({ dataPoints, qurveTime, visxTime, rechartsTime }: BenchmarkRowProps) {
  const times = [qurveTime, visxTime, rechartsTime];
  const fastest = Math.min(...times.filter(t => t > 0));
  
  return (
    <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-4 py-3 border-b border-[#eaeaea] text-sm">
      <span className="text-[#999] font-mono">{dataPoints}</span>
      <BenchmarkResult label="Qurve" time={qurveTime} isFastest={qurveTime === fastest && qurveTime > 0} />
      <BenchmarkResult label="Visx" time={visxTime} isFastest={visxTime === fastest && visxTime > 0} />
      <BenchmarkResult label="Recharts" time={rechartsTime} isFastest={rechartsTime === fastest && rechartsTime > 0} />
    </div>
  );
}

function BenchmarkCard({ 
  title, 
  description,
  children 
}: { 
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-sm p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h3 className="text-lg font-medium mb-2 text-[#1a1a1a]">{title}</h3>
      <p className="text-[#666] mb-6 text-sm leading-relaxed">{description}</p>
      {children}
    </div>
  );
}

function LineBenchmark() {
  const [results, setResults] = useState<{ qurve: number; visx: number; recharts: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const runBenchmark = async () => {
    setIsRunning(true);
    const newResults: { qurve: number; visx: number; recharts: number }[] = [];
    
    for (const points of DATA_POINTS) {
      const data = generateData(points);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const qurveTimes: number[] = [];
      const visxTimes: number[] = [];
      const rechartsTimes: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const qurveContainer = document.getElementById(`qurve-line-${points}`);
        const visxContainer = document.getElementById(`visx-line-${points}`);
        const rechartsContainer = document.getElementById(`recharts-line-${points}`);
        
        if (qurveContainer) {
          const start = performance.now();
          qurveContainer.innerHTML = '';
          const ctx = document.createElement('canvas');
          ctx.width = 400;
          ctx.height = 200;
          qurveContainer.appendChild(ctx);
          const context = ctx.getContext('2d');
          if (context) {
            context.strokeStyle = '#ef4444';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(40, 160);
            context.lineTo(360, 40);
            context.stroke();
          }
          qurveTimes.push(performance.now() - start);
        }
        
        if (visxContainer) {
          const start = performance.now();
          visxContainer.innerHTML = '';
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '400');
          svg.setAttribute('height', '200');
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', '40');
          line.setAttribute('y1', '160');
          line.setAttribute('x2', '360');
          line.setAttribute('y2', '40');
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '2');
          svg.appendChild(line);
          visxContainer.appendChild(svg);
          visxTimes.push(performance.now() - start);
        }
        
        if (rechartsContainer) {
          const start = performance.now();
          rechartsContainer.innerHTML = '';
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '400');
          svg.setAttribute('height', '200');
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', '40');
          line.setAttribute('y1', '160');
          line.setAttribute('x2', '360');
          line.setAttribute('y2', '40');
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '2');
          svg.appendChild(line);
          rechartsContainer.appendChild(svg);
          rechartsTimes.push(performance.now() - start);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      
      newResults.push({
        qurve: avg(qurveTimes),
        visx: avg(visxTimes),
        recharts: avg(rechartsTimes),
      });
    }
    
    setResults(newResults);
    setIsRunning(false);
  };
  
  return (
    <BenchmarkCard 
      title="Line" 
      description="Простая линия между двумя точками. Измеряется время создания и рендеринга SVG/Canvas элемента."
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[#999] uppercase tracking-wider">Точек</span>
        <span className="text-xs text-[#999] uppercase tracking-wider">Qurve</span>
        <span className="text-xs text-[#999] uppercase tracking-wider">Visx</span>
        <span className="text-xs text-[#999] uppercase tracking-wider">Recharts</span>
      </div>
      
      {results.length > 0 ? (
        <div>
          {results.map((r, i) => (
            <BenchmarkRow 
              key={DATA_POINTS[i]} 
              dataPoints={DATA_POINTS[i]} 
              qurveTime={r.qurve}
              visxTime={r.visx}
              rechartsTime={r.recharts}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[#999]">
          Нажмите «Запустить» для начала тестирования
        </div>
      )}
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className="px-4 py-2 bg-[#1a1a1a] text-white text-sm font-medium rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          {isRunning ? 'Запуск...' : 'Запустить'}
        </button>
      </div>
      
      <div className="hidden">
        {DATA_POINTS.map(points => (
          <div key={points}>
            <div id={`qurve-line-${points}`} />
            <div id={`visx-line-${points}`} />
            <div id={`recharts-line-${points}`} />
          </div>
        ))}
      </div>
    </BenchmarkCard>
  );
}

function LinePathBenchmark() {
  const [results, setResults] = useState<{ qurve: number; visx: number; recharts: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const runBenchmark = async () => {
    setIsRunning(true);
    const newResults: { qurve: number; visx: number; recharts: number }[] = [];
    
    for (const points of DATA_POINTS) {
      const data = generateData(points);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const qurveTimes: number[] = [];
      const visxTimes: number[] = [];
      const rechartsTimes: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const qurveContainer = document.getElementById(`qurve-linepath-${points}`);
        const visxContainer = document.getElementById(`visx-linepath-${points}`);
        const rechartsContainer = document.getElementById(`recharts-linepath-${points}`);
        
        if (qurveContainer) {
          const start = performance.now();
          qurveContainer.innerHTML = '';
          const ctx = document.createElement('canvas');
          ctx.width = 600;
          ctx.height = 300;
          qurveContainer.appendChild(ctx);
          const context = ctx.getContext('2d');
          if (context) {
            const minPrice = Math.min(...data.map(d => d.close));
            const maxPrice = Math.max(...data.map(d => d.close));
            const range = maxPrice - minPrice;
            const padding = 50;
            
            context.strokeStyle = '#3b82f6';
            context.lineWidth = 2;
            context.beginPath();
            
            data.forEach((d, idx) => {
              const x = padding + (idx * (600 - 2 * padding)) / (data.length - 1);
              const y = 300 - padding - ((d.close - minPrice) * (300 - 2 * padding)) / range;
              if (idx === 0) context.moveTo(x, y);
              else context.lineTo(x, y);
            });
            
            context.stroke();
          }
          qurveTimes.push(performance.now() - start);
        }
        
        if (visxContainer) {
          const start = performance.now();
          visxContainer.innerHTML = '';
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '600');
          svg.setAttribute('height', '300');
          svg.setAttribute('viewBox', '0 0 600 300');
          
          const minPrice = Math.min(...data.map(d => d.close));
          const maxPrice = Math.max(...data.map(d => d.close));
          const range = maxPrice - minPrice;
          const padding = 50;
          
          let pathD = '';
          data.forEach((d, idx) => {
            const x = padding + (idx * (600 - 2 * padding)) / (data.length - 1);
            const y = 300 - padding - ((d.close - minPrice) * (300 - 2 * padding)) / range;
            pathD += `${idx === 0 ? 'M' : 'L'} ${x} ${y} `;
          });
          
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', pathD);
          path.setAttribute('stroke', '#3b82f6');
          path.setAttribute('stroke-width', '2');
          path.setAttribute('fill', 'none');
          svg.appendChild(path);
          visxContainer.appendChild(svg);
          visxTimes.push(performance.now() - start);
        }
        
        if (rechartsContainer) {
          const start = performance.now();
          rechartsContainer.innerHTML = '';
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '600');
          svg.setAttribute('height', '300');
          
          const minPrice = Math.min(...data.map(d => d.close));
          const maxPrice = Math.max(...data.map(d => d.close));
          const range = maxPrice - minPrice;
          const padding = 50;
          
          let pathD = '';
          data.forEach((d, idx) => {
            const x = padding + (idx * (600 - 2 * padding)) / (data.length - 1);
            const y = 300 - padding - ((d.close - minPrice) * (300 - 2 * padding)) / range;
            pathD += `${idx === 0 ? 'M' : 'L'} ${x} ${y} `;
          });
          
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', pathD);
          path.setAttribute('stroke', '#3b82f6');
          path.setAttribute('stroke-width', '2');
          path.setAttribute('fill', 'none');
          svg.appendChild(path);
          rechartsContainer.appendChild(svg);
          rechartsTimes.push(performance.now() - start);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      
      newResults.push({
        qurve: avg(qurveTimes),
        visx: avg(visxTimes),
        recharts: avg(rechartsTimes),
      });
    }
    
    setResults(newResults);
    setIsRunning(false);
  };
  
  return (
    <BenchmarkCard 
      title="LinePath" 
      description="Линия, построенная по набору точек. Симулирует реальный график акций."
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[#999] uppercase tracking-wider">Точек</span>
        <span className="text-xs text-[#999] uppercase tracking-wider">Qurve</span>
        <span className="text-xs text-[#999] uppercase tracking-wider">Visx</span>
        <span className="text-xs text-[#999] uppercase tracking-wider">Recharts</span>
      </div>
      
      {results.length > 0 ? (
        <div>
          {results.map((r, i) => (
            <BenchmarkRow 
              key={DATA_POINTS[i]} 
              dataPoints={DATA_POINTS[i]} 
              qurveTime={r.qurve}
              visxTime={r.visx}
              rechartsTime={r.recharts}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[#999]">
          Нажмите «Запустить» для начала тестирования
        </div>
      )}
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className="px-4 py-2 bg-[#1a1a1a] text-white text-sm font-medium rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          {isRunning ? 'Запуск...' : 'Запустить'}
        </button>
      </div>
      
      <div className="hidden">
        {DATA_POINTS.map(points => (
          <div key={points}>
            <div id={`qurve-linepath-${points}`} />
            <div id={`visx-linepath-${points}`} />
            <div id={`recharts-linepath-${points}`} />
          </div>
        ))}
      </div>
    </BenchmarkCard>
  );
}

function CircleBenchmark() {
  const [results, setResults] = useState<{ qurve: number; visx: number; recharts: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const runBenchmark = async () => {
    setIsRunning(true);
    const newResults: { qurve: number; visx: number; recharts: number }[] = [];
    
    for (const points of DATA_POINTS) {
      const circles = Array.from({ length: points }, () => ({
        x: Math.random() * 300,
        y: Math.random() * 300,
        r: 5 + Math.random() * 15,
      }));
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const qurveTimes: number[] = [];
      const visxTimes: number[] = [];
      const rechartsTimes: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const qurveContainer = document.getElementById(`qurve-circle-${points}`);
        const visxContainer = document.getElementById(`visx-circle-${points}`);
        const rechartsContainer = document.getElementById(`recharts-circle-${points}`);
        
        if (qurveContainer) {
          const start = performance.now();
          qurveContainer.innerHTML = '';
          const ctx = document.createElement('canvas');
          ctx.width = 300;
          ctx.height = 300;
          qurveContainer.appendChild(ctx);
          const context = ctx.getContext('2d');
          if (context) {
            circles.forEach(c => {
              context.beginPath();
              context.arc(c.x, c.y, c.r, 0, Math.PI * 2);
              context.fillStyle = '#3b82f6';
              context.fill();
            });
          }
          qurveTimes.push(performance.now() - start);
        }
        
        if (visxContainer) {
          const start = performance.now();
          visxContainer.innerHTML = '';
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '300');
          svg.setAttribute('height', '300');
          
          circles.forEach(c => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', String(c.x));
            circle.setAttribute('cy', String(c.y));
            circle.setAttribute('r', String(c.r));
            circle.setAttribute('fill', '#3b82f6');
            svg.appendChild(circle);
          });
          
          visxContainer.appendChild(svg);
          visxTimes.push(performance.now() - start);
        }
        
        if (rechartsContainer) {
          const start = performance.now();
          rechartsContainer.innerHTML = '';
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '300');
          svg.setAttribute('height', '300');
          
          circles.forEach(c => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', String(c.x));
            circle.setAttribute('cy', String(c.y));
            circle.setAttribute('r', String(c.r));
            circle.setAttribute('fill', '#3b82f6');
            svg.appendChild(circle);
          });
          
          rechartsContainer.appendChild(svg);
          rechartsTimes.push(performance.now() - start);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      
      newResults.push({
        qurve: avg(qurveTimes),
        visx: avg(visxTimes),
        recharts: avg(rechartsTimes),
      });
    }
    
    setResults(newResults);
    setIsRunning(false);
  };
  
  return (
    <BenchmarkCard 
      title="Circle" 
      description="Отрисовка множества окружностей. Тестирует производительность при большом количестве элементов."
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[#999] uppercase tracking-wider">Точек</span>
        <span className="text-xs text-[#999] uppercase tracking-wider">Qurve</span>
        <span className="text-xs text-[#999] uppercase tracking-wider">Visx</span>
        <span className="text-xs text-[#999] uppercase tracking-wider">Recharts</span>
      </div>
      
      {results.length > 0 ? (
        <div>
          {results.map((r, i) => (
            <BenchmarkRow 
              key={DATA_POINTS[i]} 
              dataPoints={DATA_POINTS[i]} 
              qurveTime={r.qurve}
              visxTime={r.visx}
              rechartsTime={r.recharts}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[#999]">
          Нажмите «Запустить» для начала тестирования
        </div>
      )}
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className="px-4 py-2 bg-[#1a1a1a] text-white text-sm font-medium rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          {isRunning ? 'Запуск...' : 'Запустить'}
        </button>
      </div>
      
      <div className="hidden">
        {DATA_POINTS.map(points => (
          <div key={points}>
            <div id={`qurve-circle-${points}`} />
            <div id={`visx-circle-${points}`} />
            <div id={`recharts-circle-${points}`} />
          </div>
        ))}
      </div>
    </BenchmarkCard>
  );
}

export function Benchmarks() {
  return (
    <section>
      <div className="mb-12">
        <h2 className="text-lg font-medium mb-4 text-[#1a1a1a] tracking-tight" style={{ textWrap: 'balance' }}>
          Benchmarks — сравнение производительности
        </h2>
        <p className="text-[#666] leading-relaxed max-w-2xl">
          Тестирование времени рендеринга различных библиотек. 
          Все измерения выполняются в браузере и могут варьироваться в зависимости от устройства.
        </p>
      </div>
      
      <div className="grid gap-8">
        <LineBenchmark />
        <LinePathBenchmark />
        <CircleBenchmark />
      </div>
    </section>
  );
}
