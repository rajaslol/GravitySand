import React, { useState } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import ControlPanel from './components/ControlPanel';
import { ParticleType } from './types';

const App: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<ParticleType>(ParticleType.SAND);
  const [brushSize, setBrushSize] = useState<number>(4);
  const [clearTrigger, setClearTrigger] = useState<number>(0);

  const handleClear = () => {
    setClearTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 text-black selection:bg-black selection:text-white">
      
      {/* Header */}
      <header className="mb-10 text-center relative w-full max-w-4xl flex flex-col items-center justify-center gap-4">
        <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-2xl md:text-3xl leading-relaxed text-black uppercase">
             RETRO SAND
            </h1>
            <div className="w-full h-1 bg-black my-2"></div>
            <p className="text-[10px] md:text-xs text-black uppercase tracking-widest">
            V 1.0 // SIMULATION
            </p>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-8">
        
        {/* Controls Section */}
        <section className="w-full bg-white border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
           {/* Decorative corner pixels */}
           <div className="absolute top-0 left-0 w-2 h-2 bg-black"></div>
           <div className="absolute top-0 right-0 w-2 h-2 bg-black"></div>
           <div className="absolute bottom-0 left-0 w-2 h-2 bg-black"></div>
           <div className="absolute bottom-0 right-0 w-2 h-2 bg-black"></div>

           <div className="mb-4 text-xs text-center border-b-4 border-black pb-2 uppercase">Tool Select</div>
           
           <ControlPanel 
              selectedMaterial={selectedMaterial} 
              onSelect={setSelectedMaterial} 
              onClear={handleClear}
            />
            
            {/* Settings (Brush Size) */}
            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 px-4 pt-4 border-t-4 border-black border-dotted">
              <label htmlFor="brushSize" className="text-xs uppercase text-black">
                Brush Size
              </label>
              <div className="flex items-center gap-4">
                <button 
                    onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                    className="w-8 h-8 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 flex items-center justify-center hover:bg-gray-100"
                >-</button>
                
                <div className="w-32 md:w-48 h-6 border-2 border-black relative bg-gray-200">
                    <div 
                        className="h-full bg-black absolute top-0 left-0"
                        style={{ width: `${(brushSize / 12) * 100}%` }}
                    ></div>
                    {/* Native slider hidden on top for interaction */}
                    <input
                        id="brushSize"
                        type="range"
                        min="1"
                        max="12"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>

                <button 
                    onClick={() => setBrushSize(Math.min(12, brushSize + 1))}
                    className="w-8 h-8 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 flex items-center justify-center hover:bg-gray-100"
                >+</button>

                <div className="w-10 h-10 border-4 border-black flex items-center justify-center text-sm bg-white ml-2">
                    {brushSize}
                </div>
              </div>
            </div>
        </section>

        {/* Canvas Section */}
        <section className="relative w-full flex justify-center">
            <div className="relative border-4 border-black bg-black p-2 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <SimulationCanvas 
                  selectedMaterial={selectedMaterial}
                  brushSize={brushSize}
                  onClearTrigger={clearTrigger}
                />
            </div>
        </section>

        {/* Legend / Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-[10px]">
            {[
                { color: 'bg-amber-400', title: 'Sand', desc: 'GRAVITY: ON' },
                { color: 'bg-blue-500', title: 'Water', desc: 'LIQUID PHYS' },
                { color: 'bg-stone-500', title: 'Stone', desc: 'STATIC OBJ' },
            ].map((item) => (
                <div key={item.title} className="flex items-center gap-4 p-3 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-help">
                    <div className={`w-8 h-8 ${item.color} border-4 border-black`}></div>
                    <div className="flex flex-col gap-1">
                        <div className="font-bold uppercase text-black text-xs">{item.title}</div>
                        <div className="text-gray-600 uppercase font-mono tracking-tighter leading-none">{item.desc}</div>
                    </div>
                </div>
            ))}
        </section>
        
        <footer className="mt-8 text-[10px] text-center uppercase tracking-widest text-black/50 pb-8">
            Press start to play
        </footer>
      </main>
    </div>
  );
};

export default App;