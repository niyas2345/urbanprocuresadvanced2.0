// Urban Procures Advanced
// Centralized Service Charge Engine
// Vendor obligations are SERVICE CHARGES. Contractor / Client Service Charge is AED 0.

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
  public static calculateAward(input: { awardValueAed: number; awardType: 'standard' | 'manpower'; manpowerPersons?: number; manpowerHoursPerPersonPerDay?: number; manpowerDays?: number }) {
    if (!Number.isFinite(input.awardValueAed) || input.awardValueAed <= 0 || input.awardValueAed > 1e12) throw new Error('INVALID_AWARD_VALUE');
    if (input.awardType === 'manpower') {
      const persons=input.manpowerPersons, hours=input.manpowerHoursPerPersonPerDay, days=input.manpowerDays;
      if (!Number.isSafeInteger(persons) || persons! <= 0 || !Number.isFinite(hours) || hours! <= 0 || hours! > 24 || !Number.isSafeInteger(days) || days! <= 0) throw new Error('INVALID_MANPOWER_PERSON_HOURS');
      const totalPersonHours=persons! * hours! * days!;
      if (!Number.isFinite(totalPersonHours) || totalPersonHours > 1e12) throw new Error('INVALID_MANPOWER_PERSON_HOURS');
      const manpowerChargeAed=Math.round(totalPersonHours * 100) / 100;
      return { contractorServiceChargeAed: 0, vendorServiceChargeAed: 0, manpowerChargeAed,
        totalVendorChargeAed: manpowerChargeAed, applicableChargeRule: 'MANPOWER_AED_1_PER_PERSON_HOUR', manpowerUnit: 'person-hour', manpowerQuantity: totalPersonHours,
        manpowerPersons: persons, manpowerHoursPerPersonPerDay: hours, manpowerDays: days, manpowerRateAed: 1 };
    }
    if (input.awardType !== 'standard') throw new Error('INVALID_AWARD_TYPE');
    const vendorServiceChargeAed=Math.max(Math.round(input.awardValueAed * 0.025 * 100) / 100,500);
    return { contractorServiceChargeAed: 0, vendorServiceChargeAed, manpowerChargeAed: 0,
      totalVendorChargeAed: vendorServiceChargeAed, applicableChargeRule: 'STANDARD_MAX_2_5_PERCENT_AED_500', manpowerUnit: null, manpowerQuantity: null,
      manpowerPersons: null, manpowerHoursPerPersonPerDay: null, manpowerDays: null, manpowerRateAed: null };
  }
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
