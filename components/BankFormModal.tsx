import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle, Zap, Grid3X3 } from 'lucide-react';
import { Bank, MortgageProgram } from '../types';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';
import { UnitSelectionModal } from './UnitSelectionModal';

interface BankFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bank: Bank) => void;
  initialData?: Bank | null;
  initialTab?: 'general' | 'programs';
}

const PROGRAM_TYPES = [
  'Семейная ипотека',
  'Стандартная ипотека',
  'Военная ипотека',
  'IT ипотека',
  'Господдержка',
  'Коммерческая недвижимость',
  'Дальневосточная ипотека',
  'Арктическая ипотека'
];

const emptyProgram: MortgageProgram = {
  id: '',
  name: PROGRAM_TYPES[1], // Стандартная по умолчанию
  rate: 0,
  minTerm: 1,
  maxTerm: 30,
  minDownPayment: 15,
  pskMin: 0,
  pskMax: 0,
  conditions: '',
  specialConditions: false,
  autoRates: false,
  targetUnits: [], // Пустой массив = все помещения
};

const emptyBank: Bank = {
  id: '',
  name: '',
  description: '',
  isActive: true,
  autoRates: false,
  programs: [],
};

export const BankFormModal: React.FC<BankFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  initialTab = 'general',
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'programs'>(initialTab);
  const [formData, setFormData] = useState<Bank>(emptyBank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for Unit Selection Modal
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [currentProgramIdForUnits, setCurrentProgramIdForUnits] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(JSON.parse(JSON.stringify(initialData))); // Deep copy
      } else {
        setFormData({ ...emptyBank, id: Date.now().toString() });
      }
      setActiveTab(initialTab);
      setErrors({});
    }
  }, [isOpen, initialData, initialTab]);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const addProgram = () => {
    const newProgram = { ...emptyProgram, id: `new-${Date.now()}` };
    setFormData(prev => ({ ...prev, programs: [...prev.programs, newProgram] }));
  };

  const removeProgram = (id: string) => {
    setFormData(prev => ({ ...prev, programs: prev.programs.filter(p => p.id !== id) }));
  };

  const updateProgram = (id: string, field: keyof MortgageProgram, value: any) => {
    setFormData(prev => {
      const updatedPrograms = prev.programs.map(p => {
        if (p.id !== id) return p;

        const updatedProgram = { ...p, [field]: value };
        
        // Симуляция подтягивания данных при включении автоставок
        if (field === 'autoRates' && value === true) {
           if (updatedProgram.name.includes('Семейная')) {
             updatedProgram.rate = 6;
             updatedProgram.minDownPayment = 20;
             updatedProgram.pskMin = 6.2;
             updatedProgram.pskMax = 7.1;
             updatedProgram.conditions = 'Стандартные условия госпрограммы для семей с детьми.';
           } else if (updatedProgram.name.includes('IT')) {
             updatedProgram.rate = 5;
             updatedProgram.minDownPayment = 15;
             updatedProgram.pskMin = 5.2;
             updatedProgram.pskMax = 6.5;
             updatedProgram.conditions = 'Для сотрудников IT компаний, аккредитованных Минцифры.';
           } else if (updatedProgram.name.includes('Стандартная')) {
             updatedProgram.rate = 18.5;
             updatedProgram.minDownPayment = 10;
             updatedProgram.pskMin = 18.8;
             updatedProgram.pskMax = 22.0;
           } else {
             updatedProgram.rate = 12;
             updatedProgram.minDownPayment = 15;
             updatedProgram.pskMin = 12.5;
             updatedProgram.pskMax = 14.0;
           }
           updatedProgram.minTerm = 1;
           updatedProgram.maxTerm = 30;
        }

        return updatedProgram;
      });
      return { ...prev, programs: updatedPrograms };
    });
  };

  const openUnitSelection = (programId: string) => {
    setCurrentProgramIdForUnits(programId);
    setIsUnitModalOpen(true);
  };

  const handleUnitSelectionSave = (selectedIds: string[]) => {
    if (currentProgramIdForUnits) {
      updateProgram(currentProgramIdForUnits, 'targetUnits', selectedIds);
    }
  };

  const getCurrentProgramUnits = () => {
    if (!currentProgramIdForUnits) return [];
    const program = formData.programs.find(p => p.id === currentProgramIdForUnits);
    return program?.targetUnits || [];
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Название банка обязательно';
    
    formData.programs.forEach((p, index) => {
      if (!p.name.trim()) newErrors[`program_${index}_name`] = 'Название программы обязательно';
      if (!p.autoRates) {
          if (p.rate < 0 || p.rate > 30) newErrors[`program_${index}_rate`] = 'Ставка должна быть от 0 до 30';
          if (p.minDownPayment < 0 || p.minDownPayment > 100) newErrors[`program_${index}_downpayment`] = 'Некорректный взнос';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Редактировать банк' : 'Добавить новый банк'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Основная информация
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'programs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Ипотечные программы
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {formData.programs.length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' ? (
            <div className="space-y-6 max-w-2xl">
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Логотип</label>
                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-gray-400 text-xs">Нет</span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название банка <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleGeneralChange}
                    className={`UNI_input ${errors.name ? 'border-danger' : ''}`}
                    placeholder="напр. Сбербанк"
                  />
                  {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleGeneralChange}
                  rows={4}
                  className="UNI_input"
                  placeholder="Дополнительная информация о банке..."
                />
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                 <div className="flex items-center justify-between">
                     <div>
                        <div className="font-semibold text-blue-900 flex items-center gap-2">
                           <Zap size={16} className="text-blue-600"/> 
                           Автоставки банка
                        </div>
                        <p className="text-xs text-blue-700 mt-1">Автоматически обновлять информацию о банке из внешних источников.</p>
                     </div>
                     <Switch 
                        checked={formData.autoRates} 
                        onChange={(val) => setFormData(prev => ({ ...prev, autoRates: val }))} 
                     />
                 </div>
              </div>

              <div>
                 <Switch 
                    checked={formData.isActive} 
                    onChange={(val) => setFormData(prev => ({ ...prev, isActive: val }))} 
                    label="Банк активен" 
                 />
                 <p className="text-gray-500 text-xs mt-1 ml-14">Неактивные банки скрыты из публичного калькулятора.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.programs.length === 0 ? (
                 <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">Ипотечные программы пока не добавлены.</p>
                    <Button onClick={addProgram} icon={<Plus size={16}/>}>Добавить первую программу</Button>
                 </div>
              ) : (
                <div className="space-y-4">
                  {formData.programs.map((program, index) => (
                    <div key={program.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="absolute right-4 top-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                            <button 
                                onClick={() => removeProgram(program.id)}
                                className="p-2 text-gray-400 hover:text-danger bg-white hover:bg-red-50 rounded-full transition-colors"
                                title="Удалить программу"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        
                        <div className="mb-4 pr-10">
                            {/* Верхняя панель программы */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                {/* Автоставки */}
                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg flex-1">
                                   <div className="flex items-center gap-2">
                                      <div className={`p-1 rounded-full ${program.autoRates ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                        <Zap size={14} />
                                      </div>
                                      <div className="text-xs font-semibold text-gray-700">Автоставки</div>
                                   </div>
                                   <Switch 
                                        checked={program.autoRates} 
                                        onChange={(val) => updateProgram(program.id, 'autoRates', val)} 
                                   />
                                </div>
                                
                                {/* Выбор помещений */}
                                <div className="flex-1">
                                    <Button 
                                        variant="outline" 
                                        className={`w-full justify-between bg-white ${program.targetUnits && program.targetUnits.length > 0 ? 'text-primary border-primary bg-blue-50' : 'text-gray-600'}`}
                                        onClick={() => openUnitSelection(program.id)}
                                        icon={<Grid3X3 size={16} />}
                                    >
                                        <span className="truncate">
                                            {program.targetUnits && program.targetUnits.length > 0 
                                                ? `Выбрано помещений: ${program.targetUnits.length}` 
                                                : 'Действует на все помещения'}
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Название программы <span className="text-danger">*</span></label>
                                    <div className="UNI_select">
                                        <select
                                            value={program.name}
                                            onChange={(e) => updateProgram(program.id, 'name', e.target.value)}
                                            className={errors[`program_${index}_name`] ? 'border-danger' : ''}
                                        >
                                            {PROGRAM_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className={program.autoRates ? "opacity-60 pointer-events-none" : ""}>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ставка (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="30"
                                        value={program.rate}
                                        onChange={(e) => updateProgram(program.id, 'rate', parseFloat(e.target.value))}
                                        className={`UNI_input ${errors[`program_${index}_rate`] ? 'border-danger' : ''}`}
                                        disabled={program.autoRates}
                                    />
                                </div>

                                <div className={program.autoRates ? "opacity-60 pointer-events-none" : ""}>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Мин. взнос (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={program.minDownPayment}
                                        onChange={(e) => updateProgram(program.id, 'minDownPayment', parseFloat(e.target.value))}
                                        className="UNI_input"
                                        disabled={program.autoRates}
                                    />
                                </div>

                                <div className={`flex gap-2 ${program.autoRates ? "opacity-60 pointer-events-none" : ""}`}>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">ПСК от (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={program.pskMin || ''}
                                            onChange={(e) => updateProgram(program.id, 'pskMin', parseFloat(e.target.value))}
                                            className="UNI_input"
                                            disabled={program.autoRates}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">ПСК до (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={program.pskMax || ''}
                                            onChange={(e) => updateProgram(program.id, 'pskMax', parseFloat(e.target.value))}
                                            className="UNI_input"
                                            disabled={program.autoRates}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className={`flex gap-2 ${program.autoRates ? "opacity-60 pointer-events-none" : ""}`}>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Мин. срок (лет)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={program.minTerm}
                                            onChange={(e) => updateProgram(program.id, 'minTerm', parseInt(e.target.value))}
                                            className="UNI_input"
                                            disabled={program.autoRates}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Макс. срок (лет)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={program.maxTerm}
                                            onChange={(e) => updateProgram(program.id, 'maxTerm', parseInt(e.target.value))}
                                            className="UNI_input"
                                            disabled={program.autoRates}
                                        />
                                    </div>
                                </div>
                                
                                <div className="col-span-1 md:col-span-2">
                                   <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Условия программы</label>
                                   <textarea
                                      value={program.conditions || ''}
                                      onChange={(e) => updateProgram(program.id, 'conditions', e.target.value)}
                                      rows={2}
                                      className="UNI_input"
                                      placeholder="Опишите особые условия, требования к заемщику и т.д."
                                   />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id={`special-${program.id}`}
                                checked={program.specialConditions}
                                onChange={(e) => updateProgram(program.id, 'specialConditions', e.target.checked)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor={`special-${program.id}`} className="ml-2 block text-sm text-gray-700">
                                Есть особые условия (напр. для семей)
                            </label>
                        </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <Button onClick={addProgram} variant="outline" className="w-full border-dashed" icon={<Plus size={16}/>}>
                        Добавить еще программу
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit} icon={<CheckCircle size={18}/>}>Сохранить</Button>
        </div>
      </div>
    </div>

    {/* Unit Selection Modal */}
    <UnitSelectionModal 
        isOpen={isUnitModalOpen} 
        onClose={() => { setIsUnitModalOpen(false); setCurrentProgramIdForUnits(null); }}
        onSave={handleUnitSelectionSave}
        initialSelection={getCurrentProgramUnits()}
    />
    </>
  );
};