export interface MortgageProgram {
  id: string;
  name: string; // Теперь это будет значение из списка
  rate: number;
  minTerm: number;
  maxTerm: number;
  minDownPayment: number; // percentage
  pskMin?: number; // ПСК от
  pskMax?: number; // ПСК до
  conditions?: string; // Описание условий программы
  specialConditions: boolean;
  autoRates: boolean; // Новое поле для автоставок
  targetUnits?: string[]; // ID помещений. Если пусто или undefined - действует на все.
}

export interface Bank {
  id: string;
  name: string;
  logo?: string; // URL or placeholder
  description?: string;
  isActive: boolean;
  autoRates: boolean; // Новое поле для автоставок банка
  programs: MortgageProgram[];
}

export type BankFilter = 'all' | 'active' | 'inactive';
export type ProgramFilter = 'all' | 'with_programs' | 'no_programs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Интерфейсы для шахматки
export interface HousingUnit {
  id: string;
  number: string;
  floor: number;
  riser: number; // номер на площадке (стояк)
  rooms: number;
  area: number;
  price: number;
}

export interface BuildingSection {
  floors: number;
  unitsPerFloor: number;
  units: HousingUnit[];
}