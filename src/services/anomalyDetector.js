// services/anomalyDetector.js
class AnomalyDetector {
    constructor() {
        this.thresholds = {
            usage: { mild: 15, moderate: 25, severe: 40 },
            cost: { mild: 20, moderate: 35, severe: 50 },
            efficiency: { mild: 10, moderate: 20, severe: 30 }
        };
    }

    async detectAnomalies(billData) {
        const anomalies = [];
        
        // Usage anomalies
        if (billData.usage && billData.comparisons) {
            const usageAnomalies = this.detectUsageAnomalies(billData);
            anomalies.push(...usageAnomalies);
        }
        
        // Cost anomalies
        if (billData.charges && billData.comparisons) {
            const costAnomalies = this.detectCostAnomalies(billData);
            anomalies.push(...costAnomalies);
        }
        
        // Pattern anomalies
        const patternAnomalies = this.detectPatternAnomalies(billData);
        anomalies.push(...patternAnomalies);
        
        return this.prioritizeAnomalies(anomalies);
    }

    detectUsageAnomalies(billData) {
        const anomalies = [];
        const current = billData.usage.totalKwh;
        const previous = billData.comparisons.previousMonth?.usage || current;
        const change = ((current - previous) / previous) * 100;
        
        if (Math.abs(change) > this.thresholds.usage.mild) {
            anomalies.push({
                type: 'usage_anomaly',
                severity: this.getSeverity(Math.abs(change), this.thresholds.usage),
                title: `${change > 0 ? 'Increased' : 'Decreased'} Usage Pattern`,
                description: `Energy usage ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}%`,
                impact: Math.abs(change),
                recommendations: this.getUsageRecommendations(change)
            });
        }
        
        return anomalies;
    }

    detectCostAnomalies(billData) {
        const anomalies = [];
        const current = billData.charges.totalAmount;
        const previous = billData.comparisons.previousMonth?.amount || current;
        const change = ((current - previous) / previous) * 100;
        
        if (Math.abs(change) > this.thresholds.cost.mild) {
            anomalies.push({
                type: 'cost_anomaly',
                severity: this.getSeverity(Math.abs(change), this.thresholds.cost),
                title: `${change > 0 ? 'Higher' : 'Lower'} Bill Amount`,
                description: `Total bill ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}%`,
                impact: Math.abs(change),
                recommendations: this.getCostRecommendations(change)
            });
        }
        
        return anomalies;
    }

    detectPatternAnomalies(billData) {
        const anomalies = [];
        
        // Peak usage analysis
        if (billData.usage.peakKwh && billData.usage.totalKwh) {
            const peakRatio = (billData.usage.peakKwh / billData.usage.totalKwh) * 100;
            if (peakRatio > 40) {
                anomalies.push({
                    type: 'peak_usage_anomaly',
                    severity: peakRatio > 50 ? 'severe' : 'moderate',
                    title: 'High Peak Usage Pattern',
                    description: `Peak usage represents ${peakRatio.toFixed(1)}% of total consumption`,
                    impact: peakRatio,
                    recommendations: this.getPeakRecommendations()
                });
            }
        }
        
        return anomalies;
    }

    getSeverity(value, thresholds) {
        if (value >= thresholds.severe) return 'severe';
        if (value >= thresholds.moderate) return 'moderate';
        return 'mild';
    }

    getUsageRecommendations(change) {
        if (change > 0) {
            return [
                'Check for malfunctioning appliances',
                'Review HVAC system efficiency',
                'Monitor daily usage patterns',
                'Consider energy audit'
            ];
        } else {
            return [
                'Great job on reducing consumption!',
                'Continue current practices',
                'Monitor for any service issues'
            ];
        }
    }

    getCostRecommendations(change) {
        if (change > 0) {
            return [
                'Review rate changes',
                'Analyze usage patterns',
                'Check for billing errors',
                'Consider dispute if necessary'
            ];
        } else {
            return [
                'Excellent cost management!',
                'Review what caused the decrease',
                'Apply successful strategies consistently'
            ];
        }
    }

