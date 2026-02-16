import { ChartProvider } from "../../src/components/ChartContext";
import { Line } from "../../src/components/Line";
import { LinePath } from "../../src/components/LinePath";
import { Circle } from "../../src/components/Circle";
import { useMemo } from "react";
import { appleStock } from "../../src/mock";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <h2 className="text-lg font-medium mb-6 text-[#1a1a1a] tracking-tight" style={{ textWrap: 'balance' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function LineExample() {
  const width = 400;
  const height = 200;
  const padding = 40;

  return (
    <ChartProvider width={width} height={height}>
      <Line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={padding}
        color="#ef4444"
        lineWidth={3}
      />
      <Line
        x1={padding}
        y1={height - padding}
        x2={padding}
        y2={padding}
        color="#666"
        lineWidth={2}
      />
    </ChartProvider>
  );
}

function LinePathExample() {
  const width = 600;
  const height = 300;
  const padding = 50;

  const filteredData = useMemo(() => {
    return appleStock.slice(0, 50);
  }, []);

  const minPrice = Math.min(...filteredData.map((d) => d.close));
  const maxPrice = Math.max(...filteredData.map((d) => d.close));
  const priceRange = maxPrice - minPrice;

  const getX = (index: number) =>
    padding + (index * (width - 2 * padding)) / (filteredData.length - 1);
  const getY = (price: number) =>
    height - padding - ((price - minPrice) * (height - 2 * padding)) / priceRange;

  return (
    <ChartProvider width={width} height={height}>
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
      <LinePath data={filteredData} getX={getX} getY={getY} />
    </ChartProvider>
  );
}

function CircleExample() {
  const width = 300;
  const height = 300;
  const padding = 50;

  return (
    <ChartProvider width={width} height={height}>
      <Circle
        x={width / 2}
        y={height / 2}
        radius={80}
        fill="#3b82f6"
        stroke="#1d4ed8"
        lineWidth={3}
      />
      <Circle
        x={width / 2 - 40}
        y={height / 2 - 30}
        radius={15}
        fill="#fff"
      />
      <Circle
        x={width / 2 + 40}
        y={height / 2 - 30}
        radius={15}
        fill="#fff"
      />
      <Circle
        x={width / 2}
        y={height / 2 + 20}
        radius={25}
        fill="#ef4444"
      />
    </ChartProvider>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <header className="mb-20">
          <h1 className="text-4xl font-medium mb-4 text-[#1a1a1a] tracking-tight" style={{ textWrap: 'balance' }}>
            Qurve
          </h1>
          <p className="text-[#666] text-lg leading-relaxed max-w-2xl" style={{ textWrap: 'balance' }}>
            Библиотека для построения графиков на Canvas. 
            Лёгкая, быстрая и гибкая альтернатива D3 для React-приложений.
          </p>
        </header>

        <main>
          <Section title="Line — базовые линии">
            <p className="text-[#555] mb-8 leading-relaxed max-w-xl">
              Компонент для рисования линии между двумя точками. 
              Подходит для осей координат, сеток и простых графиков.
            </p>
            <div className="bg-white rounded-sm p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <LineExample />
            </div>
          </Section>

          <Section title="LinePath — пути по данным">
            <p className="text-[#555] mb-8 leading-relaxed max-w-xl">
              Рисует линию через набор точек. Автоматически масштабирует данные 
              в заданные размеры canvas.
            </p>
            <div className="bg-white rounded-sm p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <LinePathExample />
            </div>
          </Section>

          <Section title="Circle — окружности">
            <p className="text-[#555] mb-8 leading-relaxed max-w-xl">
              Рисует окружности с заливкой и обводкой. Используется для точек 
              на графиках, маркеров и визуальных элементов.
            </p>
            <div className="bg-white rounded-sm p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <CircleExample />
            </div>
          </Section>
        </main>

        <footer className="mt-24 pt-8 border-t border-[#eaeaea]">
          <p className="text-[#999] text-sm">
            Proof of concept
          </p>
        </footer>
      </div>
    </div>
  );
}
