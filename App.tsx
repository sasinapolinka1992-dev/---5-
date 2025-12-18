
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
  { name: 'Россельхозбанк', logo: '' },
  { name: 'Совкомбанк', logo: '' },
  { name: 'Промсвязьбанк', logo: '' },
  { name: 'Открытие', logo: '' },
  { name: 'Росбанк', logo: '' },
];

const BANKS_PER_PAGE = 6;

const App: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>(initialBanks);
  
  const [applyToAll, setApplyToAll] = useState(true);
  const [usePromoPrice, setUsePromoPrice] = useState(false);
  const [respectLimits, setRespectLimits] = useState(true);
  const [isCapitalCity, setIsCapitalCity] = useState(false);

  const [selectedBankId, setSelectedBankId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<BankFilter>('all');
  const [programFilter, setProgramFilter] = useState<ProgramFilter>('all');
  
  const [currentPage, setCurrentPage] = useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [formModalInitialTab, setFormModalInitialTab] = useState<'general' | 'programs' | 'none'>('none');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Сбрасываем страницу на 1 при изменении любых фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBankId, statusFilter, programFilter]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const filteredBanks = useMemo(() => {
    return banks.filter(bank => {
      const matchesBank = selectedBankId === 'all' ? true : bank.id === selectedBankId;
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'active' ? bank.isActive 
        : !bank.isActive;
      const matchesPrograms = programFilter === 'all'
        ? true
        : programFilter === 'with_programs' ? bank.programs.length > 0
        : bank.programs.length === 0;

      return matchesBank && matchesStatus && matchesPrograms;
    });
  }, [banks, selectedBankId, statusFilter, programFilter]);

  // Пагинация
  const totalPages = Math.ceil(filteredBanks.length / BANKS_PER_PAGE);
  const paginatedBanks = useMemo(() => {
    const startIndex = (currentPage - 1) * BANKS_PER_PAGE;
    return filteredBanks.slice(startIndex, startIndex + BANKS_PER_PAGE);
  }, [filteredBanks, currentPage]);

  const availablePredefinedBanks = useMemo(() => {
    return PREDEFINED_BANKS.filter(pb => !banks.some(b => b.name === pb.name));
  }, [banks]);

  const handleAddBankSelect = (bankName: string) => {
    setIsAddMenuOpen(false);
    const predefined = PREDEFINED_BANKS.find(b => b.name === bankName);
    const newBank: Bank = {
        id: Date.now().toString(),
        name: bankName,
        logo: predefined?.logo || '',
        description: '',
        isActive: true,
        autoRates: false,
        programs: []
    };
    setEditingBank(newBank);
    setFormModalInitialTab('general');
    setIsFormModalOpen(true);
  };

  const handleEditBank = (bank: Bank) => {
    setEditingBank(bank);
    setFormModalInitialTab('general');
    setIsFormModalOpen(true);
  };

  const handleAddProgramDirectly = (bank: Bank) => {
    setEditingBank(bank);
    setFormModalInitialTab('programs');
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (bank: Bank) => {
    setBankToDelete(bank);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (bankToDelete) {
      setBanks(prev => prev.filter(b => b.id !== bankToDelete.id));
      addToast('success', `Банк "${bankToDelete.name}" успешно удален.`);
      setBankToDelete(null);
    }
  };

  const handleSaveBank = (savedBank: Bank) => {
    setBanks(prev => {
        const index = prev.findIndex(b => b.id === savedBank.id);
        if (index >= 0) {
            const newBanks = [...prev];
            newBanks[index] = savedBank;
            addToast('success', `Данные банка "${savedBank.name}" сохранены.`);
            return newBanks;
        } else {
            addToast('success', `Банк "${savedBank.name}" добавлен в список.`);
            return [savedBank, ...prev];
        }
    });
  };

  const handleToggleStatus = (bank: Bank, status: boolean) => {
    setBanks(prev => prev.map(b => b.id === bank.id ? { ...b, isActive: status } : b));
    addToast('info', `Банк "${bank.name}" ${status ? 'активирован' : 'деактивирован'}.`);
  };

  const handleMoveBank = (bank: Bank, direction: 'up' | 'down') => {
    setBanks(prev => {
        const index = prev.findIndex(b => b.id === bank.id);
        if (index === -1) return prev;
        const newBanks = [...prev];
        if (direction === 'up' && index > 0) {
            [newBanks[index - 1], newBanks[index]] = [newBanks[index], newBanks[index - 1]];
        } else if (direction === 'down' && index < newBanks.length - 1) {
             [newBanks[index + 1], newBanks[index]] = [newBanks[index], newBanks[index + 1]];
        }
        return newBanks;
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Настройки банков</h1>
            <p className="text-gray-500 mt-1">Управление программами кредитования для всех проектов.</p>
          </div>
          
          <div className="relative" ref={addMenuRef}>
            <Button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} icon={<Plus size={18} />} className="pr-3">
                Добавить банк
                <ChevronDown size={16} className={`ml-2 transition-transform ${isAddMenuOpen ? 'rotate-180' : ''}`} />
            </Button>
            {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                    <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Доступные банки</div>
                        {availablePredefinedBanks.length > 0 ? (
                          availablePredefinedBanks.map((bank) => (
                            <div key={bank.name} onClick={() => handleAddBankSelect(bank.name)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 cursor-pointer">
                                {bank.logo ? <img src={bank.logo} alt="" className="w-6 h-6 object-contain" /> : <div className="w-6 h-6 bg-gray-100 rounded-full" />}
                                {bank.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-xs text-gray-400 italic text-center">Все доступные банки добавлены</div>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                    <Switch 
                      checked={usePromoPrice} 
                      onChange={setUsePromoPrice} 
                      label={usePromoPrice ? "Расчет ипотеки от акционной стоимости" : "Расчет ипотеки от стоимости"} 
                    />
                    <Switch checked={respectLimits} onChange={setRespectLimits} label="Учитывать лимиты по ипотеке" />
                </div>
                <div className="pt-5 border-t border-gray-100 flex flex-wrap items-center gap-x-10 gap-y-4">
                    <Switch checked={isCapitalCity} onChange={setIsCapitalCity} label="ЖК находится в МСК или СПБ" />
                    <Switch checked={applyToAll} onChange={setApplyToAll} label="Применить ко всем проектам" />
                </div>
            </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 mr-2">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Фильтры:</span>
                </div>
                <div className="UNI_select w-full sm:w-72">
                    <select value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)}>
                        <option value="all">Все банки</option>
                        {banks.map(bank => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
                    </select>
                </div>
                <div className="UNI_select w-full sm:w-72">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BankFilter)}>
                        <option value="all">Все статусы</option>
                        <option value="active">Активные</option>
                        <option value="inactive">Неактивные</option>
                    </select>
                </div>
                <div className="UNI_select w-full sm:w-72">
                    <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value as ProgramFilter)}>
                        <option value="all">Все программы</option>
                        <option value="with_programs">С программами</option>
                        <option value="no_programs">Без программ</option>
                    </select>
                </div>
            </div>
        </div>

        <BankTable 
          banks={paginatedBanks} 
          onEdit={handleEditBank}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
          onAddProgram={handleAddProgramDirectly}
          onMove={handleMoveBank}
        />

        {/* Пагинация (если больше 6 банков) */}
        {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-primary hover:border-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                currentPage === page 
                                    ? 'bg-primary text-white shadow-md' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-primary hover:border-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 px-8 mt-auto">
         <div className="max-w-[1600px] mx-auto flex justify-between items-center text-sm text-gray-500">
            <p>Последнее обновление конфигурации: {new Date().toLocaleDateString()}</p>
            <p>© 2025 Административная панель управления</p>
         </div>
      </footer>

      <BankFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveBank}
        initialData={editingBank}
        initialTab={formModalInitialTab}
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Удалить банк?"
        message={`Вы уверены, что хотите удалить "${bankToDelete?.name}"? Это также удалит все связанные программы.`}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;
