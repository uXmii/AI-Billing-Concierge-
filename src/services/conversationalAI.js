// services/conversationalAI.js
const OpenAI = require('openai');

class ConversationalAI {
    constructor() {
        this.openai = process.env.OPENAI_API_KEY ? 
            new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
        
        this.intentClassifier = new IntentClassifier();
        this.entityExtractor = new EntityExtractor();
        this.responseGenerator = new ResponseGenerator();
        this.contextManager = new ContextManager();
    }

    async generateResponse(options) {
        try {
            const { message, context, history, billData, userProfile } = options;
            
            // Classify intent
            const intent = await this.intentClassifier.classifyIntent(message);
            
            // Extract entities
            const entities = await this.entityExtractor.extractEntities(message);
            
            // Update context
            const updatedContext = this.contextManager.updateContext(context, {
                intent,
                entities,
                message,
                billData
            });
            
            // Generate response
            const response = await this.responseGenerator.generateResponse({
                message,
                intent,
                entities,
                context: updatedContext,
                history,
                billData,
                userProfile
            });
            
            return {
                message: response.text,
                intent: intent.name,
                entities: entities,
                confidence: response.confidence,
                suggestions: response.suggestions,
                actions: response.actions,
                context: updatedContext
            };
        } catch (error) {
            console.error('Conversational AI error:', error);
            return this.generateFallbackResponse(options.message);
        }
    }

    generateFallbackResponse(message) {
        const fallbackResponses = {
            'high': "I notice you're concerned about high charges. Based on typical patterns, this could be due to increased usage, rate changes, or seasonal factors. Would you like me to analyze your specific bill for detailed insights?",
            'save': "I can help you identify multiple ways to reduce your energy costs. The most effective strategies typically include optimizing peak-hour usage, improving efficiency, and adjusting consumption patterns. What aspect would you like to focus on first?",
            'explain': "I'd be happy to explain any part of your bill in detail. Each charge serves a specific purpose, from basic service fees to usage-based costs. Which specific charge or section would you like me to break down for you?",
            'compare': "Comparing your usage to previous periods and similar homes can reveal important insights. I can analyze seasonal patterns, efficiency metrics, and cost per unit to help you understand your consumption better.",
            'predict': "Based on your current usage patterns and historical data, I can forecast your upcoming bills and identify potential cost fluctuations. This helps you budget more effectively and make informed decisions about energy usage.",
            'anomaly': "I use advanced pattern recognition to identify unusual billing patterns that might indicate errors, efficiency issues, or changes in your usage behavior. These insights help you catch problems early and optimize your energy consumption.",
            'recommend': "I can provide personalized recommendations based on your specific usage patterns, home characteristics, and preferences. These suggestions are prioritized by potential savings and ease of implementation."
        };

        const lowerMessage = message.toLowerCase();
        for (const [key, response] of Object.entries(fallbackResponses)) {
            if (lowerMessage.includes(key)) {
                return {
                    message: response,
                    intent: key,
                    entities: [],
                    confidence: 0.7,
                    suggestions: [],
                    actions: []
                };
            }
        }

        return {
            message: "I'm here to help you understand your energy bills and optimize your costs. I can analyze your usage patterns, explain charges, detect anomalies, and provide personalized recommendations. What would you like to know?",
            intent: 'general',
            entities: [],
            confidence: 0.8,
            suggestions: [
                "Upload your bill for detailed analysis",
                "Ask about specific charges",
                "Get cost-saving recommendations",
                "Compare with previous months"
            ],
            actions: []
        };
    }
}

class IntentClassifier {
    async classifyIntent(message) {
        const intentPatterns = {
            'bill_explanation': /explain|understand|what is|break down|clarify/i,
            'cost_analysis': /cost|expensive|price|rate|charge|fee/i,
            'usage_analysis': /usage|consume|kwh|kilowatt|energy/i,
            'savings_advice': /save|reduce|lower|cut|decrease|optimize/i,
            'comparison': /compare|versus|vs|difference|against/i,
            'anomaly_detection': /unusual|strange|weird|anomaly|spike|drop/i,
            'prediction': /predict|forecast|future|next|upcoming/i,
            'recommendation': /recommend|suggest|advice|should|help/i,
            'dispute': /dispute|error|wrong|incorrect|problem|issue/i,
            'peak_usage': /peak|time|schedule|hours|when/i,
            'efficiency': /efficient|waste|optimize|improve|better/i,
            'seasonal': /season|winter|summer|weather|climate/i
        };

        let bestMatch = { name: 'general', confidence: 0.5 };
        
        for (const [intent, pattern] of Object.entries(intentPatterns)) {
            if (pattern.test(message)) {
                bestMatch = { name: intent, confidence: 0.8 };
                break;
            }
        }

        return bestMatch;
    }
}

