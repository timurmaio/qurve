import { useState, useRef, useEffect } from "react";

const DATA_POINTS = [1000, 5000, 10000, 50000, 100000];

function generateData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: i,
    y: 100 + Math.sin(i / 100) * 50 + Math.random() * 20,
  }));
}

function BenchmarkRow({ 
  dataPoints, 
  qurveTime, 
  rechartsTime 
}: { 
  dataPoints: number;
  qurveTime: number;
  rechartsTime: number;
}) {
  const fastest = Math.min(qurveTime, rechartsTime);
  
  return (
    <div className="grid grid-cols-[100px_1fr_1fr] gap-4 py-3 border-b border-[#eaeaea] text-sm items-center">
      <span className="text-[#999] font-mono">{dataPoints.toLocaleString()}</span>
      <div className="flex items-center justify-between px-2">
        <span className={`font-mono ${qurveTime === fastest && qurveTime > 0 ? 'text-[#22c55e] font-medium' : 'text-[#666]'}`}>
          {qurveTime > 0 ? `${qurveTime.toFixed(1)} ms` : '—'}
        </span>
        {qurveTime > 0 && rechartsTime > 0 && (
          <span className="text-xs text-[#999]">
            {qurveTime < rechartsTime 
              ? `−${((1 - qurveTime/rechartsTime) * 100).toFixed(0)}%` 
              : `+${((qurveTime/rechartsTime - 1) * 100).toFixed(0)}%`
            }
          </span>
        )}
      </div>
      <div className="flex items-center justify-between px-2">
        <span className={`font-mono ${rechartsTime === fastest && rechartsTime > 0 ? 'text-[#22c55e] font-medium' : 'text-[#666]'}`}>
          {rechartsTime > 0 ? `${rechartsTime.toFixed(1)} ms` : '—'}
        </span>
      </div>
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

function renderQurveCanvas(container: HTMLElement, data: { x: number; y: number }[], width: number, height: number) {
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.scale(dpr, dpr);
  
  const padding = 40;
  const xScale = (width - 2 * padding) / (data.length - 1);
  const yMin = Math.min(...data.map(d => d.y));
  const yMax = Math.max(...data.map(d => d.y));
  const yRange = yMax - yMin;
  const yScale = (height - 2 * padding) / yRange;
  
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  data.forEach((d, i) => {
    const x = padding + i * xScale;
    const y = height - padding - (d.y - yMin) * yScale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  
  ctx.stroke();
}

function renderRechartsSvg(container: HTMLElement, data: { x: number; y: number }[], width: number, height: number) {
  container.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
  const padding = 40;
  const xScale = (width - 2 * padding) / (data.length - 1);
  const yMin = Math.min(...data.map(d => d.y));
  const yMax = Math.max(...data.map(d => d.y));
  const yRange = yMax - yMin;
  const yScale = (height - 2 * padding) / yRange;
  
  let pathD = '';
  data.forEach((d, i) => {
    const x = padding + i * xScale;
    const y = height - padding - (d.y - yMin) * yScale;
    pathD += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  });
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  path.setAttribute('stroke', '#3b82f6');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  svg.appendChild(path);
  
  container.appendChild(svg);
}

export function LineBenchmark() {
  return (
    <BenchmarkCard 
      title="Line Chart — Canvas vs SVG" 
      description="Rendering a line chart. Canvas should be faster with large datasets since it doesn't create DOM elements for each point."
    >
      <LineBenchmarkContent />
    </BenchmarkCard>
  );
}

function LineBenchmarkContent() {
  const [results, setResults] = useState<{ qurve: number; recharts: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [preview, setPreview] = useState<{ data: { x: number; y: number }[]; points: number } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewRechartsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (preview && previewRef.current && previewRechartsRef.current) {
      renderQurveCanvas(previewRef.current, preview.data, 600, 300);
      renderRechartsSvg(previewRechartsRef.current, preview.data, 600, 300);
    }
  }, [preview]);
  
  const runBenchmark = async () => {
    setIsRunning(true);
    setResults([]);
    const newResults: { qurve: number; recharts: number }[] = [];
    
    for (const points of DATA_POINTS) {
      const data = generateData(points);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const qurveContainer = document.getElementById(`qurve-line-${points}`);
      const rechartsContainer = document.getElementById(`recharts-line-${points}`);
      
      const iterations = 5;
      const qurveTimes: number[] = [];
      const rechartsTimes: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        if (qurveContainer) {
          const start = performance.now();
          renderQurveCanvas(qurveContainer, data, 600, 300);
          qurveTimes.push(performance.now() - start);
        }
        
        if (rechartsContainer) {
          const start = performance.now();
          renderRechartsSvg(rechartsContainer, data, 600, 300);
          rechartsTimes.push(performance.now() - start);
        }
        
        await new Promise(resolve => setTimeout(resolve, 16));
      }
      
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      
      newResults.push({
        qurve: avg(qurveTimes),
        recharts: avg(rechartsTimes),
      });
      
      setResults([...newResults]);
    }
    
    setIsRunning(false);
  };
  
  const showPreview = (points: number) => {
    setPreview({ data: generateData(points), points });
  };
  
  return (
    <>
      <div className="grid grid-cols-[100px_1fr_1fr] gap-4 mb-4 text-xs text-[#999] uppercase tracking-wider">
        <span>Points</span>
        <span className="px-2">Qurve (Canvas)</span>
        <span className="px-2">SVG baseline</span>
      </div>
      
      {results.length > 0 ? (
        <div>
          {results.map((r, i) => (
            <BenchmarkRow 
              key={DATA_POINTS[i]} 
              dataPoints={DATA_POINTS[i]} 
              qurveTime={r.qurve}
              rechartsTime={r.recharts}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[#999]">
          Click "Run" to start benchmarking
        </div>
      )}
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className="px-4 py-2 bg-[#1a1a1a] text-white text-sm font-medium rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
        
        {!isRunning && results.length > 0 && (
          <button
            onClick={() => showPreview(DATA_POINTS[Math.min(2, DATA_POINTS.length - 1)])}
            className="px-4 py-2 border border-[#eaeaea] text-[#666] text-sm font-medium rounded-sm hover:bg-[#fafafa] transition-colors"
          >
            Preview
          </button>
        )}
      </div>
      
      <div className="hidden">
        {DATA_POINTS.map(points => (
          <div key={points}>
            <div id={`qurve-line-${points}`} className="w-[600px] h-[300px] bg-white" />
            <div id={`recharts-line-${points}`} className="w-[600px] h-[300px] bg-white" />
          </div>
        ))}
      </div>
      
      {preview && (
        <div className="mt-8 pt-6 border-t border-[#eaeaea]">
          <h4 className="text-sm font-medium mb-4 text-[#1a1a1a]">Visual Comparison ({preview.points.toLocaleString()} points)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#999] mb-2">Qurve (Canvas)</p>
              <div ref={previewRef} className="w-full aspect-video bg-white border border-[#eaeaea]" />
            </div>
            <div>
              <p className="text-xs text-[#999] mb-2">SVG baseline</p>
              <div ref={previewRechartsRef} className="w-full aspect-video bg-white border border-[#eaeaea]" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Benchmarks() {
  return (
    <section>
      <div className="mb-12">
        <h2 className="text-lg font-medium mb-4 text-[#1a1a1a] tracking-tight" style={{ textWrap: 'balance' }}>
          Benchmarks — Performance Comparison
        </h2>
        <p className="text-[#666] leading-relaxed max-w-2xl">
          Rendering performance test: Canvas (Qurve) vs plain SVG baseline. 
          With large datasets, Canvas should be faster since it doesn't create DOM elements for each data point.
        </p>
      </div>
      
      <div className="grid gap-8">
        <LineBenchmark />
      </div>
    </section>
  );
}
