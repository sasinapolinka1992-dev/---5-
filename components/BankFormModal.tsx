
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle, Zap, Grid3X3, AlertCircle, FileText, Calendar, Percent } from 'lucide-react';
import { Bank, MortgageProgram } from '../types';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';
import { UnitSelectionModal } from './UnitSelectionModal';

interface BankFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bank: Bank) => void;
  initialData?: Bank | null;
  initialTab?: 'general' | 'programs' | 'none';
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

const NO_AUTO_RATES_BANKS = ['Сбербанк'];

const emptyProgram: MortgageProgram = {
  id: '',
  name: PROGRAM_TYPES[1],
  rate: 0,
  minTerm: 1,
  maxTerm: 30,
  minDownPayment: 15,
  pskMin: 0,
  pskMax: 0,
  conditions: '',
  specialConditions: false,
  autoRates: false,
  targetUnits: [],
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
  const [activeTab, setActiveTab] = useState<'general' | 'programs'>(initialTab === 'none' ? 'general' : initialTab);
  const [formData, setFormData] = useState<Bank>(emptyBank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [currentProgramIdForUnits, setCurrentProgramIdForUnits] = useState<string | null>(null);

  const bankSupportsAutoRates = !NO_AUTO_RATES_BANKS.includes(formData.name);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const data = JSON.parse(JSON.stringify(initialData)) as Bank;
        // Если банк не поддерживает автоставки, принудительно выключаем их у программ
        if (NO_AUTO_RATES_BANKS.includes(data.name)) {
          data.autoRates = false;
          data.programs = data.programs.map(p => ({ ...p, autoRates: false }));
        }
        setFormData(data);
      } else {
        setFormData({ ...emptyBank, id: Date.now().toString() });
      }
      setActiveTab(initialTab === 'none' ? 'general' : initialTab);
      setErrors({});
    }
  }, [isOpen, initialData, initialTab]);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        
        if (field === 'autoRates' && value === true) {
           if (updatedProgram.name.includes('Семейная')) {
             updatedProgram.rate = 6;
             updatedProgram.minDownPayment = 20;
             updatedProgram.pskMin = 6.2;
             updatedProgram.pskMax = 7.1;
           } else if (updatedProgram.name.includes('IT')) {
             updatedProgram.rate = 5;
             updatedProgram.minDownPayment = 15;
             updatedProgram.pskMin = 5.2;
             updatedProgram.pskMax = 5.8;
           } else {
             updatedProgram.rate = 18.5;
             updatedProgram.pskMin = 18.9;
             updatedProgram.pskMax = 22.4;
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

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onSave(formData);
      onClose();
    } else {
      setErrors({ name: 'Название обязательно' });
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Редактирование банка' : 'Добавление банка'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="flex px-6 border-b bg-gray-50 shrink-0">
          <button onClick={() => setActiveTab('general')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Основная информация</button>
          <button onClick={() => setActiveTab('programs')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'programs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Ипотечные программы <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{formData.programs.length}</span></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {activeTab === 'general' ? (
            <div className="space-y-6 max-w-5xl bg-white p-8 rounded-xl border border-gray-200 shadow-sm mx-auto">
              <div className="flex gap-8">
                <div className="flex-shrink-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Логотип</label>
                  <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden p-2">
                    {formData.logo ? <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-gray-400 text-xs">Нет</span>}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название банка</label>
                  <input type="text" name="name" value={formData.name} readOnly className="UNI_input bg-gray-50 cursor-not-allowed h-12 text-lg font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание банка</label>
                <textarea name="description" value={formData.description || ''} onChange={handleGeneralChange} rows={8} className="UNI_input" placeholder="Дополнительная информация о банке..." />
              </div>
              
              <div className={`p-6 rounded-xl border ${!bankSupportsAutoRates ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
                 <div className="flex items-center justify-between">
                     <div className="pr-4">
                        <div className={`font-semibold flex items-center gap-2 ${!bankSupportsAutoRates ? 'text-gray-500' : 'text-blue-900'}`}>
                           <Zap size={20} /> Автоставки банка
                        </div>
                        <p className={`text-xs mt-1.5 ${!bankSupportsAutoRates ? 'text-gray-400' : 'text-blue-700'}`}>
                           {!bankSupportsAutoRates 
                             ? 'Для этого банка автоматическое получение ставок недоступно.' 
                             : 'Включает возможность автообновления для всех программ этого банка.'}
                        </p>
                     </div>
                     <div className={!bankSupportsAutoRates ? 'pointer-events-none' : ''}>
                        <Switch 
                          checked={formData.autoRates && bankSupportsAutoRates} 
                          onChange={(val) => setFormData(prev => ({ ...prev, autoRates: val }))} 
                        />
                     </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <Switch 
                  checked={formData.isActive} 
                  onChange={(val) => setFormData(prev => ({ ...prev, isActive: val }))} 
                  label={formData.isActive ? "Банк включен и отображается в калькуляторе" : "Банк неактивен и не отображается в калькуляторе"} 
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.programs.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Percent size={40} />
                    </div>
                    <p className="text-gray-500 mb-6 font-medium text-lg">У банка еще нет ипотечных программ.</p>
                    <Button onClick={addProgram} icon={<Plus size={20}/>} className="px-8 py-3">Добавить первую программу</Button>
                 </div>
              ) : (
                <div className="space-y-6">
                  {formData.programs.map((program, index) => (
                    <div key={program.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden group">
                        {/* Header программы */}
                        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-sm font-bold text-gray-400">{index + 1}</span>
                                <div className="flex flex-col gap-1">
                                    {/* Переключатель автоставок ПЕРЕНЕСЕН НАД СЕЛЕКТОМ и увеличен */}
                                    {formData.autoRates && bankSupportsAutoRates && (
                                        <div className="flex items-center gap-3 mb-2 scale-110 origin-left">
                                            <Zap size={16} className={program.autoRates ? 'text-blue-500' : 'text-gray-400'} />
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Автоставки:</span>
                                            <Switch checked={program.autoRates} onChange={(val) => updateProgram(program.id, 'autoRates', val)} />
                                        </div>
                                    )}
                                    <div className="UNI_select w-96">
                                        <select value={program.name} onChange={(e) => updateProgram(program.id, 'name', e.target.value)} className="bg-white h-11 py-0 font-medium text-gray-900">
                                            {PROGRAM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => removeProgram(program.id)} className="p-2.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors" title="Удалить программу"><Trash2 size={22} /></button>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Левая колонка */}
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className={program.autoRates ? "opacity-60" : ""}>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><Percent size={12}/> Ставка (%)</label>
                                            <input 
                                              type="number" 
                                              step="0.1" 
                                              value={program.rate} 
                                              onChange={(e) => updateProgram(program.id, 'rate', parseFloat(e.target.value))} 
                                              className={`UNI_input h-11 ${program.autoRates ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                              disabled={program.autoRates} 
                                            />
                                        </div>
                                        <div className={program.autoRates ? "opacity-60" : ""}>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Мин. взнос (%)</label>
                                            <input 
                                              type="number" 
                                              value={program.minDownPayment} 
                                              onChange={(e) => updateProgram(program.id, 'minDownPayment', parseFloat(e.target.value))} 
                                              className={`UNI_input h-11 ${program.autoRates ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                              disabled={program.autoRates} 
                                            />
                                        </div>
                                        <div className={program.autoRates ? "opacity-60" : ""}>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><Calendar size={12}/> Срок (лет)</label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                  type="number" 
                                                  value={program.minTerm} 
                                                  onChange={(e) => updateProgram(program.id, 'minTerm', parseInt(e.target.value))} 
                                                  className={`UNI_input h-11 ${program.autoRates ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                                  placeholder="От" 
                                                  disabled={program.autoRates}
                                                />
                                                <span className="text-gray-400">до</span>
                                                <input 
                                                  type="number" 
                                                  value={program.maxTerm} 
                                                  onChange={(e) => updateProgram(program.id, 'maxTerm', parseInt(e.target.value))} 
                                                  className={`UNI_input h-11 ${program.autoRates ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                                  placeholder="До" 
                                                  disabled={program.autoRates}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                        <div className={program.autoRates ? "opacity-60" : ""}>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">ПСК (от - до %)</label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                  type="number" 
                                                  step="0.01" 
                                                  value={program.pskMin || 0} 
                                                  onChange={(e) => updateProgram(program.id, 'pskMin', parseFloat(e.target.value))} 
                                                  className={`UNI_input h-11 ${program.autoRates ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                                  placeholder="От" 
                                                  disabled={program.autoRates} 
                                                />
                                                <input 
                                                  type="number" 
                                                  step="0.01" 
                                                  value={program.pskMax || 0} 
                                                  onChange={(e) => updateProgram(program.id, 'pskMax', parseFloat(e.target.value))} 
                                                  className={`UNI_input h-11 ${program.autoRates ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                                  placeholder="До" 
                                                  disabled={program.autoRates} 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-end pb-3">
                                            <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100 w-full md:w-auto">
                                                <input type="checkbox" id={`special-${program.id}`} checked={program.specialConditions} onChange={(e) => updateProgram(program.id, 'specialConditions', e.target.checked)} className="h-4.5 w-4.5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer" />
                                                <label htmlFor={`special-${program.id}`} className="ml-3 block text-sm font-semibold text-gray-700 cursor-pointer">Особые условия (дисклеймер)</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><FileText size={12}/> Особые условия (описание)</label>
                                        <textarea value={program.conditions || ''} onChange={(e) => updateProgram(program.id, 'conditions', e.target.value)} rows={4} className="UNI_input p-4" placeholder="Укажите подробности: требования к заемщику, страховки и т.д." />
                                    </div>
                                </div>

                                {/* Правая колонка */}
                                <div className="lg:col-span-4 space-y-8">
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Действует</label>
                                        <Button 
                                            variant="primary" 
                                            className="w-full shadow-sm py-4 text-base"
                                            onClick={() => openUnitSelection(program.id)}
                                            icon={<Grid3X3 size={22} />}
                                        >
                                            {program.targetUnits && program.targetUnits.length > 0 
                                                ? `Выбрано: ${program.targetUnits.length} пом.` 
                                                : 'Все помещения ЖК'}
                                        </Button>
                                        <p className="text-[11px] text-gray-400 text-center px-4 leading-relaxed">
                                            {(!program.targetUnits || program.targetUnits.length === 0) 
                                                ? 'Программа по умолчанию действует на весь проект' 
                                                : 'Выбраны конкретные квартиры в шахматке'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  ))}
                  <Button onClick={addProgram} variant="outline" className="w-full border-dashed py-6 bg-white text-gray-500 font-semibold text-lg hover:border-primary hover:text-primary transition-all" icon={<Plus size={24}/>}>Добавить еще одну программу</Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-5 border-t bg-white flex justify-end gap-3 rounded-b-xl shrink-0">
          <Button variant="secondary" onClick={onClose} className="px-8 h-12">Отмена</Button>
          <Button onClick={handleSubmit} icon={<CheckCircle size={20}/>} className="px-8 h-12">Сохранить все изменения</Button>
        </div>
      </div>
    </div>

    <UnitSelectionModal isOpen={isUnitModalOpen} onClose={() => { setIsUnitModalOpen(false); setCurrentProgramIdForUnits(null); }} onSave={handleUnitSelectionSave} initialSelection={getCurrentProgramUnits()} />
    </>
  );
};

