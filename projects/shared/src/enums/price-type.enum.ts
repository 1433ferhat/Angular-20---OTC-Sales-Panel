export enum PriceType {
  Undefined = 0,
  ZON = 1,
  LZON = 2,
  E1 = 3,
  NV = 4,
  FB = 5,
  TY = 6,
  HB = 7,
  N11 = 8,
  PTT = 9,
  AMZ = 10,
  PZR = 11,
  IDE = 12,
  ETIC = 13,
  ECZ = 14,
  T1 = 15,
  T2 = 16,
  T3 = 17,
  T4 = 18,
  T5 = 19
}

// PriceType utility functions
export const PriceTypeLabels: Record<PriceType, string> = {
  [PriceType.Undefined]: 'Tanımsız',
  [PriceType.ZON]: 'Zon Fiyatı',
  [PriceType.LZON]: 'L-Zon Fiyatı',
  [PriceType.E1]: 'E1 Fiyatı',
  [PriceType.NV]: 'NV Fiyatı',
  [PriceType.FB]: 'FB Fiyatı',
  [PriceType.TY]: 'TY Fiyatı',
  [PriceType.HB]: 'HB Fiyatı',
  [PriceType.N11]: 'N11 Fiyatı',
  [PriceType.PTT]: 'PTT Fiyatı',
  [PriceType.AMZ]: 'AMZ Fiyatı',
  [PriceType.PZR]: 'PZR Fiyatı',
  [PriceType.IDE]: 'IDE Fiyatı',
  [PriceType.ETIC]: 'ETIC Fiyatı',
  [PriceType.ECZ]: 'Eczane Fiyatı',
  [PriceType.T1]: 'T1 Fiyatı',
  [PriceType.T2]: 'T2 Fiyatı',
  [PriceType.T3]: 'T3 Fiyatı',
  [PriceType.T4]: 'T4 Fiyatı',
  [PriceType.T5]: 'T5 Fiyatı',
};

export function getPriceTypeLabel(priceType: PriceType): string {
  return PriceTypeLabels[priceType] || 'Bilinmeyen';
}

export function getPriceTypeOptions() {
  return Object.entries(PriceTypeLabels)
    .filter(([key]) => Number(key) !== PriceType.Undefined)
    .map(([value, label]) => ({
      value: Number(value) as PriceType,
      label
    }));
}
