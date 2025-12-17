import { Glazing } from "../features/types"

export const GLAZING_LIST: Glazing[] = [
  {
    id: "single-chamber",
    name: "Однокамерный 4-16-4",
    ug: 1.1,
    psi: 0.05,
    pricePerM2: 50,
  },
  {
    id: "double-chamber",
    name: "Двухкамерный 4-16-4-16-4",
    ug: 0.8,
    psi: 0.04,
    pricePerM2: 75,
  },
  {
    id: "triple-chamber",
    name: "Трехкамерный 4-18-4-18-4",
    ug: 0.65,
    psi: 0.04,
    pricePerM2: 90,
  },
  {
    id: "triple-chamber-low-e",
    name: "Трехкамерный (Ar+LowE)",
    ug: 0.5,
    psi: 0.04,
    pricePerM2: 110,
  },
  {
    id: "triple-chamber-xenon",
    name: "Трехкамерный (Xe)",
    ug: 0.4,
    psi: 0.04,
    pricePerM2: 130,
  },
]
