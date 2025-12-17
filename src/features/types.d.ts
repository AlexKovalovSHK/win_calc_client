// types.ts

// --- 1. Базовые данные (Справочники) ---

export interface Glazing {
  id: string;
  name: string;
  ug: number;
  psi: number;        // Тепловой мост кромки (W/mK)
  pricePerM2: number; // €/m2
}

export interface Profile {
  id: string;
  name: string;
  uf: number;
  faceWidth: number;  // Видимая ширина профиля (мм)
  pricePerM2: number; // €/m2 (материал рамы)
}

// --- 2. Результат расчета (то, что возвращает функция utils) ---

export interface CalculationStats {
  uw: number;           // W/m2K
  area: number;         // m2
  priceTotal: number;   // €
  heatLoss: number;     // kWh/год
  savingsEuro: number;  // €/год (экономия)
  isBafaEligible: boolean; // Подходит ли под субсидию
  subsidyAmount: number;   // Сумма субсидии (€)
  isValid: boolean;
  error?: string;
}

// --- 3. Структура проекта (то, что храним в JSON/LocalStorage) ---

export interface CalculatedWindow {
  id: string;
  // Геометрия
  width: number;
  height: number;
  
  // Материалы (snapshot имен, чтобы если удалим из БД, тут осталось)
  profileId: string;
  profileName: string;
  glazingId: string;
  glazingName: string;

  // Базовые расчеты
  uw: number;
  price: number; // Итоговая цена

  // === НОВЫЕ ПОЛЯ (для аналитики и BAFA) ===
  isBafa: boolean;      // Проходит ли по нормам BAFA (Uw <= 0.95)
  subsidy: number;      // Размер возможной субсидии
  savings: number;      // Экономия денег в год
  heatLoss: number;     // Теплопотери кВт*ч
}

export interface Room {
  id: string;
  name: string;
  area: number;   // м² (площадь пола)
  height: number; // м (высота потолка)
  windows: CalculatedWindow[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  rooms: Room[];
}