    getPeakRecommendations() {
        return [
            'Shift appliance usage to off-peak hours',
            'Use programmable timers',
            'Consider time-of-use rate plans',
            'Optimize heating/cooling schedules'
        ];
    }

    prioritizeAnomalies(anomalies) {
        const severityOrder = { severe: 3, moderate: 2, mild: 1 };
        return anomalies.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    }
}

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

// services/recommendationEngine.js
class RecommendationEngine {
    constructor() {
        this.categories = {
            immediate: { maxDays: 7, priority: 'high' },
            shortTerm: { maxDays: 30, priority: 'medium' },
            longTerm: { maxDays: 365, priority: 'low' }
        };
    }

    async generateRecommendations(billData, anomalies, predictions) {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: []
        };
        
        // Anomaly-based recommendations
        if (anomalies && anomalies.length > 0) {
            recommendations.immediate.push(...this.generateAnomalyRecommendations(anomalies));
        }
        
        // Usage-based recommendations
        if (billData.usage) {
            recommendations.shortTerm.push(...this.generateUsageRecommendations(billData));
        }
        
        // Cost optimization recommendations
        if (billData.charges) {
            recommendations.longTerm.push(...this.generateCostOptimizationRecommendations(billData));
        }
        
        // Predictive recommendations
        if (predictions) {
            recommendations.shortTerm.push(...this.generatePredictiveRecommendations(predictions));
        }
        
        return this.prioritizeRecommendations(recommendations);
    }

    generateAnomalyRecommendations(anomalies) {
        return anomalies.map(anomaly => ({
            title: `Address ${anomaly.title}`,
            description: `Immediate attention needed: ${anomaly.description}`,
            category: 'anomaly_response',
            priority: anomaly.severity,
            savings: this.calculateSavings(anomaly),
            actions: anomaly.recommendations || [],
            timeline: '1-7 days'
        }));
    }

    generateUsageRecommendations(billData) {
        const recommendations = [];
        
        if (billData.usage.totalKwh > 1000) {
            recommendations.push({
                title: 'Energy Efficiency Audit',
                description: 'Schedule professional energy audit to identify inefficiencies',
                category: 'efficiency',
                priority: 'high',
                savings: billData.charges.totalAmount * 0.2,
                actions: ['Schedule audit', 'Identify problem areas', 'Implement fixes'],
                timeline: '2-4 weeks'
            });
        }
        
        return recommendations;
    }

    generateCostOptimizationRecommendations(billData) {
        const recommendations = [];
        
        recommendations.push({
            title: 'Rate Plan Analysis',
            description: 'Analyze current rate plan and compare with alternatives',
            category: 'rate_optimization',
            priority: 'medium',
            savings: billData.charges.totalAmount * 0.1,
            actions: ['Review rate options', 'Compare costs', 'Switch if beneficial'],
            timeline: '1-2 months'
        });
        
        return recommendations;
    }

    generatePredictiveRecommendations(predictions) {
        const recommendations = [];
        
        if (predictions.nextMonth.amount > predictions.nextMonth.amount * 1.1) {
            recommendations.push({
                title: 'Prepare for Higher Bills',
                description: 'Next month\'s bill is predicted to be higher than usual',
                category: 'budgeting',
                priority: 'medium',
                savings: 0,
                actions: ['Adjust budget', 'Reduce usage', 'Monitor daily consumption'],
                timeline: 'This month'
            });
        }
        
        return recommendations;
    }

    calculateSavings(anomaly) {
        const savingsMultiplier = {
            severe: 0.25,
            moderate: 0.15,
            mild: 0.05
        };
        
        return (anomaly.impact || 100) * (savingsMultiplier[anomaly.severity] || 0.1);
    }

    prioritizeRecommendations(recommendations) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        
        Object.keys(recommendations).forEach(category => {
            recommendations[category].sort((a, b) => 
                priorityOrder[b.priority] - priorityOrder[a.priority]
            );
        });
        
        return recommendations;
    }
}

// services/patternAnalyzer.js
class PatternAnalyzer {
    constructor() {
        this.patterns = {
            daily: new Map(),
            weekly: new Map(),
            monthly: new Map(),
            seasonal: new Map()
        };
    }