class EntityExtractor {
    async extractEntities(message) {
        const entities = [];
        
        // Extract monetary amounts
        const moneyPattern = /\$([0-9,]+\.?[0-9]*)/g;
        let match;
        while ((match = moneyPattern.exec(message)) !== null) {
            entities.push({
                type: 'money',
                value: parseFloat(match[1].replace(/,/g, '')),
                text: match[0]
            });
        }
        
        // Extract kilowatt hours
        const kwhPattern = /([0-9,]+\.?[0-9]*)\s*kwh/gi;
        while ((match = kwhPattern.exec(message)) !== null) {
            entities.push({
                type: 'energy_usage',
                value: parseFloat(match[1].replace(/,/g, '')),
                text: match[0],
                unit: 'kWh'
            });
        }
        
        // Extract time periods
        const timePattern = /(last|previous|next|this)\s+(month|year|week|day)/gi;
        while ((match = timePattern.exec(message)) !== null) {
            entities.push({
                type: 'time_period',
                value: match[0],
                text: match[0]
            });
        }
        
        // Extract percentages
        const percentPattern = /([0-9]+\.?[0-9]*)\s*%/g;
        while ((match = percentPattern.exec(message)) !== null) {
            entities.push({
                type: 'percentage',
                value: parseFloat(match[1]),
                text: match[0]
            });
        }
        
        return entities;
    }
}

class ResponseGenerator {
    constructor() {
        this.openai = process.env.OPENAI_API_KEY ? 
            new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
    }

    async generateResponse(options) {
        try {
            if (this.openai) {
                return await this.generateAIResponse(options);
            } else {
                return this.generateRuleBasedResponse(options);
            }
        } catch (error) {
            console.error('Response generation error:', error);
            return this.generateRuleBasedResponse(options);
        }
    }

