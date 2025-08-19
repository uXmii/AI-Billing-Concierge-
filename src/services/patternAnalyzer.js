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
            seasonal: this.analyzeSeasonalPatterns(billData),
            trends: this.analyzeTrends(billData),
            correlations: this.analyzeCorrelations(billData)
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
            dailyAverage: usage / 30,
            efficiency: this.calculateEfficiency(billData),
            trend: this.calculateUsageTrend(billData),
            classification: this.classifyUsagePattern(usage),
            recommendations: this.getUsagePatternRecommendations(usage, peakUsage / usage)
        };
    }

    analyzeCostPatterns(billData) {
        const charges = billData.charges;
        const total = charges.totalAmount;
        
        return {
            totalCost: total,
            breakdown: {
                energy: (charges.energyCharges / total) * 100,
                delivery: (charges.deliveryCharges / total) * 100,
                base: (charges.baseCharge / total) * 100,
                fees: ((charges.taxes + charges.fees) / total) * 100
            },
            rateAnalysis: {
                averageRate: charges.energyCharges / billData.usage.totalKwh,
                peakRate: billData.rates?.peakRate || 0,
                offPeakRate: billData.rates?.offPeakRate || 0,
                effectiveRate: total / billData.usage.totalKwh
            },
            costEfficiency: this.calculateCostEfficiency(billData),
            trend: this.calculateCostTrend(billData)
        };
    }

    analyzeEfficiencyPatterns(billData) {
        const efficiency = this.calculateEfficiency(billData);
        const comparison = billData.comparisons?.previousMonth;
        
        return {
            currentEfficiency: efficiency,
            trend: comparison ? (efficiency - this.calculateEfficiency(comparison)) : 0,
            benchmarks: this.getBenchmarks(billData),
            recommendations: this.getEfficiencyRecommendations(efficiency),
            score: this.calculateEfficiencyScore(billData),
            factors: this.identifyEfficiencyFactors(billData)
        };
    }

    analyzeSeasonalPatterns(billData) {
        const currentMonth = new Date().getMonth();
        const season = this.getSeason(currentMonth);
        const expectedUsage = this.getExpectedSeasonalUsage(billData, season);
        
        return {
            currentSeason: season,
            seasonalFactor: this.getSeasonalFactor(season),
            expectedUsage: expectedUsage,
            actualUsage: billData.usage.totalKwh,
            variance: this.calculateSeasonalVariance(billData.usage.totalKwh, expectedUsage),
            weatherImpact: this.assessWeatherImpact(billData),
            historicalComparison: this.compareWithHistoricalSeasonal(billData)
        };
    }

    analyzeTrends(billData) {
        const trends = {
            usage: this.calculateUsageTrend(billData),
            cost: this.calculateCostTrend(billData),
            efficiency: this.calculateEfficiencyTrend(billData),
            direction: 'stable',
            strength: 'weak',
            projection: this.projectTrend(billData)
        };

        // Determine overall trend direction
        const avgTrend = (trends.usage + trends.cost + trends.efficiency) / 3;
        if (avgTrend > 5) trends.direction = 'increasing';
        else if (avgTrend < -5) trends.direction = 'decreasing';
        
        // Determine trend strength
        if (Math.abs(avgTrend) > 15) trends.strength = 'strong';
        else if (Math.abs(avgTrend) > 8) trends.strength = 'moderate';

        return trends;
    }

    analyzeCorrelations(billData) {
        const correlations = {
            usageVsCost: this.calculateCorrelation(billData.usage.totalKwh, billData.charges.totalAmount),
            peakVsTotal: this.calculateCorrelation(billData.usage.peakKwh, billData.charges.totalAmount),
            weatherVsUsage: this.calculateWeatherCorrelation(billData),
            timeVsUsage: this.calculateTimeCorrelation(billData),
            insights: []
        };

        // Generate insights based on correlations
        if (correlations.usageVsCost > 0.8) {
            correlations.insights.push('Strong correlation between usage and cost - rate structure is consistent');
        }
        if (correlations.peakVsTotal > 0.7) {
            correlations.insights.push('Peak usage significantly impacts total cost - time-shifting opportunities exist');
        }

        return correlations;
    }

    // Comprehensive pattern analysis
    async analyzeComprehensivePatterns(options) {
        const { data, timeRange = 'all', analysisType = 'comprehensive' } = options;
        
        const analysis = {
            identifiedPatterns: [],
            insights: [],
            correlations: {},
            seasonality: {},
            trends: {},
            outliers: [],
            confidence: 0.85
        };

        // Identify patterns
        analysis.identifiedPatterns = this.identifyPatterns(data, timeRange);
        
        // Generate insights
        analysis.insights = this.generatePatternInsights(analysis.identifiedPatterns);
        
        // Analyze correlations
        analysis.correlations = this.analyzeCorrelations(data);
        
        // Seasonal analysis
        analysis.seasonality = this.analyzeSeasonality(data, timeRange);
        
        // Trend analysis
        analysis.trends = this.analyzeTrendPatterns(data, timeRange);
        
        // Outlier detection
        analysis.outliers = this.detectOutliers(data);
        
        return analysis;
    }

    // Comparative analysis
    async generateComparativeAnalysis(options) {
        const { userBillData, region = 'national', homeType = 'average', occupancy = 'average' } = options;
        
        const comparison = {
            metrics: {},
            ranking: {},
            insights: [],
            opportunities: [],
            benchmarks: {}
        };

        // Get benchmarks
        const benchmarks = this.getBenchmarksForComparison(region, homeType, occupancy);
        
        // Calculate metrics
        comparison.metrics = this.calculateComparisonMetrics(userBillData, benchmarks);
        
        // Determine ranking
        comparison.ranking = this.calculateRanking(comparison.metrics, benchmarks);
        
        // Generate insights
        comparison.insights = this.generateComparisonInsights(comparison.metrics, comparison.ranking);
        
        // Identify opportunities
        comparison.opportunities = this.identifyImprovementOpportunities(comparison.metrics, benchmarks);
        
        comparison.benchmarks = benchmarks;
        
        return comparison;
    }

    // Helper methods
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

    calculateCostTrend(billData) {
        if (!billData.comparisons || !billData.comparisons.previousMonth) {
            return 0;
        }
        
        const current = billData.charges.totalAmount;
        const previous = billData.comparisons.previousMonth.amount;
        return ((current - previous) / previous) * 100;
    }

    calculateEfficiencyTrend(billData) {
        if (!billData.comparisons || !billData.comparisons.previousMonth) {
            return 0;
        }
        
        const currentEff = this.calculateEfficiency(billData);
        const previousEff = this.calculateEfficiency(billData.comparisons.previousMonth);
        return ((currentEff - previousEff) / previousEff) * 100;
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

    calculateSeasonalVariance(actual, expected) {
        return ((actual - expected) / expected) * 100;
    }

    getBenchmarks(billData) {
        return {
            national: { usage: 877, cost: 0.13 },
            regional: { usage: 950, cost: 0.12 },
            similar: { usage: 820, cost: 0.11 }
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

    classifyUsagePattern(usage) {
        if (usage < 600) return 'low';
        if (usage < 1000) return 'average';
        if (usage < 1500) return 'high';
        return 'very_high';
    }

    getUsagePatternRecommendations(usage, peakRatio) {
        const recommendations = [];
        
        if (usage > 1200) {
            recommendations.push('Consider energy audit for high usage');
        }
        if (peakRatio > 0.4) {
            recommendations.push('Shift usage to off-peak hours');
        }
        
        return recommendations;
    }

    calculateCostEfficiency(billData) {
        const totalCost = billData.charges.totalAmount;
        const totalUsage = billData.usage.totalKwh;
        return totalCost / totalUsage;
    }

    calculateEfficiencyScore(billData) {
        const efficiency = this.calculateEfficiency(billData);
        const benchmarks = this.getBenchmarks(billData);
        const score = Math.max(0, Math.min(100, (benchmarks.national.cost - efficiency) / benchmarks.national.cost * 100));
        return Math.round(score);
    }

    identifyEfficiencyFactors(billData) {
        const factors = [];
        
        const peakRatio = billData.usage.peakKwh / billData.usage.totalKwh;
        if (peakRatio > 0.4) factors.push('high_peak_usage');
        
        const rate = billData.charges.energyCharges / billData.usage.totalKwh;
        if (rate > 0.13) factors.push('high_rate_plan');
        
        const baseRatio = billData.charges.baseCharge / billData.charges.totalAmount;
        if (baseRatio > 0.3) factors.push('high_fixed_costs');
        
        return factors;
    }

    getExpectedSeasonalUsage(billData, season) {
        const baseUsage = billData.usage.totalKwh;
        const factor = this.getSeasonalFactor(season);
        return baseUsage / factor;
    }

    assessWeatherImpact(billData) {
        // Mock weather impact assessment
        const season = this.getSeason(new Date().getMonth());
        const impact = {
            temperature: season === 'summer' || season === 'winter' ? 'high' : 'low',
            humidity: season === 'summer' ? 'high' : 'low',
            overall: 'moderate'
        };
        return impact;
    }

    compareWithHistoricalSeasonal(billData) {
        // Mock historical comparison
        return {
            vs_last_year: 5.2,
            vs_average: -2.1,
            trend: 'improving'
        };
    }

    calculateCorrelation(x, y) {
        // Simple correlation calculation (mock)
        return Math.random() * 0.6 + 0.4; // Return value between 0.4 and 1.0
    }

    calculateWeatherCorrelation(billData) {
        // Mock weather correlation
        const season = this.getSeason(new Date().getMonth());
        return season === 'summer' || season === 'winter' ? 0.8 : 0.4;
    }

    calculateTimeCorrelation(billData) {
        // Mock time correlation
        return billData.usage.peakKwh / billData.usage.totalKwh;
    }

    identifyPatterns(data, timeRange) {
        // Mock pattern identification
        return [
            { type: 'seasonal', strength: 'strong', description: 'Clear seasonal usage pattern' },
            { type: 'weekly', strength: 'moderate', description: 'Consistent weekly usage cycle' },
            { type: 'peak_usage', strength: 'high', description: 'High peak hour consumption' }
        ];
    }

    generatePatternInsights(patterns) {
        return patterns.map(pattern => ({
            pattern: pattern.type,
            insight: `${pattern.description} with ${pattern.strength} correlation`,
            recommendation: this.getPatternRecommendation(pattern.type)
        }));
    }

    getPatternRecommendation(patternType) {
        const recommendations = {
            seasonal: 'Plan for seasonal variations in budget and usage',
            weekly: 'Maintain consistent usage patterns for optimal efficiency',
            peak_usage: 'Shift usage to off-peak hours for cost savings'
        };
        return recommendations[patternType] || 'Monitor pattern for optimization opportunities';
    }

    analyzeSeasonality(data, timeRange) {
        return {
            strength: 'moderate',
            peak_season: 'summer',
            low_season: 'spring',
            variation: 35.2
        };
    }

    analyzeTrendPatterns(data, timeRange) {
        return {
            direction: 'increasing',
            rate: 2.3,
            confidence: 0.85
        };
    }

    detectOutliers(data) {
        // Mock outlier detection
        return [
            { date: '2024-01-15', value: 1250, type: 'usage_spike', severity: 'moderate' },
            { date: '2024-01-22', value: 180, type: 'cost_anomaly', severity: 'mild' }
        ];
    }

    getBenchmarksForComparison(region, homeType, occupancy) {
        return {
            usage: { national: 877, regional: 950, similar: 820 },
            cost: { national: 0.13, regional: 0.12, similar: 0.11 },
            efficiency: { national: 85, regional: 82, similar: 88 }
        };
    }

    calculateComparisonMetrics(userBillData, benchmarks) {
        const userUsage = userBillData.usage.totalKwh;
        const userCost = userBillData.charges.totalAmount;
        const userRate = userCost / userUsage;
        
        return {
            usage: {
                value: userUsage,
                vs_national: ((userUsage - benchmarks.usage.national) / benchmarks.usage.national) * 100,
                vs_regional: ((userUsage - benchmarks.usage.regional) / benchmarks.usage.regional) * 100,
                vs_similar: ((userUsage - benchmarks.usage.similar) / benchmarks.usage.similar) * 100
            },
            cost: {
                value: userCost,
                rate: userRate,
                vs_national: ((userRate - benchmarks.cost.national) / benchmarks.cost.national) * 100,
                vs_regional: ((userRate - benchmarks.cost.regional) / benchmarks.cost.regional) * 100,
                vs_similar: ((userRate - benchmarks.cost.similar) / benchmarks.cost.similar) * 100
            }
        };
    }

    calculateRanking(metrics, benchmarks) {
        const usagePercentile = this.calculatePercentile(metrics.usage.value, benchmarks.usage.national);
        const costPercentile = this.calculatePercentile(metrics.cost.rate, benchmarks.cost.national);
        
        return {
            usage: { percentile: usagePercentile, rank: this.getPercentileRank(usagePercentile) },
            cost: { percentile: costPercentile, rank: this.getPercentileRank(costPercentile) },
            overall: { percentile: (usagePercentile + costPercentile) / 2 }
        };
    }

    calculatePercentile(value, benchmark) {
        // Mock percentile calculation
        const ratio = value / benchmark;
        if (ratio < 0.8) return 25;
        if (ratio < 1.0) return 50;
        if (ratio < 1.3) return 75;
        return 90;
    }

    getPercentileRank(percentile) {
        if (percentile <= 25) return 'excellent';
        if (percentile <= 50) return 'good';
        if (percentile <= 75) return 'average';
        return 'needs_improvement';
    }

    generateComparisonInsights(metrics, ranking) {
        const insights = [];
        
        if (metrics.usage.vs_national > 20) {
            insights.push('Your usage is significantly higher than national average');
        }
        if (metrics.cost.vs_similar > 15) {
            insights.push('Your cost per kWh is higher than similar homes');
        }
        if (ranking.overall.percentile > 75) {
            insights.push('Overall energy efficiency needs improvement');
        }
        
        return insights;
    }

    identifyImprovementOpportunities(metrics, benchmarks) {
        const opportunities = [];
        
        if (metrics.usage.vs_national > 15) {
            opportunities.push({
                type: 'usage_reduction',
                potential: 'high',
                description: 'Reduce overall energy consumption',
                savings: metrics.usage.value * 0.15 * benchmarks.cost.national
            });
        }
        
        if (metrics.cost.vs_similar > 10) {
            opportunities.push({
                type: 'rate_optimization',
                potential: 'medium',
                description: 'Optimize rate plan or supplier',
                savings: metrics.cost.value * 0.1
            });
        }
        
        return opportunities;
    }

    projectTrend(billData) {
        const currentTrend = this.calculateUsageTrend(billData);
        const nextMonthUsage = billData.usage.totalKwh * (1 + currentTrend / 100);
        
        return {
            next_month: nextMonthUsage,
            three_months: nextMonthUsage * Math.pow(1 + currentTrend / 100, 3),
            confidence: 0.75
        };
    }
}

module.exports = { PatternAnalyzer };