import React from 'react';
import { Edit2, Trash2, Layers, AlertCircle, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { Bank } from '../types';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';

interface BankTableProps {
  banks: Bank[];
  onEdit: (bank: Bank) => void;
  onDelete: (bank: Bank) => void;
  onToggleStatus: (bank: Bank, status: boolean) => void;
  onAddProgram: (bank: Bank) => void;
  onMove: (bank: Bank, direction: 'up' | 'down') => void;
}

export const BankTable: React.FC<BankTableProps> = ({ 
  banks, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onAddProgram,
  onMove
}) => {
  if (banks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Layers className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Банки не найдены</h3>
        <p className="text-gray-500 max-w-sm mb-6">
          Список банков пуст. Добавьте новый банк, чтобы начать работу с калькулятором.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
              <th className="px-3 py-4 font-semibold w-10 text-center"></th>
              <th className="px-6 py-4 font-semibold w-[25%]">Банк</th>
              <th className="px-6 py-4 font-semibold w-[40%]">Ипотечные программы</th>
              <th className="px-6 py-4 font-semibold text-center w-[10%]">Статус</th>
              <th className="px-6 py-4 font-semibold text-right w-[15%]">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {banks.map((bank, index) => (
              <tr key={bank.id} className="transition-colors hover:bg-gray-50 group">
                {/* Column: Sort Actions */}
                <td className="px-3 py-4 align-top">
                    <div className="flex flex-col gap-1 items-center justify-center pt-2">
                        <button 
                            onClick={() => onMove(bank, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-primary disabled:opacity-0 transition-colors"
                            title="Поднять выше"
                        >
                            <ArrowUp size={16} />
                        </button>
                        <button 
                            onClick={() => onMove(bank, 'down')}
                            disabled={index === banks.length - 1}
                            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-primary disabled:opacity-0 transition-colors"
                            title="Опустить ниже"
                        >
                            <ArrowDown size={16} />
                        </button>
                    </div>
                </td>

                {/* Column: Bank Info */}
                <td className="px-6 py-4 align-top">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 p-1.5 flex-shrink-0 relative">
                      {bank.logo ? <img src={bank.logo} className="w-full h-full object-contain" alt="" /> : <div className="w-full h-full bg-gray-100 rounded" />}
                      {bank.autoRates && (
                        <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm" title="Автоставки банка">
                          <Zap size={10} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-base">
                        {bank.name}
                      </div>
                      {bank.description && <div className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed max-w-xs">{bank.description}</div>}
                    </div>
                  </div>
                </td>
                
                {/* Column: Programs */}
                <td className="px-6 py-4 align-top">
                  {bank.programs.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {bank.programs.map((prog) => (
                        <div key={prog.id} className="flex flex-wrap items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-100 transition-colors">
                            <div className="font-medium text-gray-800 mr-auto">
                                {prog.name}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="bg-white text-gray-700 border border-gray-200 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                                    {prog.rate}%
                                </span>
                                <span className="bg-white text-gray-500 border border-gray-200 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                                    ПВ {prog.minDownPayment}%
                                </span>
                                {prog.targetUnits && prog.targetUnits.length > 0 && (
                                   <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium whitespace-nowrap" title="Действует только на выбранные помещения">
                                       {prog.targetUnits.length} пом.
                                   </span>
                                )}
                            </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 text-sm italic py-2">
                      <AlertCircle size={16} />
                      <span>Нет программ</span>
                      <Button size="sm" variant="ghost" className="text-primary h-auto p-0 hover:bg-transparent ml-1 font-normal underline decoration-dashed underline-offset-4" onClick={() => onAddProgram(bank)}>
                        Добавить
                      </Button>
                    </div>
                  )}
                </td>

                {/* Column: Status */}
                <td className="px-6 py-4 text-center align-top pt-6">
                  <div className="flex justify-center">
                    <Switch checked={bank.isActive} onChange={(val) => onToggleStatus(bank, val)} />
                  </div>
                </td>
                
                {/* Column: Actions */}
                <td className="px-6 py-4 text-right align-top pt-5">
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(bank)}
                      title="Редактировать"
                      className="text-gray-400 hover:text-primary hover:bg-blue-50"
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(bank)}
                      title="Удалить"
                      className="text-gray-400 hover:text-danger hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <span className="text-sm text-gray-500">Показано {banks.length} банков</span>
      </div>
    </div>
  );
};