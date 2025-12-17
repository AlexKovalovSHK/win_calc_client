// utils.ts

import { Glazing, Profile } from "../features/types";

export interface DetailedStats {
  uw: number;           // W/m2K
  area: number;         // m2
  priceTotal: number;   // € (Material + Montage)
  heatLoss: number;     // kWh/Jahr (потери через это окно)
  savingsEuro: number;  // €/Jahr (экономия по сравнению со старым окном)
  isBafaEligible: boolean; // Подходит ли под субсидию
  subsidyAmount: number;   // Возможный возврат денег
  isValid: boolean;
  error?: string;
}

// Константы для Германии
const ENERGY_COST_PER_KWH = 0.15; // € (Газ/Мазут среднее)
const HEATING_DEGREE_HOURS = 84;  // kKh/a (Kilo-Kelvin hours per year) ~ Для Германии среднее значение (около 84000 Kh)
// Или формула: 24h * HeatingDays * DeltaT. 
// Упрощенно для расчета Q = Uw * A * F_Gt. Для Германии F_Gt ≈ 60-80 kKh в зависимости от региона.
// Возьмем консервативно:
const HEATING_HOURS_FACTOR = 75; // kKh/a (тысяч градусо-часов)

const UW_OLD_WINDOW = 2.8; // Старое окно 80-90х годов
const BAFA_LIMIT_UW = 0.95; // Требование BEG EM 2024
const BAFA_PERCENTAGE = 0.15; // 15% базовая ставка
const INSTALLATION_PRICE_M2 = 80; // € за монтаж м2

export const calculateFullStats = (
  widthMm: number,
  heightMm: number,
  profile: Profile,
  glazing: Glazing
): DetailedStats => {

  // 1. Валидация размеров
  if (widthMm < 400 || heightMm < 400) {
    return createErrorStats("Слишком маленький размер");
  }

  // 2. Геометрия (в метрах)
  const w = widthMm / 1000;
  const h = heightMm / 1000;
  const areaW = w * h; // A_w (площадь окна)

  const fW = profile.faceWidth / 1000; // видимая ширина профиля в метрах
  
  // Размеры стекла
  const gW = w - 2 * fW;
  const gH = h - 2 * fW;

  if (gW <= 0 || gH <= 0) {
    return createErrorStats("Профиль шире, чем окно");
  }

  const areaG = gW * gH; // A_g (площадь стекла)
  const areaF = areaW - areaG; // A_f (площадь рамы)
  const lg = 2 * (gW + gH); // L_g (периметр стеклопакета - мостик холода)

  // 3. Расчет Uw
  // Uw = (Ag*Ug + Af*Uf + Lg*Psi) / Aw
  const termGlass = areaG * glazing.ug;
  const termFrame = areaF * profile.uf;
  const termPsi = lg * glazing.psi;

  const uwRaw = (termGlass + termFrame + termPsi) / areaW;
  const uw = Math.round(uwRaw * 100) / 100; // Округляем до 2 знаков

  // 4. Расчет Цены
  const matPrice = (areaF * profile.pricePerM2) + (areaG * glazing.pricePerM2);
  // Добавим фурнитуру как фиксированную стоимость на створку (упрощенно)
  const hardwarePrice = 40; 
  const installPrice = areaW * INSTALLATION_PRICE_M2;
  
  const priceTotal = Math.round(matPrice + hardwarePrice + installPrice);

  // 5. Теплопотери и Экономия (Q = U * A * Gt)
  // Gt (Gradtagzahl) * 24h = kKh/a. 
  // Q [kWh] = U [W/m2K] * A [m2] * Factor [kKh]
  
  const heatLossCurrent = uw * areaW * HEATING_HOURS_FACTOR; 
  const heatLossOld = UW_OLD_WINDOW * areaW * HEATING_HOURS_FACTOR;
  
  const energySavedKwh = heatLossOld - heatLossCurrent;
  const savingsEuro = Math.round(energySavedKwh * ENERGY_COST_PER_KWH);

  // 6. Субсидии (BAFA)
  const isBafaEligible = uw <= BAFA_LIMIT_UW;
  const subsidyAmount = isBafaEligible ? Math.round(priceTotal * BAFA_PERCENTAGE) : 0;

  return {
    uw,
    area: Math.round(areaW * 100) / 100,
    priceTotal,
    heatLoss: Math.round(heatLossCurrent),
    savingsEuro,
    isBafaEligible,
    subsidyAmount,
    isValid: true
  };
};

function createErrorStats(msg: string): DetailedStats {
  return {
    uw: 0, area: 0, priceTotal: 0, heatLoss: 0, savingsEuro: 0,
    isBafaEligible: false, subsidyAmount: 0, isValid: false, error: msg
  };
}