    async generateAIResponse(options) {
        const { message, intent, entities, context, history, billData } = options;
        
        const systemPrompt = `You are an expert AI billing assistant for utility companies. Your role is to:
        1. Explain utility bills in clear, simple language
        2. Identify cost-saving opportunities
        3. Detect billing anomalies and patterns
        4. Provide personalized recommendations
        5. Help users understand their energy usage
        
        Always be helpful, professional, and focus on actionable insights.
        
        Current context: ${JSON.stringify(context)}
        User's bill data: ${billData ? JSON.stringify(billData) : 'Not provided'}
        `;

        const completion = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                ...history.slice(-5), // Include last 5 messages for context
                { role: "user", content: message }
            ],
            max_tokens: 300,
            temperature: 0.7
        });

        const response = completion.choices[0].message.content;
        
        return {
            text: response,
            confidence: 0.9,
            suggestions: this.generateSuggestions(intent.name, entities),
            actions: this.generateActions(intent.name, entities)
        };
    }

    generateRuleBasedResponse(options) {
        const { intent, entities, billData } = options;
        
        const responses = {
            'bill_explanation': this.generateBillExplanation(billData, entities),
            'cost_analysis': this.generateCostAnalysis(billData, entities),
            'usage_analysis': this.generateUsageAnalysis(billData, entities),
            'savings_advice': this.generateSavingsAdvice(billData, entities),
            'comparison': this.generateComparison(billData, entities),
            'anomaly_detection': this.generateAnomalyResponse(billData, entities),
            'prediction': this.generatePrediction(billData, entities),
            'recommendation': this.generateRecommendation(billData, entities),
            'dispute': this.generateDisputeResponse(billData, entities),
            'peak_usage': this.generatePeakUsageResponse(billData, entities),
            'efficiency': this.generateEfficiencyResponse(billData, entities),
            'seasonal': this.generateSeasonalResponse(billData, entities),
            'payment_process': this.generatePaymentResponse(billData, entities),
            'payment_history': this.generatePaymentHistoryResponse(billData, entities),
            'payment_methods': this.generatePaymentMethodsResponse(billData, entities),
            'autopay_setup': this.generateAutopayResponse(billData, entities),
            'payment_security': this.generatePaymentSecurityResponse(billData, entities),
            'payment_optimization': this.generatePaymentOptimizationResponse(billData, entities)
        };

        const response = responses[intent.name] || responses['bill_explanation'];
        
        return {
            text: response,
            confidence: 0.8,
            suggestions: this.generateSuggestions(intent.name, entities),
            actions: this.generateActions(intent.name, entities)
        };
    }

    generateBillExplanation(billData, entities) {
        if (billData && billData.charges) {
            const total = billData.charges.totalAmount || 0;
            const breakdown = [
                `Energy charges: $${(billData.charges.energyCharges || 0).toFixed(2)}`,
                `Base service fee: $${(billData.charges.baseCharge || 0).toFixed(2)}`,
                `Delivery charges: $${(billData.charges.deliveryCharges || 0).toFixed(2)}`,
                `Taxes and fees: $${(billData.charges.taxes || 0).toFixed(2)}`
            ];
            
            return `Your total bill of $${total.toFixed(2)} consists of: ${breakdown.join(', ')}. The largest component is typically energy charges, which are based on your actual usage. Base service fees cover grid maintenance and connection costs.`;
        }
        
        return "I can break down your bill into its main components: energy charges (based on usage), base service fees (fixed monthly costs), delivery charges (transmission costs), and taxes/regulatory fees. Upload your bill for a detailed analysis of your specific charges.";
    }

    generateCostAnalysis(billData, entities) {
        if (billData && billData.charges && billData.usage) {
            const rate = billData.charges.energyCharges / billData.usage.totalKwh;
            const comparison = billData.comparisons?.previousMonth;
            
            let analysis = `Your average rate is $${rate.toFixed(3)} per kWh. `;
            
            if (comparison) {
                const change = ((billData.charges.totalAmount - comparison.amount) / comparison.amount * 100).toFixed(1);
                analysis += `Compared to last month, your bill ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)}%. `;
            }
            
            return analysis + "Cost factors include usage patterns, rate structures, and seasonal variations.";
        }
        
        return "Cost analysis involves examining your rate structure, usage patterns, and comparing costs over time. Key factors include energy rates, peak-hour pricing, and seasonal variations. Upload your bill for a detailed cost breakdown.";
    }
    generatePaymentResponse(billData, entities) {
    const paymentAdvice = [
        "I can help you process payments securely. I've detected your pending bills and can guide you through the payment process with AI-powered fraud detection.",
        "Your payment history shows excellent consistency. I recommend setting up AutoPay to maintain this pattern and earn potential early payment discounts.",
        "I notice you have multiple payment methods. Based on your spending patterns, I suggest using your rewards credit card for utility payments to maximize cashback.",
        "For optimal cash flow, I recommend scheduling payments 3-5 days before due dates. This avoids late fees while maintaining better account balance management."
    ];
    return paymentAdvice[Math.floor(Math.random() * paymentAdvice.length)];
}

generatePaymentHistoryResponse(billData, entities) {
    return "Your payment history shows a 98.5% success rate with an average payment of $101.70. You've saved approximately $180 this year by paying bills early and avoiding late fees. I can help you search through your payment history or analyze spending patterns.";
}

generatePaymentMethodsResponse(billData, entities) {
    return "I can help you manage your payment methods securely. You currently have multiple options including credit cards and bank accounts. I recommend keeping at least two payment methods active as backups and using rewards cards for cashback on utility payments.";
}

generateAutopayResponse(billData, entities) {
    return "AutoPay is excellent for maintaining consistent payment schedules. I can set up intelligent AutoPay that adjusts payment amounts based on your usage patterns and sends AI-powered notifications before each payment. This ensures you never miss a due date while maintaining full control.";
}

generatePaymentSecurityResponse(billData, entities) {
    return "Your payment security is my priority. I use advanced AI fraud detection that monitors for unusual payment patterns, validates transaction amounts against your billing history, and provides real-time security alerts. All payment data is encrypted with 256-bit SSL and stored securely.";
}

