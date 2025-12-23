
import React, { useState, useEffect, useMemo } from 'react';
import { X, Building2, Check, Search, Grid, Layers, CheckSquare, XSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { mockBuilding } from '../services/mockData';
import { PROJECTS } from '../App';

interface UnitSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedByProject: Record<string, string[]>) => void;
  initialSelection?: Record<string, string[]>;
}

export const UnitSelectionModal: React.FC<UnitSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSelection = {},
}) => {
  const [currentProject, setCurrentProject] = useState<string>('');
  const [projectSearch, setProjectSearch] = useState('');
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});
  const [activeProjects, setActiveProjects] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(0.8);

  const filteredProjects = useMemo(() => PROJECTS.filter(p => p.toLowerCase().includes(projectSearch.toLowerCase())), [projectSearch]);

  useEffect(() => {
    if (isOpen) {
      const selectionKeys = Object.keys(initialSelection);
      const initialActive = selectionKeys.length > 0 ? new Set(selectionKeys) : new Set(PROJECTS);
      const initialUnitSelections: Record<string, Set<string>> = {};
      
      PROJECTS.forEach(p => {
        const hasSelection = selectionKeys.includes(p);
        initialUnitSelections[p] = new Set(hasSelection ? initialSelection[p] : mockBuilding.units.map(u => u.id));
      });
      
      setSelections(initialUnitSelections);
      setActiveProjects(initialActive);
      setCurrentProject(PROJECTS.find(p => initialActive.has(p)) || PROJECTS[0]);
    }
  }, [isOpen, initialSelection]);

  const toggleUnit = (projectId: string, unitId: string) => {
    if (!activeProjects.has(projectId)) return;
    setSelections(prev => {
      const newSet = new Set(prev[projectId]);
      if (newSet.has(unitId)) newSet.delete(unitId); else newSet.add(unitId);
      return { ...prev, [projectId]: newSet };
    });
  };

  const selectAllInProject = (projectId: string) => {
    setSelections(prev => ({
      ...prev,
      [projectId]: new Set(mockBuilding.units.map(u => u.id))
    }));
  };

  const deselectAllInProject = (projectId: string) => {
    setSelections(prev => ({
      ...prev,
      [projectId]: new Set()
    }));
  };

  const selectFloor = (projectId: string, sectionId: number, floor: number) => {
    const floorUnits = mockBuilding.units.filter(u => u.section === sectionId && u.floor === floor);
    setSelections(prev => {
      const newSet = new Set(prev[projectId]);
      const someSelected = floorUnits.some(u => newSet.has(u.id));
      floorUnits.forEach(u => someSelected ? newSet.delete(u.id) : newSet.add(u.id));
      return { ...prev, [projectId]: newSet };
    });
  };

  const selectRiser = (projectId: string, sectionId: number, riser: number) => {
    const riserUnits = mockBuilding.units.filter(u => u.section === sectionId && u.riser === riser);
    setSelections(prev => {
      const newSet = new Set(prev[projectId]);
      const someSelected = riserUnits.some(u => newSet.has(u.id));
       riserUnits.forEach(u => someSelected ? newSet.delete(u.id) : newSet.add(u.id));
      return { ...prev, [projectId]: newSet };
    });
  };

  const handleSave = () => {
    const result: Record<string, string[]> = {};
    activeProjects.forEach(projectName => {
      result[projectName] = Array.from(selections[projectName] || []);
    });
    onSave(result);
    onClose();
  };

  if (!isOpen) return null;

  const sections = Array.from({ length: mockBuilding.sectionsCount }, (_, i) => i + 1);
  const maxFloors = mockBuilding.floors;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white overflow-hidden animate-fade-in-up font-sans text-[12px]">
      <div className="w-full h-full flex flex-row">
        
        <div className="w-72 border-r bg-gray-50 flex flex-col shrink-0 z-20">
          <div className="p-6 border-b bg-white">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter"><Building2 size={20} className="text-primary" /> Каталог</h2>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14}/>
              <input type="text" value={projectSearch} onChange={e => setProjectSearch(e.target.value)} placeholder="Поиск ЖК..." className="UNI_input h-9 text-[12px] pl-9 bg-gray-50 font-bold border-gray-100"/>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {filteredProjects.map(project => {
              const isActivated = activeProjects.has(project);
              const count = selections[project]?.size || 0;
              const isActive = currentProject === project;
              
              return (
                <button key={project} onClick={() => setCurrentProject(project)} className={`w-full text-left p-4 rounded-xl transition-all border-2 flex items-center justify-between group ${isActive ? 'bg-white border-primary shadow-lg' : 'bg-transparent border-transparent hover:bg-gray-100'}`}>
                    <div className="min-w-0 flex items-center gap-3">
                      <div onClick={(e) => { e.stopPropagation(); setActiveProjects(p => { const n = new Set(p); if (n.has(project)) n.delete(project); else n.add(project); return n; }); }} className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${isActivated ? 'bg-primary border-primary' : 'bg-white border-gray-200 group-hover:border-gray-300'}`}>{isActivated && <Check size={12} className="text-white stroke-[4]" />}</div>
                      <div className="min-w-0">
                        <div className={`text-[13px] font-black truncate ${isActive ? 'text-primary' : (isActivated ? 'text-gray-900' : 'text-gray-400')}`}>{project}</div>
                        {isActivated && <div className="text-[11px] text-gray-400 font-black mt-0.5 uppercase tracking-widest">{count} лотов</div>}
                      </div>
                    </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden relative">
          <div className="flex items-center justify-between px-8 py-5 border-b shrink-0 bg-white z-10 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{currentProject}</h2>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <Button onClick={() => selectAllInProject(currentProject)} className="h-10 px-5 rounded-lg font-bold text-[12px] uppercase tracking-wider">
                     Выбрать все
                   </Button>
                   <Button variant="outline" onClick={() => deselectAllInProject(currentProject)} className="h-10 px-5 rounded-lg font-bold text-[12px] uppercase tracking-wider text-primary border-primary/20 bg-blue-50/50">
                     Снять все
                   </Button>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 px-5 py-2.5 rounded-xl border border-gray-100 shadow-inner">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">ЗУМ: {Math.round(zoom * 100)}%</span>
                  <input type="range" min="0.3" max="1.5" step="0.05" value={zoom} onChange={e => setZoom(+e.target.value)} className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                
                <button onClick={onClose} className="p-2.5 hover:bg-red-50 text-gray-300 hover:text-danger rounded-xl transition-all"><X size={32} /></button>
            </div>
          </div>

           <div className="flex-1 overflow-auto bg-gray-50/50">
            <div className="p-12 w-full flex justify-center origin-top transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
                <div className="flex gap-16 items-start pb-12">
                    {sections.map(sectionId => {
                        const sectionHeight = mockBuilding.sectionHeights[sectionId - 1];
                        return (
                            <div key={sectionId} className="flex flex-col bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">
                                <div className="text-center py-6 border-b border-gray-50">
                                   <div className="text-[12px] font-bold text-[#A7B6C8] uppercase tracking-[0.2em] mb-4">Секция {sectionId}</div>
                                   <div className="flex justify-center ml-12 gap-2 pr-6">
                                      {Array.from({ length: mockBuilding.unitsPerFloor }, (_, i) => i + 1).map(riser => (
                                        <button 
                                          key={riser} 
                                          onClick={() => selectRiser(currentProject, sectionId, riser)}
                                          className="w-[100px] text-[11px] font-bold text-[#A7B6C8] hover:text-primary uppercase tracking-tighter"
                                        >
                                          СТ.{riser}
                                        </button>
                                      ))}
                                   </div>
                                </div>
                                
                                <div className="p-8 space-y-2 relative">
                                    {Array.from({ length: maxFloors }, (_, i) => maxFloors - i).map(floor => {
                                        const isFloorExists = floor <= sectionHeight;
                                        return (
                                            <div key={floor} className={`flex items-center ${!isFloorExists ? 'opacity-0 pointer-events-none' : ''}`}>
                                                <button 
                                                  onClick={() => selectFloor(currentProject, sectionId, floor)}
                                                  className="w-12 h-16 text-[12px] font-bold text-[#A7B6C8] hover:text-primary flex items-center justify-center shrink-0"
                                                >
                                                    {floor}
                                                </button>
                                                {Array.from({ length: mockBuilding.unitsPerFloor }, (_, i) => i + 1).map(riser => {
                                                    const unit = isFloorExists ? mockBuilding.units.find(u => u.floor === floor && u.riser === riser && u.section === sectionId) : null;
                                                    if (!unit) return <div key={riser} className="w-[100px] h-[72px] mx-1" />;
                                                    const isSelected = selections[currentProject]?.has(unit.id);
                                                    return (
                                                        <div 
                                                          key={unit.id} 
                                                          onClick={() => toggleUnit(currentProject, unit.id)} 
                                                          className={`w-[100px] h-[72px] mx-1 rounded-[10px] border flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-[#6699CC] border-[#6699CC] text-white shadow-lg' : 'bg-[#EAECEF] border-transparent text-[#5C6E84] hover:border-gray-300'}`}
                                                        >
                                                            <div className={`text-[16px] font-bold ${isSelected ? 'text-white' : 'text-[#2C3E50]'}`}>{unit.number}</div>
                                                            <div className={`text-[11px] font-medium mt-0.5 uppercase tracking-tight ${isSelected ? 'text-white/80' : 'text-[#7F8C8D]'}`}>{unit.rooms}К • {unit.area.toFixed(0)} м²</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>

          <div className="px-10 py-6 border-t bg-white flex justify-end gap-5 shrink-0 shadow-2xl z-[60]">
            <Button variant="secondary" onClick={onClose} className="h-12 px-10 text-[13px] font-black rounded-xl bg-gray-50 uppercase tracking-widest">Отмена</Button>
            <Button onClick={handleSave} className="h-12 px-14 text-[13px] font-black rounded-xl shadow-2xl shadow-primary/30 uppercase tracking-widest">Подтвердить выбор</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
