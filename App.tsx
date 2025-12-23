
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Info, Search, Settings2, Trash2, CheckCircle, Plus, SlidersHorizontal, Check, X as CloseIcon } from 'lucide-react';
import { initialBanks } from './services/mockData';
import { Bank, BankFilter, ProgramFilter, ToastMessage } from './types';
import { Button } from './components/ui/Button';
import { Switch } from './components/ui/Switch';
import { BankTable } from './components/BankTable';
import { BankFormModal } from './components/BankFormModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ToastContainer } from './components/Toast';

// Вспомогательная функция для надежной проверки на Сбербанк
export const isSberbank = (name: string) => {
  if (!name) return false;
  const normalized = name.toLowerCase().trim();
  // Проверяем как кириллическую 'с', так и возможную латинскую 'c' (ошибка раскладки)
  return normalized === 'сбербанк' || normalized === 'sberbank' || normalized === 'cбербанк';
};

const PREDEFINED_BANKS = [
  { name: 'Сбербанк', logo: 'https://companieslogo.com/img/orig/SBER.ME-1004a469.png?t=1720244493' },
  { name: 'ВТБ', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/VTB_Logo_2018_color.png' },
  { name: 'Альфа-Банк', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Alfa-Bank_logo_2008_2.svg/1200px-Alfa-Bank_logo_2008_2.svg.png' },
  { name: 'Дом.РФ', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/DOM.RF_Logo.svg/1200px-DOM.RF_Logo.svg.png' },
  { name: 'Газпромбанк', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Gazprombank_logo.svg/2560px-Gazprombank_logo.svg.png' },
];

export const PROJECTS = Array.from({ length: 15 }, (_, i) => `ЖК "Проект ${i + 1}"`);

const BANKS_PER_PAGE = 20;

export const TooltipIcon: React.FC<{ text: string }> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      ref={containerRef}
    >
      <Info size={14} className="text-gray-400 cursor-help hover:text-primary transition-colors" />
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[260px] p-3 bg-[#1e293b] text-white text-[8px] rounded-lg shadow-2xl leading-relaxed border border-slate-700 z-[1000] pointer-events-none text-center font-medium font-sans">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
        </div>
      )}
    </div>
  );
};

interface MultiSelectProps<T> {
  options: { label: string; value: T }[];
  selected: T[];
  onChange: (values: T[]) => void;
  placeholder: string;
  className?: string;
  allValue?: T;
}

const MultiSelect = <T extends string>({ options, selected, onChange, placeholder, className = "", allValue }: MultiSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value: T) => {
    if (allValue !== undefined && value === allValue) {
      onChange([allValue]);
      return;
    }

    let nextValues: T[];
    const isAlreadySelected = selected.includes(value);

    if (isAlreadySelected) {
      nextValues = selected.filter(v => v !== value);
      if (nextValues.length === 0 && allValue !== undefined) {
        nextValues = [allValue];
      }
    } else {
      nextValues = allValue !== undefined ? selected.filter(v => v !== allValue) : [...selected];
      nextValues.push(value);
    }
    onChange(nextValues);
  };

  const displayText = useMemo(() => {
    if (allValue !== undefined && selected.includes(allValue)) return placeholder;
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      return options.find(o => o.value === selected[0])?.label || placeholder;
    }
    return `${placeholder} (${selected.length})`;
  }, [selected, options, placeholder, allValue]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="UNI_input h-10 flex items-center justify-between px-3 cursor-pointer bg-white hover:border-gray-300 transition-colors select-none"
      >
        <span className={`truncate ${selected.length > 0 && !(allValue !== undefined && selected.includes(allValue)) ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
          {displayText}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-[105] py-1 max-h-60 overflow-y-auto animate-fade-in-up">
          {options.map((option) => (
            <div 
              key={option.value}
              onClick={() => handleToggle(option.value)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selected.includes(option.value) ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                {selected.includes(option.value) && <Check size={12} className="text-white stroke-[4]" />}
              </div>
              <span className={`text-[12px] ${selected.includes(option.value) ? 'text-primary font-bold' : 'text-slate-700'}`}>
                {option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>(initialBanks);
  const [selectedBankIds, setSelectedBankIds] = useState<Set<string>>(new Set());
  const [usePromoPrice, setUsePromoPrice] = useState(false);
  const [respectLimits, setRespectLimits] = useState(true);
  const [isCapitalCity, setIsCapitalCity] = useState(false);

  const [addBankSearch, setAddBankSearch] = useState('');
  
  const [statusFilters, setStatusFilters] = useState<BankFilter[]>(['all']);
  const [programFilters, setProgramFilters] = useState<ProgramFilter[]>(['all']);
  const [bankNameFilters, setBankNameFilters] = useState<string[]>(['all']);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
        setAddBankSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts(prev => [...prev, { id: Date.now().toString(), type, message }]);
  };

  const filteredBanks = useMemo(() => {
    return banks.filter(bank => {
      const matchesBankName = bankNameFilters.includes('all') || bankNameFilters.includes(bank.name);
      const matchesStatus = statusFilters.includes('all') || 
        (statusFilters.includes('active') && bank.isActive) || 
        (statusFilters.includes('inactive') && !bank.isActive);
      const matchesPrograms = programFilters.includes('all') || 
        (programFilters.includes('with_programs') && bank.programs.length > 0) || 
        (programFilters.includes('no_programs') && bank.programs.length === 0);
      return matchesBankName && matchesStatus && matchesPrograms;
    });
  }, [banks, bankNameFilters, statusFilters, programFilters]);

  const totalPages = Math.ceil(filteredBanks.length / BANKS_PER_PAGE);
  const paginatedBanks = useMemo(() => {
    const startIndex = (currentPage - 1) * BANKS_PER_PAGE;
    return filteredBanks.slice(startIndex, startIndex + BANKS_PER_PAGE);
  }, [filteredBanks, currentPage]);

  const toggleSelectAll = () => {
    if (selectedBankIds.size === paginatedBanks.length) {
      setSelectedBankIds(new Set());
    } else {
      setSelectedBankIds(new Set(paginatedBanks.map(b => b.id)));
    }
  };

  const toggleSelectBank = (id: string) => {
    setSelectedBankIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleMassDelete = () => {
    setBanks(prev => prev.filter(b => !selectedBankIds.has(b.id)));
    setSelectedBankIds(new Set());
    addToast('success', 'Выбранные банки удалены');
  };

  const handleMassStatusToggle = (active: boolean) => {
    setBanks(prev => prev.map(b => selectedBankIds.has(b.id) ? { ...b, isActive: active } : b));
    addToast('success', `Статус обновлен для ${selectedBankIds.size} банков`);
  };

  const bankNameOptions = useMemo(() => {
    const names = Array.from(new Set(banks.map(b => b.name)));
    return [
      { label: 'Все банки', value: 'all' },
      ...names.map(name => ({ label: name, value: name }))
    ];
  }, [banks]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 text-[12px]">
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Настройки банков</h1>
            <p className="text-slate-500 mt-1 text-[13px] font-medium">Управление программами ипотечного калькулятора</p>
          </div>
          <div className="relative" ref={addMenuRef}>
            <Button 
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} 
              className="font-bold min-w-[150px] h-10 flex items-center justify-between px-4 text-[12px]"
            >
                <span>Добавить банк</span>
                <ChevronDown size={14} className={`ml-2 transition-transform duration-200 ${isAddMenuOpen ? 'rotate-180' : ''}`} />
            </Button>
            {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-slate-100 z-[110] overflow-hidden animate-fade-in-up">
                    <div className="p-2 border-b bg-slate-50">
                        <input 
                          type="text" 
                          placeholder="Поиск..." 
                          value={addBankSearch}
                          autoFocus
                          onChange={(e) => setAddBankSearch(e.target.value)}
                          className="UNI_input h-8 text-[12px]"
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {PREDEFINED_BANKS.filter(pb => pb.name.toLowerCase().includes(addBankSearch.toLowerCase())).map((bank) => {
                            const isAlreadyAdded = banks.some(b => b.name === bank.name);
                            return (
                                <div key={bank.name} onClick={() => {
                                    if (isAlreadyAdded) {
                                      addToast('error', `Банк "${bank.name}" уже добавлен`);
                                      return;
                                    }
                                    setIsAddMenuOpen(false);
                                    setAddBankSearch('');
                                    setEditingBank({ 
                                      id: Date.now().toString(), 
                                      name: bank.name, 
                                      logo: bank.logo, 
                                      isActive: true, 
                                      autoRates: !isSberbank(bank.name), 
                                      programs: [], 
                                      history: [] 
                                    });
                                    setIsFormModalOpen(true);
                                }} className={`px-3 py-2 text-[12px] flex items-center gap-2 cursor-pointer border-b last:border-0 ${isAlreadyAdded ? 'opacity-40 grayscale cursor-not-allowed' : 'text-slate-700 hover:bg-slate-50'}`}>
                                    {bank.logo ? <img src={bank.logo} className="w-6 h-6 object-contain" /> : <div className="w-6 h-6 bg-slate-100 rounded" />}
                                    <span className="font-medium">{bank.name}</span>
                                    {isAlreadyAdded && <span className="ml-auto text-[9px] bg-slate-100 px-1 rounded text-slate-400 font-bold uppercase tracking-tight">Добавлен</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-4 flex items-center gap-4">
                      <Switch checked={usePromoPrice} onChange={setUsePromoPrice} />
                      <div className="min-w-0">
                        <div className="flex items-center">
                          <span className="text-[12px] font-bold text-slate-800">Акционная стоимость</span>
                          <TooltipIcon text="По умолчанию расчет ипотеки рассчитывается от прайсовой стоимости. Включите тумблер, чтобы расчет был от акционной стоимости помещения." />
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Расчет от акционной цены</div>
                      </div>
                  </div>

                  <div className="p-4 flex items-center gap-4">
                      <Switch checked={respectLimits} onChange={setRespectLimits} />
                      <div className="min-w-0">
                        <div className="flex items-center">
                          <span className="text-[12px] font-bold text-slate-800">Лимиты ипотеки</span>
                          <TooltipIcon text="Если тумблер включен, то в ипотечном калькуляторе, ПВ будет рассчитываться с учетом лимитов ипотеки. Например, если квартира стоит дороже 7,5 млн.руб., и сумма ипотеки превышает 6 млн.руб., то минимальный ПВ будет увеличен автоматически." />
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Коррекция ПВ по лимитам</div>
                      </div>
                  </div>

                  <div className="p-4 flex items-center gap-4">
                      <Switch checked={isCapitalCity} onChange={setIsCapitalCity} />
                      <div className="min-w-0">
                        <div className="flex items-center">
                          <span className="text-[12px] font-bold text-slate-800">МСК или СПБ</span>
                          <TooltipIcon text="Если ваш ЖК находится в МСК или СПБ, то лимиты по ипотеки в калькуляторе будут рассчитываться с учетом этих регионов." />
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Региональные лимиты (МСК/СПБ)</div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <MultiSelect 
                  className="w-56"
                  placeholder="Все банки"
                  options={bankNameOptions}
                  selected={bankNameFilters}
                  onChange={setBankNameFilters}
                  allValue="all"
                />
                
                <MultiSelect 
                  className="w-48"
                  placeholder="Все статусы"
                  options={[
                    { label: 'Все статусы', value: 'all' },
                    { label: 'Активные', value: 'active' },
                    { label: 'Неактивные', value: 'inactive' },
                  ]}
                  selected={statusFilters}
                  onChange={(vals) => setStatusFilters(vals as BankFilter[])}
                  allValue="all"
                />

                <MultiSelect 
                  className="w-52"
                  placeholder="Все программы"
                  options={[
                    { label: 'Все программы', value: 'all' },
                    { label: 'С программами', value: 'with_programs' },
                    { label: 'Без программ', value: 'no_programs' },
                  ]}
                  selected={programFilters}
                  onChange={(vals) => setProgramFilters(vals as ProgramFilter[])}
                  allValue="all"
                />
            </div>

            {selectedBankIds.size > 0 && (
              <div className="flex items-center gap-2 animate-fade-in-up bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20">
                <span className="text-[10px] font-bold text-primary mr-1">Выбрано: {selectedBankIds.size}</span>
                <Button variant="ghost" size="sm" onClick={() => handleMassStatusToggle(true)} className="h-7 px-2 text-[10px] font-bold">Активировать</Button>
                <Button variant="ghost" size="sm" onClick={() => handleMassStatusToggle(false)} className="h-7 px-2 text-[10px] font-bold text-slate-400">Деактивировать</Button>
                <Button variant="ghost" size="sm" onClick={handleMassDelete} className="h-7 px-2 text-[10px] font-bold text-danger hover:bg-red-50"><Trash2 size={12} className="mr-1" /> Удалить</Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <BankTable 
            banks={paginatedBanks} 
            selectedIds={selectedBankIds}
            onSelectAll={toggleSelectAll}
            onSelectBank={toggleSelectBank}
            onEdit={(b) => { setEditingBank(b); setIsFormModalOpen(true); }} 
            onDelete={(b) => { setBankToDelete(b); setIsDeleteModalOpen(true); }} 
            onToggleStatus={(bank, status) => {
              setBanks(prev => prev.map(b => b.id === bank.id ? { ...b, isActive: status } : b));
              addToast('success', `Статус банка "${bank.name}" обновлен`);
            }} 
            onAddProgram={(b) => { setEditingBank(b); setIsFormModalOpen(true); }} 
            onMove={(bank, dir) => {
              setBanks(prev => {
                  const i = prev.findIndex(b => b.id === bank.id);
                  const n = [...prev];
                  if (dir === 'up' && i > 0) {
                      const temp = n[i-1];
                      n[i-1] = n[i];
                      n[i] = temp;
                  }
                  else if (dir === 'down' && i < n.length - 1) {
                      const temp = n[i+1];
                      n[i+1] = n[i];
                      n[i] = temp;
                  }
                  return n;
              });
              addToast('info', 'Порядок банков изменен');
            }} 
          />
        </div>

        {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border bg-white disabled:opacity-30 hover:border-primary transition-colors"><ChevronLeft size={16} /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg font-bold border text-[12px] transition-all ${currentPage === page ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white text-slate-500 hover:border-slate-300'}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border bg-white disabled:opacity-30 hover:border-primary transition-colors"><ChevronRight size={16} /></button>
            </div>
        )}
      </main>

      <BankFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={(saved) => {
          setBanks(prev => {
              const i = prev.findIndex(b => b.id === saved.id);
              if (i >= 0) { const n = [...prev]; n[i] = saved; return n; }
              return [saved, ...prev];
          });
          addToast('success', 'Изменения в данных банка сохранены');
      }} initialData={editingBank} />

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={() => {
          setBanks(prev => prev.filter(b => b.id !== bankToDelete?.id));
          addToast('success', `Банк удален`);
      }} title="Удалить банк?" message={`Вы уверены, что хотите удалить "${bankToDelete?.name}"?`} />
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default App;
