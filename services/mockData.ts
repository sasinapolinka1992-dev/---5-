
import { Bank, BuildingSection, HousingUnit } from '../types';

const generateMockBuilding = (): BuildingSection => {
  const unitsPerFloor = 4;
  const sectionsCount = 6;
  // Массив высот для каждой секции
  const sectionHeights = [12, 16, 10, 14, 8, 11];
  const maxFloors = Math.max(...sectionHeights);
  const units: HousingUnit[] = [];

  for (let s = 1; s <= sectionsCount; s++) {
    const currentSectionHeight = sectionHeights[s - 1];
    for (let f = 1; f <= currentSectionHeight; f++) {
      for (let r = 1; r <= unitsPerFloor; r++) {
        units.push({
          id: `s${s}_f${f}_r${r}`,
          number: `${s}${(f).toString().padStart(2, '0')}${r}`,
          floor: f,
          riser: r,
          section: s,
          rooms: r === 1 ? 1 : r === 2 ? 2 : 3,
          area: 35 + Math.random() * 50,
          price: 5000000 + Math.random() * 5000000
        });
      }
    }
  }

  return { floors: maxFloors, sectionHeights, unitsPerFloor, units, sectionsCount };
};

export const mockBuilding = generateMockBuilding();

export const initialBanks: Bank[] = [
  {
    id: '1',
    name: 'Сбербанк',
    logo: 'https://companieslogo.com/img/orig/SBER.ME-1004a469.png?t=1720244493',
    description: '',
    isActive: true,
    autoRates: false, // У Сбербанка нет автоставок
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
        conditions: 'Программа для семей с детьми.',
        autoRates: false,
        targetUnits: {},
      }
    ],
  },
  {
    id: '2',
    name: 'ВТБ',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/VTB_Logo_2018_color.png',
    description: '',
    isActive: true,
    autoRates: true, // У ВТБ есть автоставки
    programs: [],
  }
];
