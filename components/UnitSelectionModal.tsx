
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Grip, Building2, ChevronRight, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { mockBuilding } from '../services/mockData';

interface UnitSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedByProject: Record<string, string[]>) => void;
  initialSelection?: Record<string, string[]>;
  activeProjects: string[];
}

export const UnitSelectionModal: React.FC<UnitSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSelection = {},
  activeProjects
}) => {
  // Выбранный проект для отображения шахматки
  const [currentProject, setCurrentProject] = useState<string>(activeProjects[0] || '');
  // Храним выбор: ProjectName -> Set of UnitIDs
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, Set<string>> = {};
      activeProjects.forEach(p => {
        initial[p] = new Set(initialSelection[p] || []);
      });
      setSelections(initial);
      if (!currentProject && activeProjects.length > 0) setCurrentProject(activeProjects[0]);
    }
  }, [isOpen, initialSelection, activeProjects]);

  const toggleUnit = (projectId: string, unitId: string) => {
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

  const handleSave = () => {
    const result: Record<string, string[]> = {};
    Object.entries(selections).forEach(([p, set]) => {
      result[p] = Array.from(set);
    });
    onSave(result);
    onClose();
  };

  if (!isOpen) return null;

  const sections = Array.from({ length: mockBuilding.sectionsCount }, (_, i) => i + 1);
  const maxFloors = mockBuilding.floors;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white overflow-hidden animate-fade-in-up">
      <div className="w-full h-full flex flex-row bg-white">
        
        {/* Боковая панель проектов */}
        <div className="w-80 border-r bg-gray-50 flex flex-col shrink-0">
          <div className="p-6 border-b bg-white">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Building2 size={20} className="text-primary" />
              Проекты
            </h2>
            <p className="text-[11px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Выберите ЖК для настройки</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeProjects.map(project => {
              const count = selections[project]?.size || 0;
              const isAll = count === mockBuilding.units.length;
              const isActive = currentProject === project;
              
              return (
                <button 
                  key={project}
                  onClick={() => setCurrentProject(project)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center justify-between group ${isActive ? 'bg-white border-primary shadow-md' : 'bg-transparent border-transparent hover:bg-gray-100'}`}
                >
                  <div className="min-w-0">
                    <div className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-gray-700'}`}>{project}</div>
                    <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                      {isAll ? 'Все помещения' : count > 0 ? `Выбрано: ${count} лотов` : 'Помещения не выбраны'}
                    </div>
                  </div>
                  {isAll ? <Check size={16} className="text-primary shrink-0" /> : <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />}
                </button>
              );
            })}
          </div>
          <div className="p-4 bg-blue-50/50 border-t">
            <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
              Настройки шахматки индивидуальны для каждого проекта. Если проект не выбран в списке слева, программа для него не применится.
            </p>
          </div>
        </div>

        {/* Правая часть: Шахматка выбранного проекта */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex items-center justify-between px-8 py-4 border-b shrink-0">
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-none">{currentProject}</h2>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">Настройка пула помещений для текущего ЖК</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => deselectAllInProject(currentProject)} className="h-9 px-4 text-[11px] font-bold border-gray-200">Снять выделение</Button>
                <Button variant="outline" size="sm" onClick={() => selectAllInProject(currentProject)} className="h-9 px-4 text-[11px] font-bold border-gray-200">Выбрать всё в ЖК</Button>
                <button onClick={onClose} className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-50/30">
            <div className="p-10 min-w-max flex justify-center">
                <div className="flex gap-8 items-start">
                    {sections.map(sectionId => {
                        const sectionHeight = mockBuilding.sectionHeights[sectionId - 1];
                        return (
                            <div key={sectionId} className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-[320px]">
                                <div className="bg-gray-50/50 border-b p-3 text-center">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Секция {sectionId}</div>
                                </div>
                                <div className="p-5">
                                    {Array.from({ length: maxFloors }, (_, i) => maxFloors - i).map(floor => {
                                        const isFloorExists = floor <= sectionHeight;
                                        return (
                                            <div key={floor} className={`flex items-center mb-1 justify-center ${!isFloorExists ? 'opacity-10 pointer-events-none' : ''}`}>
                                                <span className="w-8 text-[10px] font-black text-gray-300 mr-2 text-center">{floor}</span>
                                                {Array.from({ length: mockBuilding.unitsPerFloor }, (_, i) => i + 1).map(riser => {
                                                    const unit = isFloorExists ? mockBuilding.units.find(u => u.floor === floor && u.riser === riser && u.section === sectionId) : null;
                                                    if (!unit) return <div key={riser} className="w-14 h-10 mx-0.5 bg-transparent" />;
                                                    
                                                    const isSelected = selections[currentProject]?.has(unit.id);
                                                    return (
                                                        <div 
                                                          key={unit.id}
                                                          onClick={() => toggleUnit(currentProject, unit.id)}
                                                          className={`w-14 h-10 mx-0.5 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white font-bold text-[10px]' : 'bg-white border-gray-100 text-gray-400 text-[10px] hover:border-primary/30'}`}
                                                        >
                                                            {unit.number}
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

          <div className="px-8 py-5 border-t bg-white flex justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <Button variant="secondary" onClick={onClose} className="h-12 px-8 font-bold">Отмена</Button>
            <Button onClick={handleSave} className="h-12 px-12 font-black shadow-lg shadow-primary/20">Сохранить выбор лотов</Button>
          </div>
        </div>
      </div>
    </div>
  );
};


