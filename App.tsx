
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, ChevronDown, ChevronLeft, ChevronRight, Info, Search, X } from 'lucide-react';
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-normal">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800" />
    </div>
  </div>
);

const App: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>(initialBanks);
  
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
      if (projectsMenuRef.current && !projectsMenuRef.current.contains(event.target as Node)) setIsProjectsMenuOpen(false);
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

  const filteredAddBanks = PREDEFINED_BANKS.filter(pb => 
    !banks.some(b => b.name === pb.name) && 
    pb.name.toLowerCase().includes(addBankSearch.toLowerCase())
  );

  const uniqueBankNames = useMemo(() => {
    return Array.from(new Set(banks.map(b => b.name))).sort();
  }, [banks]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Настройки банков</h1>
            <p className="text-gray-500 mt-1">Управление программами кредитования для всех проектов.</p>
          </div>
          <div className="relative" ref={addMenuRef}>
            <Button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className="pr-4 font-bold min-w-[200px]">
                Добавить банк
                <ChevronDown size={16} className={`ml-2 transition-transform ${isAddMenuOpen ? 'rotate-180' : ''}`} />
            </Button>
            {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                    <div className="p-3 border-b bg-gray-50">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="Поиск банка..." 
                              value={addBankSearch}
                              autoFocus
                              onChange={(e) => setAddBankSearch(e.target.value)}
                              className="UNI_input h-9 pl-9 text-sm"
                            />
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                        {filteredAddBanks.length > 0 ? filteredAddBanks.map((bank) => (
                            <div key={bank.name} onClick={() => {
                                setIsAddMenuOpen(false);
                                setAddBankSearch('');
                                setEditingBank({ id: Date.now().toString(), name: bank.name, logo: bank.logo, isActive: true, autoRates: false, programs: [] });
                                setIsFormModalOpen(true);
                            }} className="px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 cursor-pointer">
                                {bank.logo ? <img src={bank.logo} className="w-6 h-6 object-contain" /> : <div className="w-6 h-6 bg-gray-100 rounded-full" />}
                                {bank.name}
                            </div>
                        )) : (
                          <div className="px-4 py-6 text-center text-gray-400 text-xs italic">Банки не найдены</div>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Настройки в одну линию */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-10">
            <div className="flex flex-wrap items-center gap-10">
                <div className="relative" ref={projectsMenuRef}>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Применить настройки к проектам:</span>
                        <button onClick={() => setIsProjectsMenuOpen(!isProjectsMenuOpen)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 border rounded-lg text-sm hover:bg-gray-100 min-w-[240px] justify-between transition-all">
                            <span className="truncate">{selectedProjects.length === 0 ? 'Выберите проекты' : `Выбрано: ${selectedProjects.length}`}</span>
                            <ChevronDown size={14} className={`shrink-0 transition-transform ${isProjectsMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    {isProjectsMenuOpen && (
                        <div className="absolute left-0 mt-2 w-64 bg-white border rounded-xl shadow-xl p-3 z-20 space-y-2 animate-fade-in-up">
                            {PROJECTS.map(p => (
                                <label key={p} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                                    <input type="checkbox" checked={selectedProjects.includes(p)} onChange={() => toggleProject(p)} className="rounded text-primary focus:ring-primary w-4 h-4" />
                                    <span className="text-sm">{p}</span>
                                </label>
                            ))}
                            {selectedProjects.length > 0 && (
                                <div className="pt-2 mt-1 border-t">
                                    <button onClick={() => setSelectedProjects([])} className="text-[10px] text-gray-400 hover:text-danger uppercase font-bold tracking-wider w-full text-center">Сбросить выбор</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2.5">
                    <Switch checked={usePromoPrice} onChange={setUsePromoPrice} label="Расчет ипотеки от акционной стоимости" />
                    <TooltipIcon text="По умолчанию расчет ипотеки рассчитывается от прайсовой стоимости. Включите тумблер, чтобы расчет ипотеки был от акционной стоимости помещения." />
                </div>

                <div className="flex items-center gap-2.5">
                    <Switch checked={respectLimits} onChange={setRespectLimits} label="Учитывать лимиты по ипотеке" />
                    <TooltipIcon text="Если тумблер включен, то в ипотечном калькуляторе ПВ будет рассчитываться с учетом лимитов ипотеки. Например, если квартира стоит дороже 7,5 млн.руб, и сумма ипотеки превышает 6 млн.руб, минимальный ПВ будет увеличен." />
                </div>

                <div className="flex items-center gap-2.5">
                    <Switch checked={isCapitalCity} onChange={setIsCapitalCity} label="ЖК находится в МСК или СПБ" />
                    <TooltipIcon text="Если ваш ЖК находится в МСК или СПБ, то лимиты по ипотеке будут рассчитываться в калькуляторе с учетом этих регионов." />
                </div>
            </div>
        </div>

        {/* Фильтры выровнены по левому краю */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8">
            <div className="flex flex-wrap items-center gap-4 justify-start">
                <div className="UNI_select w-72">
                    <select value={bankNameFilter} onChange={(e) => setBankNameFilter(e.target.value)}>
                        <option value="all">Все банки</option>
                        {uniqueBankNames.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <div className="UNI_select w-56">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BankFilter)}>
                        <option value="all">Все статусы</option>
                        <option value="active">Только активные</option>
                        <option value="inactive">Неактивные</option>
                    </select>
                </div>
                <div className="UNI_select w-56">
                    <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value as ProgramFilter)}>
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
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-xl border bg-white disabled:opacity-30"><ChevronLeft size={20} /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-12 h-12 rounded-xl font-bold transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg' : 'bg-white border hover:border-primary'}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 rounded-xl border bg-white disabled:opacity-30"><ChevronRight size={20} /></button>
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
