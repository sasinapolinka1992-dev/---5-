import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Filter, Download, ChevronDown } from 'lucide-react';
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

const App: React.FC = () => {
  // --- State ---
  const [banks, setBanks] = useState<Bank[]>(initialBanks);
  
  // Filters
  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedBankId, setSelectedBankId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<BankFilter>('all');
  const [programFilter, setProgramFilter] = useState<ProgramFilter>('all');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [formModalInitialTab, setFormModalInitialTab] = useState<'general' | 'programs'>('general');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);

  // Dropdown menu state
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- Logic ---

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Filtered Banks
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

  // Handlers
  const handleAddBankSelect = (bankName: string) => {
    setIsAddMenuOpen(false);
    
    // Create a template for the selected bank
    const newBank: Bank = {
        id: Date.now().toString(),
        name: bankName === 'custom' ? '' : bankName,
        logo: '',
        description: '',
        isActive: true,
        autoRates: false,
        programs: []
    };

    // Find predefined logo if exists
    if (bankName !== 'custom') {
        const predefined = PREDEFINED_BANKS.find(b => b.name === bankName);
        if (predefined?.logo) newBank.logo = predefined.logo;
    }

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
            // Update existing
            const newBanks = [...prev];
            newBanks[index] = savedBank;
            addToast('success', `Банк "${savedBank.name}" успешно обновлен.`);
            return newBanks;
        } else {
            // Add new
            addToast('success', `Банк "${savedBank.name}" успешно добавлен.`);
            return [savedBank, ...prev];
        }
    });
  };

  const handleToggleStatus = (bank: Bank, status: boolean) => {
    setBanks(prev => prev.map(b => b.id === bank.id ? { ...b, isActive: status } : b));
    addToast('info', `Банк "${bank.name}" теперь ${status ? 'Активен' : 'Неактивен'}.`);
  };

  const handleMoveBank = (bank: Bank, direction: 'up' | 'down') => {
    setBanks(prev => {
        const index = prev.findIndex(b => b.id === bank.id);
        if (index === -1) return prev;
        
        const newBanks = [...prev];
        if (direction === 'up' && index > 0) {
            // Swap with previous
            [newBanks[index - 1], newBanks[index]] = [newBanks[index], newBanks[index - 1]];
        } else if (direction === 'down' && index < newBanks.length - 1) {
             // Swap with next
             [newBanks[index + 1], newBanks[index]] = [newBanks[index], newBanks[index + 1]];
        }
        return newBanks;
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
      
      {/* Main Content */}
      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Настройки банков</h1>
            <p className="text-gray-500 mt-1">Управление банками-партнерами и ипотечными программами для калькулятора.</p>
          </div>
          
          <div className="relative" ref={addMenuRef}>
            <Button 
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} 
                icon={<Plus size={18} />}
                className="pr-3"
            >
                Добавить банк
                <ChevronDown size={16} className={`ml-2 transition-transform ${isAddMenuOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                    <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Выберите банк
                        </div>
                        {PREDEFINED_BANKS.map((bank) => (
                            <div
                                key={bank.name}
                                onClick={() => handleAddBankSelect(bank.name)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 cursor-pointer"
                            >
                                {bank.logo ? (
                                    <img src={bank.logo} alt="" className="w-6 h-6 object-contain" />
                                ) : (
                                    <div className="w-6 h-6 bg-gray-100 rounded-full" />
                                )}
                                {bank.name}
                            </div>
                        ))}
                        <div className="border-t border-gray-100 my-1"></div>
                        <div
                            onClick={() => handleAddBankSelect('custom')}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            Другой банк...
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                
                {/* Switch */}
                <div>
                     <Switch 
                        checked={applyToAll} 
                        onChange={setApplyToAll} 
                        label="Применить ко всем проектам" 
                     />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
                    <div className="flex items-center gap-2 mr-2 whitespace-nowrap self-start sm:self-center">
                        <Filter size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Фильтры:</span>
                    </div>

                    <div className="UNI_select w-full sm:w-48">
                        <select 
                        value={selectedBankId}
                        onChange={(e) => setSelectedBankId(e.target.value)}
                        >
                        <option value="all">Все банки</option>
                        {banks.map(bank => (
                            <option key={bank.id} value={bank.id}>{bank.name}</option>
                        ))}
                        </select>
                        <div className="fake"></div>
                    </div>
                    
                    <div className="UNI_select w-full sm:w-48">
                        <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as BankFilter)}
                        >
                        <option value="all">Все статусы</option>
                        <option value="active">Только активные</option>
                        <option value="inactive">Только неактивные</option>
                        </select>
                        <div className="fake"></div>
                    </div>

                    <div className="UNI_select w-full sm:w-48">
                        <select 
                        value={programFilter}
                        onChange={(e) => setProgramFilter(e.target.value as ProgramFilter)}
                        >
                        <option value="all">Все программы</option>
                        <option value="with_programs">С программами</option>
                        <option value="no_programs">Без программ</option>
                        </select>
                        <div className="fake"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Table Area */}
        <BankTable 
          banks={filteredBanks} 
          onEdit={handleEditBank}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
          onAddProgram={handleAddProgramDirectly}
          onMove={handleMoveBank}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-8 mt-auto">
         <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>
              Настройки влияют на расчеты на страницах квартир мгновенно. Последнее обновление: {new Date().toLocaleDateString()}
            </p>
            <Button variant="outline" size="sm" icon={<Download size={16}/>}>
              Экспорт настроек (JSON)
            </Button>
         </div>
      </footer>

      {/* Modals */}
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
        message={`Вы уверены, что хотите удалить "${bankToDelete?.name}"? Это также удалит все связанные ипотечные программы. Это действие нельзя отменить.`}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

    </div>
  );
};

export default App;