    async analyzePatterns(billData) {
        const patterns = {
            usage: this.analyzeUsagePatterns(billData),
            cost: this.analyzeCostPatterns(billData),
            efficiency: this.analyzeEfficiencyPatterns(billData),
            seasonal: this.analyzeSeasonalPatterns(billData)
        };
        
        return patterns;
    }

    analyzeUsagePatterns(billData) {
        const usage = billData.usage.totalKwh;
        const peakUsage = billData.usage.peakKwh || 0;
        const offPeakUsage = billData.usage.offPeakKwh || usage - peakUsage;
        
        return {
            totalUsage: usage,
            peakRatio: (peakUsage / usage) * 100,
            offPeakRatio: (offPeakUsage / usage) * 100,
            efficiency: this.calculateEfficiency(billData),
            trend: this.calculateUsageTrend(billData)
        };
    }

    analyzeCostPatterns(billData) {
        const charges = billData.charges;
        const total = charges.totalAmount;
        
        return {
            breakdown: {
                energy: (charges.energyCharges / total) * 100,
                delivery: (charges.deliveryCharges / total) * 100,
                fees: ((charges.taxes + charges.fees) / total) * 100
            },
            rateAnalysis: {
                averageRate: charges.energyCharges / billData.usage.totalKwh,
                peakRate: billData.rates?.peakRate || 0,
                offPeakRate: billData.rates?.offPeakRate || 0
            }
        };
    }

    analyzeEfficiencyPatterns(billData) {
        const efficiency = this.calculateEfficiency(billData);
        const comparison = billData.comparisons?.previousMonth;
        
        return {
            currentEfficiency: efficiency,
            trend: comparison ? (efficiency - this.calculateEfficiency(comparison)) : 0,
            benchmarks: this.getBenchmarks(billData),
            recommendations: this.getEfficiencyRecommendations(efficiency)
        };
    }

    analyzeSeasonalPatterns(billData) {
        const currentMonth = new Date().getMonth();
        const season = this.getSeason(currentMonth);
        
        return {
            currentSeason: season,
            seasonalFactor: this.getSeasonalFactor(season),
            expectedUsage: billData.usage.totalKwh / this.getSeasonalFactor(season),
            variance: this.calculateSeasonalVariance(billData)
        };
    }

    calculateEfficiency(billData) {
        if (typeof billData === 'object' && billData.usage) {
            return billData.charges.totalAmount / billData.usage.totalKwh;
        }
        return billData; // If already a number
    }

    calculateUsageTrend(billData) {
        if (!billData.comparisons || !billData.comparisons.previousMonth) {
            return 0;
        }
        
        const current = billData.usage.totalKwh;
        const previous = billData.comparisons.previousMonth.usage;
        return ((current - previous) / previous) * 100;
    }

    getSeason(month) {
        if (month >= 11 || month <= 1) return 'winter';
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 8) return 'summer';
        return 'fall';
    }

    getSeasonalFactor(season) {
        const factors = {
            winter: 1.3,
            spring: 0.9,
            summer: 1.4,
            fall: 1.0
        };
        return factors[season] || 1.0;
    }

    calculateSeasonalVariance(billData) {
        const expected = billData.usage.totalKwh / this.getSeasonalFactor(this.getSeason(new Date().getMonth()));
        const actual = billData.usage.totalKwh;
        return ((actual - expected) / expected) * 100;
    }

    getBenchmarks(billData) {
        return {
            national: 877, // kWh national average
            regional: 950, // kWh regional average
            similar: 820   // kWh similar homes
        };
    }

    getEfficiencyRecommendations(efficiency) {
        if (efficiency > 0.15) {
            return ['High cost per kWh - investigate rate plans', 'Check for billing errors'];
        } else if (efficiency > 0.12) {
            return ['Above average cost - consider efficiency improvements'];
        } else {
            return ['Good efficiency - maintain current practices'];
        }
    }
}

module.exports = {
    AnomalyDetector,
    PredictiveAnalyzer,
    RecommendationEngine,
    PatternAnalyzer
};