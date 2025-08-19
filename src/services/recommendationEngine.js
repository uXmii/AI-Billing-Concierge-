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
            timeline: '1-7 days',
            impact: 'high'
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
                actions: [
                    'Schedule professional energy audit',
                    'Identify major inefficiencies',
                    'Implement recommended fixes',
                    'Monitor improvements'
                ],
                timeline: '2-4 weeks',
                impact: 'high'
            });
        }

        if (billData.usage.peakKwh && billData.usage.totalKwh) {
            const peakRatio = (billData.usage.peakKwh / billData.usage.totalKwh) * 100;
            if (peakRatio > 35) {
                recommendations.push({
                    title: 'Peak Usage Optimization',
                    description: 'Reduce peak-hour consumption to lower costs',
                    category: 'scheduling',
                    priority: 'medium',
                    savings: billData.charges.totalAmount * 0.15,
                    actions: [
                        'Shift appliance usage to off-peak hours',
                        'Install programmable timers',
                        'Use smart home automation',
                        'Monitor peak usage patterns'
                    ],
                    timeline: '1-2 weeks',
                    impact: 'medium'
                });
            }
        }

        // HVAC optimization
        recommendations.push({
            title: 'Smart Thermostat Installation',
            description: 'Install programmable thermostat for optimal temperature control',
            category: 'equipment',
            priority: 'medium',
            savings: billData.charges.totalAmount * 0.12,
            actions: [
                'Research smart thermostat options',
                'Professional installation',
                'Configure optimal schedules',
                'Monitor energy savings'
            ],
            timeline: '1-3 weeks',
            impact: 'medium'
        });

        return recommendations;
    }

    generateCostOptimizationRecommendations(billData) {
        const recommendations = [];
        
        // Rate plan analysis
        recommendations.push({
            title: 'Rate Plan Analysis',
            description: 'Analyze current rate plan and compare with alternatives',
            category: 'rate_optimization',
            priority: 'medium',
            savings: billData.charges.totalAmount * 0.1,
            actions: [
                'Review current rate plan details',
                'Compare with available alternatives',
                'Calculate potential savings',
                'Switch to optimal plan if beneficial'
            ],
            timeline: '1-2 months',
            impact: 'medium'
        });

        // Appliance efficiency
        recommendations.push({
            title: 'Appliance Efficiency Review',
            description: 'Evaluate and upgrade inefficient appliances',
            category: 'equipment',
            priority: 'low',
            savings: billData.charges.totalAmount * 0.08,
            actions: [
                'Audit current appliances',
                'Identify energy-hungry devices',
                'Research efficient replacements',
                'Plan staged upgrades'
            ],
            timeline: '3-12 months',
            impact: 'low'
        });

        // Insulation improvements
        recommendations.push({
            title: 'Home Insulation Assessment',
            description: 'Improve insulation to reduce heating/cooling costs',
            category: 'insulation',
            priority: 'low',
            savings: billData.charges.totalAmount * 0.15,
            actions: [
                'Professional insulation audit',
                'Identify improvement areas',
                'Get quotes for upgrades',
                'Implement improvements'
            ],
            timeline: '2-6 months',
            impact: 'high'
        });

        return recommendations;
    }

    generatePredictiveRecommendations(predictions) {
        const recommendations = [];
        
        if (predictions.nextMonth && predictions.nextMonth.amount > predictions.nextMonth.amount * 1.1) {
            recommendations.push({
                title: 'Prepare for Higher Bills',
                description: 'Next month\'s bill is predicted to be higher than usual',
                category: 'budgeting',
                priority: 'medium',
                savings: 0,
                actions: [
                    'Adjust monthly budget',
                    'Reduce discretionary usage',
                    'Monitor daily consumption',
                    'Implement immediate savings measures'
                ],
                timeline: 'This month',
                impact: 'medium'
            });
        }

        if (predictions.seasonal) {
            const highSeasons = predictions.seasonal.filter(s => s.factor > 1.2);
            if (highSeasons.length > 0) {
                recommendations.push({
                    title: 'Seasonal Usage Preparation',
                    description: `Prepare for higher usage during ${highSeasons.map(s => s.season).join(', ')}`,
                    category: 'seasonal_planning',
                    priority: 'low',
                    savings: predictions.nextMonth?.amount * 0.1 || 0,
                    actions: [
                        'Plan seasonal energy strategies',
                        'Schedule equipment maintenance',
                        'Adjust budget for high-usage seasons',
                        'Implement preventive measures'
                    ],
                    timeline: '1-3 months',
                    impact: 'medium'
                });
            }
        }

        return recommendations;
    }

    calculateSavings(anomaly) {
        const savingsMultiplier = {
            severe: 0.25,
            moderate: 0.15,
            mild: 0.05,
            high: 0.2,
            medium: 0.1,
            low: 0.05
        };
        
        const multiplier = savingsMultiplier[anomaly.severity] || savingsMultiplier[anomaly.priority] || 0.1;
        return (anomaly.impact || 100) * multiplier;
    }

    prioritizeRecommendations(recommendations) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        
        Object.keys(recommendations).forEach(category => {
            recommendations[category].sort((a, b) => {
                // First sort by priority
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                
                // Then by savings potential
                return (b.savings || 0) - (a.savings || 0);
            });
        });
        
        return recommendations;
    }

    // Generate optimization plan
    async generateOptimizationPlan(options) {
        const { billData, preferences = {}, constraints = {} } = options;
        
        const plan = {
            immediate: [],
            longTerm: [],
            savings: { total: 0, breakdown: {} },
            implementation: { phases: [], timeline: '' },
            prioritization: { high: [], medium: [], low: [] },
            risks: []
        };

        // Analyze current situation
        const currentCost = billData.charges?.totalAmount || 0;
        
        // Generate immediate actions
        plan.immediate = this.generateImmediateActions(billData, preferences);
        
        // Generate long-term strategy
        plan.longTerm = this.generateLongTermStrategy(billData, constraints);
        
        // Calculate savings
        plan.savings = this.calculateTotalSavings(plan.immediate, plan.longTerm, currentCost);
        
        // Create implementation plan
        plan.implementation = this.createImplementationPlan(plan.immediate, plan.longTerm);
        
        // Prioritize actions
        plan.prioritization = this.prioritizeActions([...plan.immediate, ...plan.longTerm]);
        
        // Assess risks
        plan.risks = this.assessImplementationRisks(plan);
        
        return plan;
    }

    generateImmediateActions(billData, preferences) {
        const actions = [];
        
        // No-cost actions
        actions.push({
            title: 'Adjust Thermostat Settings',
            description: 'Optimize heating/cooling schedules',
            cost: 0,
            savings: billData.charges?.totalAmount * 0.05 || 0,
            timeframe: '1 day'
        });

        actions.push({
            title: 'Unplug Unused Devices',
            description: 'Eliminate phantom power consumption',
            cost: 0,
            savings: billData.charges?.totalAmount * 0.03 || 0,
            timeframe: '1 day'
        });

        return actions;
    }

    generateLongTermStrategy(billData, constraints) {
        const strategy = [];
        
        // Equipment upgrades
        if (!constraints.budget || constraints.budget > 500) {
            strategy.push({
                title: 'LED Lighting Conversion',
                description: 'Replace all incandescent bulbs with LED',
                cost: 200,
                savings: billData.charges?.totalAmount * 0.08 || 0,
                timeframe: '1 month'
            });
        }

        if (!constraints.budget || constraints.budget > 2000) {
            strategy.push({
                title: 'Energy-Efficient Appliances',
                description: 'Upgrade to ENERGY STAR appliances',
                cost: 2000,
                savings: billData.charges?.totalAmount * 0.20 || 0,
                timeframe: '6 months'
            });
        }

        return strategy;
    }

    calculateTotalSavings(immediate, longTerm, currentCost) {
        const immediateSavings = immediate.reduce((sum, action) => sum + (action.savings || 0), 0);
        const longTermSavings = longTerm.reduce((sum, action) => sum + (action.savings || 0), 0);
        
        return {
            total: immediateSavings + longTermSavings,
            breakdown: {
                immediate: immediateSavings,
                longTerm: longTermSavings,
                percentage: ((immediateSavings + longTermSavings) / currentCost) * 100
            }
        };
    }

    createImplementationPlan(immediate, longTerm) {
        const phases = [
            {
                name: 'Phase 1: Immediate Actions',
                duration: '1 week',
                actions: immediate,
                priority: 'high'
            },
            {
                name: 'Phase 2: Short-term Improvements',
                duration: '1-3 months',
                actions: longTerm.filter(action => action.cost < 500),
                priority: 'medium'
            },
            {
                name: 'Phase 3: Long-term Investments',
                duration: '3-12 months',
                actions: longTerm.filter(action => action.cost >= 500),
                priority: 'low'
            }
        ];

        return {
            phases,
            timeline: '12 months',
            totalActions: immediate.length + longTerm.length
        };
    }

    prioritizeActions(actions) {
        const prioritization = { high: [], medium: [], low: [] };
        
        actions.forEach(action => {
            const roi = action.savings / (action.cost || 1);
            if (roi > 0.5 || action.cost === 0) {
                prioritization.high.push(action);
            } else if (roi > 0.2) {
                prioritization.medium.push(action);
            } else {
                prioritization.low.push(action);
            }
        });

        return prioritization;
    }

    assessImplementationRisks(plan) {
        const risks = [];
        
        // Budget risk
        const totalCost = [...plan.immediate, ...plan.longTerm].reduce((sum, action) => sum + (action.cost || 0), 0);
        if (totalCost > 1000) {
            risks.push({
                type: 'budget',
                level: 'medium',
                description: 'High upfront investment required',
                mitigation: 'Consider phased implementation'
            });
        }

        // Technology risk
        const techActions = [...plan.immediate, ...plan.longTerm].filter(action => 
            action.title.includes('Smart') || action.title.includes('Technology')
        );
        if (techActions.length > 2) {
            risks.push({
                type: 'technology',
                level: 'low',
                description: 'Multiple technology implementations',
                mitigation: 'Ensure proper training and support'
            });
        }

        return risks;
    }
}

module.exports = { RecommendationEngine };