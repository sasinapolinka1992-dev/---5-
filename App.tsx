
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, ChevronDown, ChevronLeft, ChevronRight, Info, Search, X, Settings2, CheckSquare, Square } from 'lucide-react';
import { initialBanks } from './services/mockData';
import { Bank, BankFilter, ProgramFilter, ToastMessage } from './types';
import { Button } from './components/ui/Button';
import { Switch } from './components/ui/Switch';
import { BankTable } from './components/BankTable';
import { BankFormModal } from './components/BankFormModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ToastContainer } from './components/Toast';

const PREDEFINED_BANKS = [
  { name: 'Сбербанк', logo: 'https://companieslogo.com/img/orig/SBER.ME-1004a469.png?t=1720244493' },
  { name: 'ВТБ', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/VTB_Logo_2018_color.png' },
  { name: 'Альфа-Банк', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Alfa-Bank_logo_2008_2.svg/1200px-Alfa-Bank_logo_2008_2.svg.png' },
  { name: 'Дом.РФ', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/DOM.RF_Logo.svg/1200px-DOM.RF_Logo.svg.png' },
  { name: 'Газпромбанк', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Gazprombank_logo.svg/2560px-Gazprombank_logo.svg.png' },
  { name: 'Промсвязьбанк', logo: '' },
  { name: 'Россельхозбанк', logo: '' },
  { name: 'Совкомбанк', logo: '' },
  { name: 'Тинькофф Банк', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Tinkoff_Logo.png' },
  { name: 'Райффайзенбанк', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Raiffeisen_Bank_International_logo.svg/1200px-Raiffeisen_Bank_International_logo.svg.png' },
  { name: 'Открытие', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Otkritie_Bank_Logo_2018.svg/2560px-Otkritie_Bank_Logo_2018.svg.png' },
];

const PROJECTS = ['ЖК Легенда', 'ЖК Квартал 17', 'ЖК Символ', 'ЖК Прайм', 'ЖК Отражение'];

const BANKS_PER_PAGE = 20;

export const TooltipIcon: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative inline-flex items-center ml-1.5">
    <Info size={14} className="text-gray-400 cursor-help hover:text-primary transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[200] shadow-2xl leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
    </div>
  </div>
);

const App: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>(initialBanks);
  
  // Акционная стоимость по умолчанию выключена
  const [usePromoPrice, setUsePromoPrice] = useState(false);
  const [respectLimits, setRespectLimits] = useState(true);
  const [isCapitalCity, setIsCapitalCity] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = useState(false);

  const [addBankSearch, setAddBankSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BankFilter>('all');
  const [programFilter, setProgramFilter] = useState<ProgramFilter>('all');
  const [bankNameFilter, setBankNameFilter] = useState<string>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addMenuRef = useRef<HTMLDivElement>(null);
  const projectsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
        setAddBankSearch('');
      }
      if (projectsMenuRef.current && !projectsMenuRef.current.contains(event.target as Node)) {
        setIsProjectsMenuOpen(false);
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
      const matchesBankName = bankNameFilter === 'all' ? true : bank.name === bankNameFilter;
      const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? bank.isActive : !bank.isActive;
      const matchesPrograms = programFilter === 'all' ? true : programFilter === 'with_programs' ? bank.programs.length > 0 : bank.programs.length === 0;
      return matchesBankName && matchesStatus && matchesPrograms;
    });
  }, [banks, bankNameFilter, statusFilter, programFilter]);

  const totalPages = Math.ceil(filteredBanks.length / BANKS_PER_PAGE);
  const paginatedBanks = useMemo(() => {
    const startIndex = (currentPage - 1) * BANKS_PER_PAGE;
    return filteredBanks.slice(startIndex, startIndex + BANKS_PER_PAGE);
  }, [filteredBanks, currentPage]);

  const toggleProject = (project: string) => {
    setSelectedProjects(prev => prev.includes(project) ? prev.filter(p => p !== project) : [...prev, project]);
  };

  const toggleAllProjects = () => {
    if (selectedProjects.length === PROJECTS.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects([...PROJECTS]);
    }
  };

  const filteredAddBanks = PREDEFINED_BANKS.filter(pb => 
    !banks.some(b => b.name === pb.name) && 
    pb.name.toLowerCase().includes(addBankSearch.toLowerCase())
  );

  const uniqueBankNames = useMemo(() => {
    return Array.from(new Set(banks.map(b => b.name))).sort();
  }, [banks]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50/50">
      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Настройки банков</h1>
            <p className="text-gray-500 mt-1.5 text-sm font-medium">Управление программами ипотечного калькулятора</p>
          </div>
          <div className="relative" ref={addMenuRef}>
            <Button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className="pr-4 font-bold min-w-[200px] shadow-lg shadow-primary/20 hover:shadow-primary/30 h-11">
                Добавить банк
                <ChevronDown size={16} className={`ml-2 transition-transform duration-300 ${isAddMenuOpen ? 'rotate-180' : ''}`} />
            </Button>
            {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[110] overflow-hidden animate-fade-in-up">
                    <div className="p-4 border-b bg-gray-50/50">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="Поиск банка..." 
                              value={addBankSearch}
                              autoFocus
                              onChange={(e) => setAddBankSearch(e.target.value)}
                              className="UNI_input h-10 pl-10 text-sm rounded-xl border-gray-200"
                            />
                        </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto py-2">
                        {filteredAddBanks.length > 0 ? filteredAddBanks.map((bank) => (
                            <div key={bank.name} onClick={() => {
                                setIsAddMenuOpen(false);
                                setAddBankSearch('');
                                setEditingBank({ id: Date.now().toString(), name: bank.name, logo: bank.logo, isActive: true, autoRates: false, programs: [] });
                                setIsFormModalOpen(true);
                            }} className="px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-4 cursor-pointer">
                                {bank.logo ? <img src={bank.logo} className="w-8 h-8 object-contain rounded-md" /> : <div className="w-8 h-8 bg-gray-100 rounded-md" />}
                                <span className="font-medium">{bank.name}</span>
                            </div>
                        )) : (
                          <div className="px-5 py-8 text-center text-gray-400 text-xs italic">Банки не найдены</div>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Блок настроек с исправленным наложением (z-index) */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm mb-10 overflow-visible relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {/* Выбор проектов */}
                <div 
                  className={`p-6 flex flex-col justify-center relative transition-all ${isProjectsMenuOpen ? 'z-50 bg-blue-50/10' : 'z-20 hover:z-30 hover:bg-gray-50/30'}`} 
                  ref={projectsMenuRef}
                >
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Применить к проектам</label>
                    <button 
                      onClick={() => setIsProjectsMenuOpen(!isProjectsMenuOpen)} 
                      className="flex items-center gap-3 w-full text-left transition-all group"
                    >
                        <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Settings2 size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-800 truncate">
                                {selectedProjects.length === 0 ? 'Выберите проекты' : 
                                 selectedProjects.length === PROJECTS.length ? 'Все проекты' :
                                 `Выбрано: ${selectedProjects.length}`}
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">Кликните для выбора</div>
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProjectsMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProjectsMenuOpen && (
                        <div className="absolute left-6 top-full mt-2 w-72 bg-white border rounded-2xl shadow-2xl p-4 z-[100] space-y-1.5 animate-fade-in-up border-gray-100">
                            <button 
                              onClick={toggleAllProjects}
                              className="flex items-center gap-3 p-2.5 w-full hover:bg-primary/5 rounded-xl cursor-pointer transition-colors group text-left border-b border-gray-50 pb-3 mb-2"
                            >
                                <div className={`transition-colors ${selectedProjects.length === PROJECTS.length ? 'text-primary' : 'text-gray-300'}`}>
                                    {selectedProjects.length === PROJECTS.length ? <CheckSquare size={18} fill="currentColor" className="text-white stroke-primary" /> : <Square size={18} />}
                                </div>
                                <span className={`text-sm font-bold ${selectedProjects.length === PROJECTS.length ? 'text-primary' : 'text-gray-700'}`}>Выбрать все проекты</span>
                            </button>
                            <div className="max-h-60 overflow-y-auto pr-1">
                                {PROJECTS.map(p => (
                                    <label key={p} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group">
                                        <div className={`transition-colors ${selectedProjects.includes(p) ? 'text-primary' : 'text-gray-300'}`}>
                                            {selectedProjects.includes(p) ? <CheckSquare size={18} fill="currentColor" className="text-white stroke-primary" /> : <Square size={18} />}
                                        </div>
                                        <input type="checkbox" checked={selectedProjects.includes(p)} onChange={() => toggleProject(p)} className="hidden" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{p}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Переключатель 1 (Акционная стоимость) */}
                <div className="p-6 flex items-center gap-5 hover:bg-gray-50/50 transition-colors relative z-10 group/item hover:z-30">
                    <div className="shrink-0 scale-110">
                        <Switch checked={usePromoPrice} onChange={setUsePromoPrice} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center">
                            <span className="text-sm font-bold text-gray-800 leading-tight">Акционная стоимость</span>
                            <TooltipIcon text="По умолчанию расчет ипотеки рассчитывается от прайсовой стоимости. Включите тумблер, чтобы расчет ипотеки был от акционной стоимости помещения." />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Расчет от акционной цены</p>
                    </div>
                </div>

                {/* Переключатель 2 */}
                <div className="p-6 flex items-center gap-5 hover:bg-gray-50/50 transition-colors relative z-10 group/item hover:z-30">
                    <div className="shrink-0 scale-110">
                        <Switch checked={respectLimits} onChange={setRespectLimits} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center">
                            <span className="text-sm font-bold text-gray-800 leading-tight">Лимиты ипотеки</span>
                            <TooltipIcon text="Если тумблер включен, то в ипотечном калькуляторе ПВ будет рассчитываться с учетом лимитов ипотеки. Например, если квартира стоит дороже 7,5 млн.руб, и сумма ипотеки превышает 6 млн.руб, минимальный ПВ будет увеличен." />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Коррекция ПВ по лимитам</p>
                    </div>
                </div>

                {/* Переключатель 3 */}
                <div className="p-6 flex items-center gap-5 hover:bg-gray-50/50 transition-colors relative z-10 group/item hover:z-30">
                    <div className="shrink-0 scale-110">
                        <Switch checked={isCapitalCity} onChange={setIsCapitalCity} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center">
                            <span className="text-sm font-bold text-gray-800 leading-tight">МСК или СПБ</span>
                            <TooltipIcon text="Если ваш ЖК находится в МСК или СПБ, то лимиты по ипотеке будут рассчитываться в калькуляторе с учетом этих регионов." />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Региональные лимиты (МСК/СПБ)</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Фильтры */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 mb-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-4 justify-start">
                <div className="UNI_select w-72">
                    <select value={bankNameFilter} onChange={(e) => setBankNameFilter(e.target.value)} className="rounded-xl border-gray-100">
                        <option value="all">Все банки</option>
                        {uniqueBankNames.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <div className="UNI_select w-56">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BankFilter)} className="rounded-xl border-gray-100">
                        <option value="all">Все статусы</option>
                        <option value="active">Только активные</option>
                        <option value="inactive">Неактивные</option>
                    </select>
                </div>
                <div className="UNI_select w-56">
                    <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value as ProgramFilter)} className="rounded-xl border-gray-100">
                        <option value="all">Все программы</option>
                        <option value="with_programs">С программами</option>
                        <option value="no_programs">Без программ</option>
                    </select>
                </div>
            </div>
        </div>

        <BankTable banks={paginatedBanks} onEdit={(b) => { setEditingBank(b); setIsFormModalOpen(true); }} onDelete={(b) => { setBankToDelete(b); setIsDeleteModalOpen(true); }} onToggleStatus={(bank, status) => setBanks(prev => prev.map(b => b.id === bank.id ? { ...b, isActive: status } : b))} onAddProgram={(b) => { setEditingBank(b); setIsFormModalOpen(true); }} onMove={(bank, dir) => {
            setBanks(prev => {
                const i = prev.findIndex(b => b.id === bank.id);
                const n = [...prev];
                if (dir === 'up' && i > 0) [n[i-1], n[i]] = [n[i], n[i-1]];
                else if (dir === 'down' && i < n.length - 1) [n[i+1], n[i]] = [n[i+1], n[i]];
                return n;
            });
        }} />

        {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-xl border bg-white disabled:opacity-30 transition-all hover:bg-gray-50 active:scale-95 shadow-sm"><ChevronLeft size={20} /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-11 h-11 rounded-xl font-bold transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white border border-gray-100 text-gray-400 hover:border-primary hover:text-primary active:scale-95 shadow-sm'}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 rounded-xl border bg-white disabled:opacity-30 transition-all hover:bg-gray-50 active:scale-95 shadow-sm"><ChevronRight size={20} /></button>
            </div>
        )}
      </main>

      <BankFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={(saved) => setBanks(prev => {
          const i = prev.findIndex(b => b.id === saved.id);
          if (i >= 0) { const n = [...prev]; n[i] = saved; addToast('success', `Данные "${saved.name}" обновлены`); return n; }
          addToast('success', `Банк "${saved.name}" добавлен`); return [saved, ...prev];
      })} initialData={editingBank} />

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={() => {
          setBanks(prev => prev.filter(b => b.id !== bankToDelete?.id));
          addToast('success', `Банк "${bankToDelete?.name}" удален`);
      }} title="Удалить банк?" message={`Вы уверены, что хотите удалить "${bankToDelete?.name}"?`} />
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default App;
