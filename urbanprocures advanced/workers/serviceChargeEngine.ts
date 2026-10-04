// Urban Procures Advanced
// Centralized Service Charge Engine
// NOTE: Always refer to this as a "SERVICE CHARGE", never as a "commission".

export interface ServiceChargeCalculationInput {
  contractAmountAed: number;
  isManpowerCategory?: boolean;
  siteVisitRequested?: boolean;
  customRuleOverride?: {
    percentage?: number;
    minimumChargeAed?: number;
  };
}

export interface ServiceChargeBreakdown {
  contractAmountAed: number;
  appliedPercentage: number;
  rawPercentageChargeAed: number;
  minimumChargeEnforced: boolean;
  minimumChargeAed: number;
  baseServiceChargeAed: number;
  siteVisitFeeAed: number;
  totalServiceChargeAed: number;
  explanation: string;
}

export class ServiceChargeEngine {
  // Authoritative default business parameters
  public static readonly DEFAULT_PERCENTAGE = 0.025; // 2.5%
  public static readonly DEFAULT_MINIMUM_AED = 500.0; // AED 500 Minimum
  public static readonly DEFAULT_SITE_VISIT_FEE_AED = 100.0; // AED 100 Site Visit

  /**
   * Calculates the exact, auditable service charge for a given contract award
   */
  public static calculate(input: ServiceChargeCalculationInput): ServiceChargeBreakdown {
    const amount = Math.max(0, input.contractAmountAed);
    const percentage = input.customRuleOverride?.percentage ?? this.DEFAULT_PERCENTAGE;
    const minimumAed = input.customRuleOverride?.minimumChargeAed ?? this.DEFAULT_MINIMUM_AED;

    // 1. Calculate raw percentage
    const rawPercentageCharge = Math.round(amount * percentage * 100) / 100;

    // 2. Evaluate minimum charge rule
    let baseCharge = rawPercentageCharge;
    let minimumEnforced = false;

    // If contract amount > 0 and raw percentage is below minimum threshold
    if (amount > 0 && rawPercentageCharge < minimumAed) {
      baseCharge = minimumAed;
      minimumEnforced = true;
    }

    // 3. Optional site visit fee
    const siteVisitFee = input.siteVisitRequested ? this.DEFAULT_SITE_VISIT_FEE_AED : 0;
    const totalCharge = Math.round((baseCharge + siteVisitFee) * 100) / 100;

    // 4. Generate structured explanation for transparency
    let explanation = `Service charge calculated at ${(percentage * 100).toFixed(1)}% of AED ${amount.toLocaleString()}`;
    if (minimumEnforced) {
      explanation += ` (Minimum threshold of AED ${minimumAed} applied)`;
    }
    if (siteVisitFee > 0) {
      explanation += ` + AED ${siteVisitFee} site visit fee`;
    }

    return {
      contractAmountAed: amount,
      appliedPercentage: percentage,
      rawPercentageChargeAed: rawPercentageCharge,
      minimumChargeEnforced: minimumEnforced,
      minimumChargeAed: minimumAed,
      baseServiceChargeAed: baseCharge,
      siteVisitFeeAed: siteVisitFee,
      totalServiceChargeAed: totalCharge,
      explanation,
    };
  }
}
