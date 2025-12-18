import { Bank, BuildingSection, HousingUnit } from '../types';

// Генератор шахматки для демонстрации
const generateMockBuilding = (): BuildingSection => {
  const floors = 12;
  const unitsPerFloor = 6;
  const units: HousingUnit[] = [];

  for (let f = 1; f <= floors; f++) {
    for (let r = 1; r <= unitsPerFloor; r++) {
      units.push({
        id: `f${f}_r${r}`,
        number: `${(f - 1) * unitsPerFloor + r}`,
        floor: f,
        riser: r,
        rooms: r <= 2 ? 1 : r <= 4 ? 2 : 3, // 1-2 однушки, 3-4 двушки, 5-6 трешки
        area: 35 + Math.random() * 50,
        price: 5000000 + Math.random() * 5000000
      });
    }
  }

  return { floors, unitsPerFloor, units };
};

export const mockBuilding = generateMockBuilding();

export const initialBanks: Bank[] = [
  {
    id: '1',
    name: 'Сбербанк',
    logo: 'https://companieslogo.com/img/orig/SBER.ME-1004a469.png?t=1720244493',
    description: 'Крупнейший банк страны с широким спектром ипотечных продуктов.',
    isActive: true,
    autoRates: true,
    programs: [
      {
        id: 'p1',
        name: 'Семейная ипотека',
        rate: 6.0,
        minTerm: 1,
        maxTerm: 30,
        minDownPayment: 20,
        pskMin: 6.1,
        pskMax: 7.5,
        conditions: 'Программа для семей с детьми. Требуется подтверждение дохода и наличие ребенка, рожденного после 2018 года.',
        specialConditions: true,
        autoRates: true,
      },
      {
        id: 'p2',
        name: 'Стандартная ипотека',
        rate: 16.5,
        minTerm: 1,
        maxTerm: 30,
        minDownPayment: 15,
        pskMin: 16.8,
        pskMax: 18.2,
        conditions: 'Базовая программа на покупку готового или строящегося жилья без субсидий.',
        specialConditions: false,
        autoRates: false,
      },
    ],
  },
  {
    id: '2',
    name: 'ВТБ',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/VTB_Logo_2018_color.png',
    description: 'Выгодные ставки на новостройки от партнеров.',
    isActive: true,
    autoRates: false,
    programs: [
      {
        id: 'p3',
        name: 'IT ипотека',
        rate: 5.0,
        minTerm: 1,
        maxTerm: 30,
        minDownPayment: 15,
        pskMin: 5.1,
        pskMax: 6.0,
        conditions: 'Льготная программа для сотрудников аккредитованных IT-компаний. Возраст от 22 до 50 лет.',
        specialConditions: true,
        autoRates: false,
      },
    ],
  },
  {
    id: '3',
    name: 'Альфа-Банк',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Alfa-Bank_logo_2008_2.svg/1200px-Alfa-Bank_logo_2008_2.svg.png',
    description: 'Гибкие условия для предпринимателей и самозанятых.',
    isActive: false,
    autoRates: false,
    programs: [],
  },
];