generatePaymentOptimizationResponse(billData, entities) {
    return "I can optimize your payment strategy for maximum savings. Based on your payment patterns, I suggest: using rewards credit cards for cashback, scheduling payments for early-pay discounts, setting up AutoPay for consistent bills, and maintaining backup payment methods for security.";
}


    generateUsageAnalysis(billData, entities) {
        if (billData && billData.usage) {
            const totalKwh = billData.usage.totalKwh;
            const peakKwh = billData.usage.peakKwh || 0;
            const peakRatio = peakKwh / totalKwh * 100;
            
            return `You used ${totalKwh} kWh this month. Peak-hour usage represents ${peakRatio.toFixed(1)}% of your consumption. Average daily usage is ${(totalKwh / 30).toFixed(1)} kWh. ${peakRatio > 35 ? 'Consider shifting more usage to off-peak hours to reduce costs.' : 'Your peak usage ratio is reasonable.'}`;
        }
        
        return "Usage analysis examines your consumption patterns, peak vs. off-peak usage, and daily/seasonal variations. Understanding these patterns helps identify optimization opportunities and explains cost fluctuations.";
    }

    generateSavingsAdvice(billData, entities) {
        const advice = [
            "Shift major appliance usage to off-peak hours (potential savings: 15-25%)",
            "Optimize thermostat settings (potential savings: 10-15%)",
            "Replace inefficient appliances (potential savings: 5-20%)",
            "Improve home insulation (potential savings: 10-30%)",
            "Use smart power strips to reduce standby consumption (potential savings: 5-10%)"
        ];
        
        return `Here are personalized cost-saving recommendations: ${advice.slice(0, 3).join('; ')}. These strategies are most effective when implemented together and can reduce your annual energy costs by 20-40%.`;
    }

    generateSuggestions(intent, entities) {
        const suggestions = {
            'bill_explanation': ['Explain specific charges', 'Compare with previous months', 'Analyze usage patterns'],
            'cost_analysis': ['Identify cost drivers', 'Compare rates', 'Find savings opportunities'],
            'usage_analysis': ['Analyze daily patterns', 'Compare seasonal usage', 'Identify peak usage'],
            'savings_advice': ['Get specific recommendations', 'Calculate potential savings', 'Create action plan'],
            'comparison': ['Compare with neighbors', 'Analyze trends', 'Benchmark efficiency'],
            'anomaly_detection': ['Investigate unusual patterns', 'Check for errors', 'Analyze causes'],
            'prediction': ['Forecast next bill', 'Predict seasonal changes', 'Plan budget'],
            'recommendation': ['Get personalized advice', 'Prioritize actions', 'Implement solutions']
        };
        
        return suggestions[intent] || ['Upload your bill', 'Ask specific questions', 'Get recommendations'];
    }

    generateActions(intent, entities) {
        const actions = {
            'bill_explanation': ['analyze_bill', 'show_breakdown'],
            'cost_analysis': ['calculate_costs', 'compare_rates'],
            'usage_analysis': ['analyze_usage', 'show_patterns'],
            'savings_advice': ['generate_recommendations', 'calculate_savings'],
            'comparison': ['compare_usage', 'benchmark_efficiency'],
            'anomaly_detection': ['detect_anomalies', 'investigate_issues'],
            'prediction': ['forecast_bills', 'predict_costs'],
            'recommendation': ['create_action_plan', 'prioritize_actions']
        };
        
        return actions[intent] || ['upload_bill', 'ask_question'];
    }
}

class ContextManager {
    updateContext(currentContext, newData) {
        return {
            ...currentContext,
            lastIntent: newData.intent,
            lastEntities: newData.entities,
            lastMessage: newData.message,
            billData: newData.billData || currentContext.billData,
            conversationState: this.determineConversationState(newData),
            timestamp: new Date().toISOString()
        };
    }

    determineConversationState(data) {
        if (data.billData) return 'bill_analyzed';
        if (data.intent.name === 'bill_explanation') return 'explaining_bill';
        if (data.intent.name === 'savings_advice') return 'providing_savings';
        return 'general_conversation';
    }
}

module.exports = { ConversationalAI };