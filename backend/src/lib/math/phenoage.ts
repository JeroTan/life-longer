export interface Biomarkers {
  albumin: number; // g/L
  creatinine: number; // umol/L
  glucose: number; // mmol/L
  crp: number; // mg/L -> actually Ln(mg/dL) is needed for calculation! Wait, the spreadsheet does conversion.
  lymphocyte_percent: number; // %
  mcv: number; // fL
  rdw: number; // %
  alkaline_phosphatase: number; // U/L
  wbc: number; // 10^3 cells/uL
  age: number; // years
}

export function calculatePhenoAge(data: Biomarkers) {
  // Conversions based on John G. Cramer's spreadsheet:
  // albumin (input g/L) => used as is (in g/L, wait, spreadsheet input is mg/dL, mult by 10 to get g/L)
  // creatinine (input mg/dL) => mult by 88.4 to get umol/L
  // glucose (input mg/dL) => mult by 0.0555 to get mmol/L
  // crp (input mg/L) => mult by 0.1, then take Ln() to get Ln(mg/dL)
  // others are used as is.
  
  // We will assume the input to this API is already in standard medical units:
  // Albumin (g/L), Creatinine (umol/L), Glucose (mmol/L), CRP (mg/L), 
  // Lymphocyte (%), MCV (fL), RDW (%), AlkPhos (U/L), WBC (10^3/uL), Age (years)

  // Calculate the converted inputs based on standard units:
  // The weight constants from the spreadsheet are tuned for these cInput units:
  // cUnits: g/L, umol/L, mmol/L, Ln(mg/dL), %, fL, %, U/L, 10^3 cells/mL, years
  
  const cAlbumin = data.albumin; 
  const cCreatinine = data.creatinine; 
  const cGlucose = data.glucose; 
  
  // CRP input is mg/L. To get Ln(mg/dL): mg/dL = mg/L * 0.1
  const cCrp = Math.log(data.crp * 0.1);
  
  const cLymphocyte = data.lymphocyte_percent;
  const cMcv = data.mcv;
  const cRdw = data.rdw;
  const cAlkPhos = data.alkaline_phosphatase;
  const cWbc = data.wbc;
  const cAge = data.age;

  // Weights
  const wAlbumin = -0.0336;
  const wCreatinine = 0.0095;
  const wGlucose = 0.1953;
  const wCrp = 0.0954;
  const wLymphocyte = -0.012;
  const wMcv = 0.0268;
  const wRdw = 0.3306;
  const wAlkPhos = 0.0019;
  const wWbc = 0.0554;
  const wAge = 0.0804;
  const b0 = -19.9067;

  const linComb = 
    cAlbumin * wAlbumin +
    cCreatinine * wCreatinine +
    cGlucose * wGlucose +
    cCrp * wCrp +
    cLymphocyte * wLymphocyte +
    cMcv * wMcv +
    cRdw * wRdw +
    cAlkPhos * wAlkPhos +
    cWbc * wWbc +
    cAge * wAge +
    b0;

  const t = 120; // 120 months
  const g = 0.0076927;

  // MortScore formula: 1 - EXP(-EXP(LinComb) * (EXP(g * t) - 1) / g)
  const mortScore = 1 - Math.exp(-Math.exp(linComb) * (Math.exp(g * t) - 1) / g);

  // PhenoAge formula: 141.50225 + LN(-0.00553 * LN(1 - MortScore)) / 0.09165
  const phenoAge = 141.50225 + Math.log(-0.00553 * Math.log(1 - mortScore)) / 0.09165;

  return {
    phenotypicAge: parseFloat(phenoAge.toFixed(2)),
    mortalityScore: parseFloat(mortScore.toFixed(4)),
    linearCombination: parseFloat(linComb.toFixed(4))
  };
}