
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Plus, Trash2, Zap, ZapOff, LayoutGrid, Building2, Calendar, Copy, History, Calculator, Save, GripVertical, Info, ArrowUp, ArrowDown, Percent } from 'lucide-react';
import { Bank, MortgageProgram, HistoryEntry } from '../types';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';
import { UnitSelectionModal } from './UnitSelectionModal';
import { TooltipIcon, isSberbank } from '../App';

interface BankFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bank: Bank) => void;
  initialData?: Bank | null;
}

const PROGRAM_TYPES = [
  'Семейная ипотека',
  'Стандартная ипотека',
  'Военная ипотека',
  'IT ипотека',
  'Господдержка',
  'Коммерческая недвижимость',
  'Ипотека по двум документам',
  'Рефинансирование'
];

const CONDITION_TEMPLATES = [
  "Доступно для семей с детьми.",
  "Предложение ограничено.",
  "Оценивайте свои финансовые возможности и риски.",
  "Требуется подтверждение дохода справкой 2-НДФЛ."
];

export const BankFormModal: React.FC<BankFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'programs'>('general');
  const [formData, setFormData] = useState<Bank>({ id: '', name: '', isActive: true, autoRates: true, programs: [], history: [] });
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [currentProgramIdForUnits, setCurrentProgramIdForUnits] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(JSON.parse(JSON.stringify(initialData)));
      } else {
        setFormData({ id: Date.now().toString(), name: '', isActive: true, autoRates: true, programs: [], history: [] });
      }
      setActiveTab('general');
    }
  }, [isOpen, initialData]);

  const addDefaultProgram = () => {
    setFormData(prev => ({ 
      ...prev, 
      programs: [...prev.programs, { 
        id: Date.now().toString(), 
        name: PROGRAM_TYPES[0], 
        rate: 6, 
        minTerm: 1, 
        maxTerm: 30, 
        minDownPayment: 20, 
        autoRates: false, 
        targetUnits: {} 
      }] 
    }));
  };

  const duplicateProgram = (prog: MortgageProgram) => {
    const newProg = { ...prog, id: `copy-${Date.now()}`, name: `${prog.name} (Копия)` };
    setFormData(prev => ({ ...prev, programs: [...prev.programs, newProg] }));
  };

  const reorderProgram = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const n = [...prev.programs];
      if (direction === 'up' && index > 0) [n[index-1], n[index]] = [n[index], n[index-1]];
      else if (direction === 'down' && index < n.length - 1) [n[index], n[index+1]] = [n[index+1], n[index]];
      return { ...prev, programs: n };
    });
  };

  const updateProgram = (id: string, field: keyof MortgageProgram, value: any) => {
    setFormData(prev => ({
      ...prev,
      programs: prev.programs.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const getSelectionSummary = (targetUnits: Record<string, string[]>) => {
    const projectKeys = Object.keys(targetUnits);
    if (projectKeys.length === 0) return 'Выбрать ЖК и помещения';
    
    const activeProjects = projectKeys.filter(k => targetUnits[k].length > 0);
    const totalUnits = Object.values(targetUnits).reduce((acc, units) => acc + units.length, 0);

    if (activeProjects.length === 0) return 'Выбрать ЖК и помещения';
    
    return `Выбрано ${activeProjects.length} ЖК, ${totalUnits} помещений`;
  };

  if (!isOpen) return null;

  const isBankAutoRatesDisabled = !formData.autoRates;

  return (
    <>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-[12px]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-fade-in-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Редактирование банка</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
        </div>

        <div className="flex px-6 border-b bg-gray-50/50 shrink-0">
          <button onClick={() => setActiveTab('general')} className={`px-6 py-3 text-[12px] font-bold border-b-2 transition-all ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Основная информация</button>
          <button onClick={() => setActiveTab('programs')} className={`px-6 py-3 text-[12px] font-bold border-b-2 transition-all ${activeTab === 'programs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Ипотечные программы <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px] text-gray-500 font-black">{formData.programs.length}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar flex flex-col">
          {activeTab === 'general' ? (
            <div className="max-w-3xl mx-auto w-full space-y-8">
               {isBankAutoRatesDisabled && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3 text-amber-800 text-[12px] font-medium">
                    <ZapOff size={18} className="text-amber-500" />
                    <span>Банк не подключен к системе автоставок. Все параметры программ редактируются вручную.</span>
                  </div>
               )}

               <div className="space-y-8">
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Логотип</label>
                       <div className="w-28 h-28 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center p-4 relative group shadow-inner">
                          {formData.logo ? (
                            <img src={formData.logo} className="w-full h-full object-contain" alt="Logo" />
                          ) : (
                            <Building2 size={32} className="text-gray-200" />
                          )}
                       </div>
                    </div>
                    <div className="col-span-9">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Название банка</label>
                       <input 
                         type="text" 
                         value={formData.name} 
                         readOnly
                         className="UNI_input h-10 text-[13px] font-bold px-4 bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                       />
                       <p className="mt-1.5 text-[10px] text-gray-400 font-medium italic">Название банка редактируется только администратором системы</p>
                    </div>
                  </div>

                  <div>
                     <div className="flex items-center gap-2 mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Комментарии менеджера</label>
                        <TooltipIcon text="Внутренние заметки для сотрудников, не отображаются клиенту." />
                     </div>
                     <textarea 
                       value={formData.description || ''} 
                       onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                       className="UNI_input min-h-[140px] text-[12px] p-4 bg-gray-50/50"
                       placeholder="Введите комментарии о банке..."
                     />
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-white transition-all shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-gray-800">Банк включен и отображается в калькуляторе</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">Отключите этот тумблер, чтобы временно скрыть предложения банка для клиентов</span>
                      </div>
                      <Switch checked={formData.isActive} onChange={(val) => setFormData(prev => ({...prev, isActive: val}))} />
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {formData.programs.length > 0 ? (
                <div className="space-y-12">
                  {formData.programs.map((program, idx) => (
                    <div key={program.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-gray-200 transition-all">
                      <div className="bg-gray-50/80 px-8 py-6 flex flex-col gap-6 border-b">
                        
                        {!isSberbank(formData.name) && (
                           <div className="flex items-center justify-between pb-4 border-b border-gray-200/50">
                              <div className="flex items-center gap-3">
                                 <div className={`p-1.5 rounded-lg ${program.autoRates ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Zap size={16} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-gray-800">Использовать автоматическое обновление ставок</span>
                                    <span className="text-[10px] text-gray-400 font-medium">Ставки будут обновляться по данным ЦБ РФ автоматически</span>
                                 </div>
                              </div>
                              <Switch checked={program.autoRates} onChange={(v) => updateProgram(program.id, 'autoRates', v)} />
                           </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col gap-1 shrink-0">
                                <button onClick={() => reorderProgram(idx, 'up')} disabled={idx === 0} className="p-1 text-gray-300 hover:text-primary disabled:opacity-30 transition-colors"><ArrowUp size={16}/></button>
                                <button onClick={() => reorderProgram(idx, 'down')} disabled={idx === formData.programs.length - 1} className="p-1 text-gray-300 hover:text-primary disabled:opacity-30 transition-colors"><ArrowDown size={16}/></button>
                            </div>
                            <div className="UNI_select flex-1 max-w-lg">
                              <select 
                                value={program.name} 
                                onChange={(e) => updateProgram(program.id, 'name', e.target.value)} 
                                className="font-bold h-10 text-[13px] pr-8 w-full pl-3"
                              >
                                {PROGRAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="ghost" size="sm" onClick={() => duplicateProgram(program)} className="h-9 px-3 text-gray-400 hover:text-primary hover:bg-white border border-transparent hover:border-blue-100 font-bold text-[11px] uppercase tracking-wider">
                              <Copy size={14} className="mr-1.5" /> Копировать
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, programs: prev.programs.filter(p => p.id !== program.id)}))} className="h-9 w-9 p-0 text-gray-300 hover:text-danger hover:bg-white rounded-lg"><Trash2 size={16} /></Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-8 space-y-8">
                        <div className={`grid grid-cols-2 lg:grid-cols-6 gap-6 transition-all ${program.autoRates ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                           <div className="col-span-1">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Ставка, %</label>
                             <input type="number" step="0.1" value={program.rate} onChange={(e) => updateProgram(program.id, 'rate', e.target.value)} className="UNI_input h-10 text-[14px] font-black text-gray-900 text-center" />
                           </div>
                           <div className="col-span-1">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Мин. ПВ, %</label>
                             <input type="number" value={program.minDownPayment} onChange={(e) => updateProgram(program.id, 'minDownPayment', e.target.value)} className="UNI_input h-10 text-[14px] font-black text-gray-900 text-center" />
                           </div>
                           <div className="col-span-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Срок (лет)</label>
                             <div className="flex items-center gap-2">
                                <input type="number" value={program.minTerm} onChange={(e) => updateProgram(program.id, 'minTerm', e.target.value)} className="UNI_input h-10 text-center text-[14px] font-black text-gray-900" placeholder="От" />
                                <span className="text-gray-300 font-bold text-lg">—</span>
                                <input type="number" value={program.maxTerm} onChange={(e) => updateProgram(program.id, 'maxTerm', e.target.value)} className="UNI_input h-10 text-center text-[14px] font-black text-gray-900" placeholder="До" />
                             </div>
                           </div>
                           <div className="col-span-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">ПСК (%)</label>
                             <div className="flex items-center gap-2">
                                <input type="number" step="0.001" value={program.pskMin} onChange={(e) => updateProgram(program.id, 'pskMin', e.target.value)} className="UNI_input h-10 text-center text-[14px] font-black text-gray-900" placeholder="От" />
                                <span className="text-gray-300 font-bold text-lg">—</span>
                                <input type="number" step="0.001" value={program.pskMax} onChange={(e) => updateProgram(program.id, 'pskMax', e.target.value)} className="UNI_input h-10 text-center text-[14px] font-black text-gray-900" placeholder="До" />
                             </div>
                           </div>
                        </div>

                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Особые условия (дисклеймер)</label>
                           <textarea 
                             value={program.conditions || ''} 
                             onChange={(e) => updateProgram(program.id, 'conditions', e.target.value)}
                             className="UNI_input min-h-[100px] text-[12px] p-4 bg-gray-50/50"
                             placeholder="Введите текст дисклеймера для отображения в калькуляторе..."
                           />
                           <div className="mt-3 flex flex-wrap gap-2">
                              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mr-1.5 flex items-center">Шаблоны:</span>
                              {CONDITION_TEMPLATES.map(t => (
                                <button 
                                  key={t} 
                                  onClick={() => updateProgram(program.id, 'conditions', (program.conditions || '').trim() + (program.conditions ? ' ' : '') + t)} 
                                  className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-100 border border-blue-100 transition-all"
                                >
                                  + {t}
                                </button>
                              ))}
                           </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex flex-col items-center gap-3">
                           <Button 
                            onClick={() => { setCurrentProgramIdForUnits(program.id); setIsUnitModalOpen(true); }} 
                            className="w-full h-11 font-black text-[13px] shadow-xl shadow-primary/20 rounded-xl"
                           >
                             {getSelectionSummary(program.targetUnits || {})}
                           </Button>
                           <div className="flex items-center gap-2 text-gray-400">
                              <Info size={12} />
                              <span className="text-[11px] font-bold italic">По умолчанию действует на все ЖК и помещения</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addDefaultProgram} variant="outline" className="w-full border-dashed py-8 text-gray-400 hover:text-primary transition-all rounded-2xl bg-white border-2 hover:bg-blue-50/10"><Plus size={32} className="mr-3" /> <span className="text-[14px] font-black uppercase tracking-widest">Добавить программу</span></Button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30 min-h-[400px]">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200 shadow-inner">
                     <Percent size={40} />
                   </div>
                   <p className="text-base font-bold text-gray-500 mb-8">У банка еще нет ипотечных программ.</p>
                   <Button onClick={addDefaultProgram} className="h-11 px-8 font-black text-[12px] uppercase tracking-widest shadow-xl shadow-primary/30 rounded-lg">
                      Добавить первую программу
                   </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-4 bg-gray-50/50 shrink-0">
          <Button variant="secondary" onClick={onClose} className="px-10 h-11 font-black text-[12px] bg-white rounded-xl">Отмена</Button>
          <Button onClick={() => { onSave(formData); onClose(); }} className="px-12 h-11 font-black text-[12px] shadow-xl shadow-primary/30 rounded-xl">Сохранить все изменения</Button>
        </div>
      </div>
    </div>

    <UnitSelectionModal isOpen={isUnitModalOpen} onClose={() => { setIsUnitModalOpen(false); setCurrentProgramIdForUnits(null); }} onSave={(units) => {
      if (currentProgramIdForUnits) updateProgram(currentProgramIdForUnits, 'targetUnits', units);
    }} initialSelection={formData.programs.find(p => p.id === currentProgramIdForUnits)?.targetUnits || {}} />
    </>
  );
};
