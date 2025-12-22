
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white overflow-hidden animate-fade-in-up">
      <div className="w-full h-full flex flex-col bg-white">
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-3 border-b shrink-0 bg-white z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <Grip className="text-primary" size={20} /> 
            <h2 className="text-lg font-bold text-gray-900 leading-none">Выбор помещений</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors active:scale-95"><X size={24} className="text-gray-400" /></button>
        </div>

        {/* Панель управления */}
        <div className="px-6 py-2 bg-gray-50 border-b flex justify-between items-center shrink-0 z-30">
           <div className="text-xs font-semibold text-gray-700 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
             Выбрано: <span className="text-primary font-bold">{selectedIds.size}</span> из {mockBuilding.units.length}
           </div>
           <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={deselectAll} className="h-8 py-0 text-xs px-3">Снять всё</Button>
             <Button variant="outline" size="sm" onClick={selectAll} className="h-8 py-0 text-xs px-3">Выбрать всё</Button>
           </div>
        </div>

        {/* Шахматка */}
        <div className="flex-1 overflow-auto bg-gray-50/30">
            <div className="p-6 min-h-full flex items-end">
                <div className="inline-flex gap-6 items-end pb-8">
                    {sections.map(sectionId => {
                        const sectionHeight = mockBuilding.sectionHeights[sectionId - 1];
                        const sectionFloors = Array.from({ length: sectionHeight }, (_, i) => sectionHeight - i);
                        
                        return (
                            <div key={sectionId} className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow self-end overflow-hidden">
                                {/* Прилипающий заголовок секции и стояков */}
                                <div className="sticky top-0 bg-white z-20 border-b p-3 shadow-sm">
                                    <div className="text-center font-black text-gray-400 mb-2 uppercase tracking-widest text-[9px]">Секция {sectionId}</div>
                                    <div className="flex">
                                        <div className="w-8 mr-1"></div>
                                        {Array.from({ length: mockBuilding.unitsPerFloor }, (_, i) => i + 1).map(riser => (
                                            <button 
                                                key={riser} 
                                                onClick={() => toggleRiserInSection(riser, sectionId)} 
                                                className="w-20 h-6 flex items-center justify-center text-[8px] font-bold text-gray-400 hover:text-primary hover:bg-blue-50 rounded mx-0.5 transition-colors border border-transparent hover:border-blue-100 uppercase"
                                            >
                                                Ст.{riser}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Сетка квартир */}
                                <div className="flex flex-col p-3 pt-4">
                                    {sectionFloors.map(floor => (
                                        <div key={floor} className="flex items-center mb-1.5">
                                            <button 
                                                onClick={() => toggleFloorInSection(floor, sectionId)} 
                                                title={`Выбрать этаж ${floor}`}
                                                className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-gray-300 hover:text-primary hover:bg-gray-50 rounded-md transition-all border border-transparent hover:border-gray-200 mr-1"
                                            >
                                                {floor}
                                            </button>

                                            {Array.from({ length: mockBuilding.unitsPerFloor }, (_, i) => i + 1).map(riser => {
                                                const unit = mockBuilding.units.find(u => u.floor === floor && u.riser === riser && u.section === sectionId);
                                                if (!unit) return <div key={`${floor}-${riser}`} className="w-20 h-12 mx-0.5"></div>;
                                                const isSelected = selectedIds.has(unit.id);
                                                return (
                                                    <div 
                                                        key={unit.id} 
                                                        onClick={() => toggleUnit(unit.id)} 
                                                        className={`w-20 h-12 mx-0.5 rounded-lg border-2 cursor-pointer flex flex-col items-center justify-center transition-all select-none ${isSelected ? 'bg-primary border-primary text-white shadow-md scale-105 z-10' : 'bg-white border-gray-100 text-gray-500 hover:border-primary hover:bg-blue-50'}`}
                                                    >
                                                        <span className="text-[12px] font-black leading-none">{unit.number}</span>
                                                        <span className={`text-[9px] mt-1 font-medium whitespace-nowrap ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                                            {unit.rooms}К • {Math.round(unit.area)} м²
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Подвал */}
        <div className="px-6 py-3 border-t bg-white flex justify-end gap-3 shrink-0 shadow-sm z-30">
          <Button variant="secondary" onClick={onClose} className="px-6 h-10 text-sm">Отмена</Button>
          <Button onClick={handleSave} className="px-8 h-10 text-sm font-black">Подтвердить выбор</Button>
        </div>
      </div>
    </div>
  );
};
