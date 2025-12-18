import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Grip, ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { mockBuilding } from '../services/mockData';

interface UnitSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
  initialSelection?: string[]; // Если undefined или пустой массив при открытии, считаем что выбрано всё
}

export const UnitSelectionModal: React.FC<UnitSelectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSelection
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // При открытии инициализируем состояние
  useEffect(() => {
    if (isOpen) {
      if (initialSelection && initialSelection.length > 0) {
        setSelectedIds(new Set(initialSelection));
      } else {
        // Если ничего не передано или массив пуст, по дефолту выбираем ВСЁ (так как "действует на все")
        const allIds = mockBuilding.units.map(u => u.id);
        setSelectedIds(new Set(allIds));
      }
    }
  }, [isOpen, initialSelection]);

  const toggleUnit = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleFloor = (floor: number) => {
    const unitsOnFloor = mockBuilding.units.filter(u => u.floor === floor);
    const allSelected = unitsOnFloor.every(u => selectedIds.has(u.id));
    
    const newSet = new Set(selectedIds);
    unitsOnFloor.forEach(u => {
      if (allSelected) newSet.delete(u.id);
      else newSet.add(u.id);
    });
    setSelectedIds(newSet);
  };

  const toggleRiser = (riser: number) => {
    const unitsInRiser = mockBuilding.units.filter(u => u.riser === riser);
    const allSelected = unitsInRiser.every(u => selectedIds.has(u.id));

    const newSet = new Set(selectedIds);
    unitsInRiser.forEach(u => {
      if (allSelected) newSet.delete(u.id);
      else newSet.add(u.id);
    });
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    const allIds = mockBuilding.units.map(u => u.id);
    setSelectedIds(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSave = () => {
    // Если выбраны все квартиры, возвращаем пустой массив (семантика "Все")
    if (selectedIds.size === mockBuilding.units.length) {
      onSave([]);
    } else {
      onSave(Array.from(selectedIds));
    }
    onClose();
  };

  if (!isOpen) return null;

  const totalUnits = mockBuilding.units.length;
  const selectedCount = selectedIds.size;

  // Группируем квартиры по этажам для рендеринга
  const floors = Array.from({ length: mockBuilding.floors }, (_, i) => mockBuilding.floors - i); // [12, 11, ... 1]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Grip className="text-primary" />
              Выбор помещений
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Выберите квартиры, на которые распространяется ипотечная программа
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-gray-50 border-b flex justify-between items-center shrink-0">
           <div className="text-sm font-medium text-gray-700">
             Выбрано: <span className="text-primary font-bold">{selectedCount}</span> из {totalUnits}
           </div>
           <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={deselectAll}>Снять выделение</Button>
             <Button variant="outline" size="sm" onClick={selectAll}>Выбрать все</Button>
           </div>
        </div>

        {/* Grid (Chessboard) */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100 flex justify-center">
            <div className="inline-block bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                
                {/* Header Row (Risers) */}
                <div className="flex mb-2">
                    <div className="w-12 mr-2"></div> {/* Spacer for floor labels */}
                    {Array.from({ length: mockBuilding.unitsPerFloor }, (_, i) => i + 1).map(riser => (
                        <button 
                            key={riser}
                            onClick={() => toggleRiser(riser)}
                            className="w-16 h-8 flex items-center justify-center text-xs text-gray-500 hover:text-primary hover:bg-blue-50 rounded mb-1 mx-1 transition-colors border border-transparent hover:border-blue-100"
                            title="Выбрать весь стояк"
                        >
                            <ArrowDown size={14} className="mr-1"/> Ст.{riser}
                        </button>
                    ))}
                </div>

                {/* Rows (Floors) */}
                {floors.map(floor => (
                    <div key={floor} className="flex items-center mb-2">
                         {/* Floor Label */}
                        <button 
                            onClick={() => toggleFloor(floor)}
                            className="w-12 h-10 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-primary hover:bg-blue-50 rounded mr-2 transition-colors border border-transparent hover:border-blue-100"
                            title="Выбрать весь этаж"
                        >
                            {floor} <ArrowRight size={12} className="ml-1"/>
                        </button>

                        {/* Units */}
                        {Array.from({ length: mockBuilding.unitsPerFloor }, (_, i) => i + 1).map(riser => {
                            const unit = mockBuilding.units.find(u => u.floor === floor && u.riser === riser);
                            if (!unit) return <div key={`${floor}-${riser}`} className="w-16 h-10 mx-1"></div>;
                            
                            const isSelected = selectedIds.has(unit.id);

                            return (
                                <div 
                                    key={unit.id}
                                    onClick={() => toggleUnit(unit.id)}
                                    className={`
                                        w-16 h-10 mx-1 rounded border cursor-pointer flex flex-col items-center justify-center transition-all select-none
                                        ${isSelected 
                                            ? 'bg-primary border-primary text-white shadow-md transform scale-105 z-10' 
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-blue-50'}
                                    `}
                                    title={`Кв. ${unit.number}, ${unit.rooms} комн., ${unit.area} м²`}
                                >
                                    <span className="text-xs font-bold leading-none">{unit.number}</span>
                                    <span className={`text-[10px] leading-none mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {unit.rooms}к
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave} icon={<CheckCircle size={18}/>}>Применить</Button>
        </div>
      </div>
    </div>
  );
};