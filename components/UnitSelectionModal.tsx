
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Grip, ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { mockBuilding } from '../services/mockData';

interface UnitSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
  initialSelection?: string[];
}

export const UnitSelectionModal: React.FC<UnitSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSelection
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (isOpen) {
      if (initialSelection && initialSelection.length > 0) {
        setSelectedIds(new Set(initialSelection));
      } else {
        setSelectedIds(new Set(mockBuilding.units.map(u => u.id)));
      }
    }
  }, [isOpen, initialSelection]);

  const toggleUnit = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleFloorInSection = (floor: number, section: number) => {
    const unitsOnFloor = mockBuilding.units.filter(u => u.floor === floor && u.section === section);
    const allSelected = unitsOnFloor.every(u => selectedIds.has(u.id));
    const newSet = new Set(selectedIds);
    unitsOnFloor.forEach(u => allSelected ? newSet.delete(u.id) : newSet.add(u.id));
    setSelectedIds(newSet);
  };

  const toggleRiserInSection = (riser: number, section: number) => {
    const unitsInRiser = mockBuilding.units.filter(u => u.riser === riser && u.section === section);
    const allSelected = unitsInRiser.every(u => selectedIds.has(u.id));
    const newSet = new Set(selectedIds);
    unitsInRiser.forEach(u => allSelected ? newSet.delete(u.id) : newSet.add(u.id));
    setSelectedIds(newSet);
  };

  const selectAll = () => setSelectedIds(new Set(mockBuilding.units.map(u => u.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const handleSave = () => {
    if (selectedIds.size === mockBuilding.units.length) onSave([]);
    else onSave(Array.from(selectedIds));
    onClose();
  };

  if (!isOpen) return null;

  const sections = Array.from({ length: mockBuilding.sectionsCount }, (_, i) => i + 1);
  const maxFloors = mockBuilding.floors;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white overflow-hidden animate-fade-in-up">
      <div className="w-full h-full flex flex-col bg-white">
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-white z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <Grip className="text-primary" size={22} /> 
            <h2 className="text-xl font-black text-gray-900 leading-none">Выбор помещений</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-95"><X size={28} className="text-gray-400" /></button>
        </div>

        {/* Панель управления */}
        <div className="px-6 py-3 bg-gray-50 border-b flex justify-between items-center shrink-0 z-30 shadow-inner">
           <div className="text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
             Выбрано: <span className="text-primary font-black">{selectedIds.size}</span> из {mockBuilding.units.length}
           </div>
           <div className="flex gap-3">
             <Button variant="outline" size="sm" onClick={deselectAll} className="h-9 py-0 text-xs px-4 font-bold border-gray-200 hover:border-red-200 hover:text-red-500">Снять всё</Button>
             <Button variant="outline" size="sm" onClick={selectAll} className="h-9 py-0 text-xs px-4 font-bold border-gray-200 hover:border-primary">Выбрать всё</Button>
           </div>
        </div>

        {/* Шахматка */}
        <div className="flex-1 overflow-auto bg-gray-50/50">
            <div className="p-10 min-w-max min-h-full flex items-start justify-center">
                <div className="flex gap-10 items-stretch pb-16">
                    {sections.map(sectionId => {
                        const sectionHeight = mockBuilding.sectionHeights[sectionId - 1];
                        const allFloors = Array.from({ length: maxFloors }, (_, i) => maxFloors - i);
                        
                        return (
                            <div key={sectionId} className="flex flex-col bg-gray-100/50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden min-w-[380px] group">
                                {/* Прилипающий заголовок секции и стояков - всегда вверху и выровнен */}
                                <div className="sticky top-0 bg-white z-20 border-b p-4 shadow-sm group-hover:bg-blue-50/30 transition-colors">
                                    <div className="text-center font-black text-gray-400 mb-4 uppercase tracking-[0.2em] text-[10px] border-b border-gray-50 pb-2">Секция {sectionId}</div>
                                    <div className="flex justify-center">
                                        <div className="w-10 mr-1.5 opacity-0">—</div>
                                        {Array.from({ length: mockBuilding.unitsPerFloor }, (_, i) => i + 1).map(riser => (
                                            <button 
                                                key={riser} 
                                                onClick={() => toggleRiserInSection(riser, sectionId)} 
                                                className="w-20 h-8 flex items-center justify-center text-[10px] font-black text-gray-400 hover:text-primary hover:bg-white rounded-lg mx-1 transition-all border border-transparent hover:border-primary/20 hover:shadow-sm uppercase"
                                            >
                                                Ст.{riser}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Сетка квартир */}
                                <div className="flex flex-col p-5 pt-8 flex-1">
                                    {allFloors.map(floor => {
                                        const isFloorExists = floor <= sectionHeight;
                                        
                                        return (
                                            <div key={floor} className={`flex items-center mb-1.5 justify-center ${!isFloorExists ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
                                                <button 
                                                    onClick={() => toggleFloorInSection(floor, sectionId)} 
                                                    disabled={!isFloorExists}
                                                    title={isFloorExists ? `Выбрать этаж ${floor}` : ''}
                                                    className={`w-10 h-12 flex items-center justify-center text-[11px] font-black rounded-md transition-all mr-1.5 border ${isFloorExists ? 'text-gray-300 hover:text-primary hover:bg-white border-transparent hover:border-gray-200' : 'text-gray-200 border-gray-100'}`}
                                                >
                                                    {floor}
                                                </button>

                                                {Array.from({ length: mockBuilding.unitsPerFloor }, (_, i) => i + 1).map(riser => {
                                                    const unit = isFloorExists ? mockBuilding.units.find(u => u.floor === floor && u.riser === riser && u.section === sectionId) : null;
                                                    
                                                    if (!unit) return <div key={`${floor}-${riser}`} className={`w-20 h-12 mx-1 rounded-lg border-2 ${!isFloorExists ? 'border-dashed border-gray-200 bg-gray-50/50' : 'border-transparent'}`}></div>;
                                                    
                                                    const isSelected = selectedIds.has(unit.id);
                                                    return (
                                                        <div 
                                                            key={unit.id} 
                                                            onClick={() => toggleUnit(unit.id)} 
                                                            className={`w-20 h-12 mx-1 rounded-lg border-2 cursor-pointer flex flex-col items-center justify-center transition-all duration-200 select-none ${isSelected ? 'bg-primary border-primary text-white shadow-xl scale-105 z-10' : 'bg-white border-white text-gray-500 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'}`}
                                                        >
                                                            <span className="text-[12px] font-black leading-none">{unit.number}</span>
                                                            <span className={`text-[9px] mt-1 font-bold whitespace-nowrap tracking-tight ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                                                {unit.rooms}К • {Math.round(unit.area)} м²
                                                            </span>
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

        {/* Подвал */}
        <div className="px-8 py-5 border-t bg-white flex justify-end gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30">
          <Button variant="secondary" onClick={onClose} className="px-8 h-12 text-sm rounded-xl font-bold border-gray-200 transition-all hover:bg-gray-50">Отмена</Button>
          <Button onClick={handleSave} className="px-12 h-12 text-sm font-black rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">Подтвердить выбор</Button>
        </div>
      </div>
    </div>
  );
};
