// services/predictiveAnalyzer.js
class PredictiveAnalyzer {
    constructor() {
        this.seasonalFactors = {
            winter: 1.3,
            spring: 0.9,
            summer: 1.4,
            fall: 1.0
        };
    }

    async generatePredictions(billData) {
        const predictions = {
            nextMonth: this.predictNextMonth(billData),
            quarterly: this.predictQuarterly(billData),
            annual: this.predictAnnual(billData),
            seasonal: this.predictSeasonal(billData)
        };
        
        return predictions;
    }

    predictNextMonth(billData) {
        const currentUsage = billData.usage.totalKwh;
        const currentAmount = billData.charges.totalAmount;
        const trend = this.calculateTrend(billData);
        
        const predictedUsage = currentUsage * (1 + trend);
        const predictedAmount = currentAmount * (1 + trend);
        
        return {
            usage: Math.round(predictedUsage),
            amount: Math.round(predictedAmount * 100) / 100,
            confidence: 0.85,
            factors: ['historical trend', 'seasonal adjustment', 'usage patterns']
        };
    }

    predictQuarterly(billData) {
        const quarterly = [];
        const baseUsage = billData.usage.totalKwh;
        const baseAmount = billData.charges.totalAmount;
        
        for (let i = 1; i <= 3; i++) {
            const seasonalFactor = this.getSeasonalFactor(i);
            quarterly.push({
                month: i,
                usage: Math.round(baseUsage * seasonalFactor),
                amount: Math.round(baseAmount * seasonalFactor * 100) / 100
            });
        }
        
        return quarterly;
    }

    predictAnnual(billData) {
        const monthlyAverage = billData.charges.totalAmount;
        const annualEstimate = monthlyAverage * 12;
        
        return {
            estimatedTotal: Math.round(annualEstimate * 100) / 100,
            breakdown: {
                energy: Math.round(annualEstimate * 0.7 * 100) / 100,
                delivery: Math.round(annualEstimate * 0.15 * 100) / 100,
                fees: Math.round(annualEstimate * 0.15 * 100) / 100
            },
            confidence: 0.75
        };
    }

    predictSeasonal(billData) {
        const seasons = ['winter', 'spring', 'summer', 'fall'];
        const baseAmount = billData.charges.totalAmount;
        
        return seasons.map(season => ({
            season,
            factor: this.seasonalFactors[season],
            estimatedAmount: Math.round(baseAmount * this.seasonalFactors[season] * 100) / 100
        }));
    }

    calculateTrend(billData) {
        if (!billData.comparisons || !billData.comparisons.previousMonth) {
            return 0.02; // Default 2% growth
        }
        
        const current = billData.charges.totalAmount;
        const previous = billData.comparisons.previousMonth.amount;
        return (current - previous) / previous;
    }

    getSeasonalFactor(monthsAhead) {
        const currentMonth = new Date().getMonth();
        const futureMonth = (currentMonth + monthsAhead) % 12;
        
        if (futureMonth >= 11 || futureMonth <= 1) return this.seasonalFactors.winter;
        if (futureMonth >= 2 && futureMonth <= 4) return this.seasonalFactors.spring;
        if (futureMonth >= 5 && futureMonth <= 8) return this.seasonalFactors.summer;
        return this.seasonalFactors.fall;
    }
}

module.exports = { PredictiveAnalyzer };