
import React from 'react';
import { Edit2, Trash2, Layers, AlertCircle, Zap, ArrowUp, ArrowDown, Users, Plus } from 'lucide-react';
import { Bank } from '../types';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';

interface BankTableProps {
  banks: Bank[];
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onSelectBank: (id: string) => void;
  onEdit: (bank: Bank) => void;
  onDelete: (bank: Bank) => void;
  onToggleStatus: (bank: Bank, status: boolean) => void;
  onAddProgram: (bank: Bank) => void;
  onMove: (bank: Bank, direction: 'up' | 'down') => void;
}

export const BankTable: React.FC<BankTableProps> = ({ 
  banks, 
  selectedIds,
  onSelectAll,
  onSelectBank,
  onEdit, 
  onDelete, 
  onToggleStatus,
  onAddProgram,
  onMove
}) => {
  if (banks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Layers className="text-slate-400" size={32} /></div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Банки не найдены</h3>
        <p className="text-slate-500 max-w-sm mb-6">Список пуст.</p>
      </div>
    );
  }

  const allSelected = banks.length > 0 && selectedIds.size === banks.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-500 tracking-wider">
              <th className="px-4 py-4 w-12 text-center">
                <input type="checkbox" checked={allSelected} onChange={onSelectAll} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" />
              </th>
              <th className="px-3 py-4 font-bold w-10 text-center"></th>
              <th className="px-6 py-4 font-bold w-[25%]">Банк</th>
              <th className="px-6 py-4 font-bold w-[40%]">Ипотечные программы</th>
              <th className="px-6 py-4 font-bold text-center w-[10%]">Статус</th>
              <th className="px-6 py-4 font-bold text-right w-[15%]">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {banks.map((bank, index) => (
              <tr key={bank.id} className={`transition-colors hover:bg-slate-50/80 group ${selectedIds.has(bank.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-4 text-center align-top pt-6">
                  <input type="checkbox" checked={selectedIds.has(bank.id)} onChange={() => onSelectBank(bank.id)} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" />
                </td>
                <td className="px-3 py-4 align-top">
                    <div className="flex flex-col gap-1 items-center justify-center pt-2">
                        <button onClick={() => onMove(bank, 'up')} disabled={index === 0} className="p-1 rounded hover:bg-slate-200 text-slate-300 hover:text-primary disabled:opacity-0 transition-colors"><ArrowUp size={14} /></button>
                        <button onClick={() => onMove(bank, 'down')} disabled={index === banks.length - 1} className="p-1 rounded hover:bg-slate-200 text-slate-300 hover:text-primary disabled:opacity-0 transition-colors"><ArrowDown size={14} /></button>
                    </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1.5 flex-shrink-0 relative shadow-sm">
                      {bank.logo ? <img src={bank.logo} className="w-full h-full object-contain" alt="" /> : <div className="w-full h-full bg-slate-100 rounded" />}
                      {bank.autoRates && (
                        <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm" title="Автоставки">
                          <Zap size={10} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-base truncate">{bank.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  {bank.programs.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      {bank.programs.map((prog) => {
                        const totalUnits = prog.targetUnits ? Object.values(prog.targetUnits).reduce((acc, units) => acc + units.length, 0) : 0;
                        return (
                          <div key={prog.id} className="flex flex-col text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 leading-tight text-base">{prog.name}</span>
                                {totalUnits > 0 && (
                                   <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-tighter" title="Помещений в программе">
                                      <Users size={10} /> {totalUnits} лотов
                                   </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                                  <span className="text-slate-700">{prog.rate}%</span>
                                  <span>ПВ {prog.minDownPayment}%</span>
                                  <span>{prog.minTerm}-{prog.maxTerm} л.</span>
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-400 text-sm italic py-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} /> <span>Нет программ</span>
                      </div>
                      <button 
                        onClick={() => onAddProgram(bank)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors not-italic"
                      >
                        <Plus size={14} /> Добавить
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-center align-top pt-6">
                  <Switch checked={bank.isActive} onChange={(val) => onToggleStatus(bank, val)} />
                </td>
                <td className="px-6 py-4 text-right align-top pt-5">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(bank)} className="h-9 w-9 p-0 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100"><Edit2 size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(bank)} className="h-9 w-9 p-0 text-slate-400 hover:text-danger hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100"><Trash2 size={16} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
