// routes/advancedBillingAPI.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Import AI services
const { DocumentProcessor } = require('../services/documentProcessor');
const { AnomalyDetector } = require('../services/anomalyDetector');
const { PredictiveAnalyzer } = require('../services/predictiveAnalyzer');
const { ConversationalAI } = require('../services/conversationalAI');
const { RecommendationEngine } = require('../services/recommendationEngine');
const { PatternAnalyzer } = require('../services/patternAnalyzer');

// Configure multer for advanced file handling
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|png|jpg|jpeg|gif|tiff|bmp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF and image files are allowed'));
        }
    }
});

// Initialize AI services
const documentProcessor = new DocumentProcessor();
const anomalyDetector = new AnomalyDetector();
const predictiveAnalyzer = new PredictiveAnalyzer();
const conversationalAI = new ConversationalAI();
const recommendationEngine = new RecommendationEngine();
const patternAnalyzer = new PatternAnalyzer();

// POST /api/billing/advanced-upload - Advanced document processing
router.post('/advanced-upload', upload.array('documents', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const results = [];
        
        for (const file of req.files) {
            try {
                // Process document with advanced AI
                const extractedData = await documentProcessor.processDocument(file);
                
                // Detect anomalies
                const anomalies = await anomalyDetector.detectAnomalies(extractedData);
                
                // Generate predictive insights
                const predictions = await predictiveAnalyzer.generatePredictions(extractedData);
                
                // Create recommendations
                const recommendations = await recommendationEngine.generateRecommendations(
                    extractedData, 
                    anomalies, 
                    predictions
                );
                
                // Analyze patterns
                const patterns = await patternAnalyzer.analyzePatterns(extractedData);
                
                results.push({
                    filename: file.originalname,
                    success: true,
                    data: extractedData,
                    anomalies: anomalies,
                    predictions: predictions,
                    recommendations: recommendations,
                    patterns: patterns,
                    confidence: extractedData.confidence || 0.85,
                    processingTime: Date.now() - Date.now()
                });
                
            } catch (error) {
                results.push({
                    filename: file.originalname,
                    success: false,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            results: results,
            totalFiles: req.files.length,
            successfulFiles: results.filter(r => r.success).length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Advanced upload error:', error);
        res.status(500).json({
            error: 'Failed to process documents',
            details: error.message
        });
    }
});

// POST /api/billing/intelligent-chat - Advanced conversational AI
router.post('/intelligent-chat', async (req, res) => {
    try {
        const { message, context, conversationHistory, billData } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Generate intelligent response using context
        const response = await conversationalAI.generateResponse({
            message,
            context: context || {},
            history: conversationHistory || [],
            billData: billData || null,
            userProfile: req.user || null
        });

        res.json({
            success: true,
            response: response.message,
            suggestions: response.suggestions || [],
            actions: response.actions || [],
            confidence: response.confidence || 0.9,
            intent: response.intent || 'general',
            entities: response.entities || [],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Intelligent chat error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            details: error.message
        });
    }
});

// GET /api/billing/predictive-analysis/:timeframe - Predictive analytics
router.get('/predictive-analysis/:timeframe', async (req, res) => {
    try {
        const { timeframe } = req.params;
        const { billData, historicalData } = req.query;
        
        const validTimeframes = ['1month', '3months', '6months', '1year'];
        if (!validTimeframes.includes(timeframe)) {
            return res.status(400).json({ error: 'Invalid timeframe' });
        }

        const predictions = await predictiveAnalyzer.generateComprehensivePredictions({
            timeframe,
            currentBillData: billData ? JSON.parse(billData) : null,
            historicalData: historicalData ? JSON.parse(historicalData) : null
        });

        res.json({
            success: true,
            timeframe,
            predictions: predictions.forecast,
            scenarios: predictions.scenarios,
            recommendations: predictions.recommendations,
            confidence: predictions.confidence,
            factors: predictions.influencingFactors,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Predictive analysis error:', error);
        res.status(500).json({
            error: 'Failed to generate predictions',
            details: error.message
        });
    }
});

// POST /api/billing/pattern-analysis - Advanced pattern recognition
router.post('/pattern-analysis', async (req, res) => {
    try {
        const { billData, timeRange, analysisType } = req.body;
        
        if (!billData) {
            return res.status(400).json({ error: 'Bill data is required' });
        }

        const patterns = await patternAnalyzer.analyzeComprehensivePatterns({
            data: billData,
            timeRange: timeRange || 'all',
            analysisType: analysisType || 'comprehensive'
        });

        res.json({
            success: true,
            patterns: patterns.identifiedPatterns,
            insights: patterns.insights,
            correlations: patterns.correlations,
            seasonality: patterns.seasonality,
            trends: patterns.trends,
            outliers: patterns.outliers,
            confidence: patterns.confidence,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Pattern analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze patterns',
            details: error.message
        });
    }
});

// GET /api/billing/anomaly-detection - Real-time anomaly detection
router.get('/anomaly-detection', async (req, res) => {
    try {
        const { billData, sensitivity, includeMinor } = req.query;
        
        if (!billData) {
            return res.status(400).json({ error: 'Bill data is required' });
        }

        const anomalies = await anomalyDetector.detectRealTimeAnomalies({
            data: JSON.parse(billData),
            sensitivity: sensitivity || 'medium',
            includeMinor: includeMinor === 'true'
        });

        res.json({
            success: true,
            anomalies: anomalies.detected,
            severity: anomalies.severity,
            recommendations: anomalies.recommendations,
            confidence: anomalies.confidence,
            alertLevel: anomalies.alertLevel,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Anomaly detection error:', error);
        res.status(500).json({
            error: 'Failed to detect anomalies',
            details: error.message
        });
    }
});

// POST /api/billing/optimization-recommendations - AI-powered optimization
router.post('/optimization-recommendations', async (req, res) => {
    try {
        const { billData, userPreferences, constraints } = req.body;
        
        if (!billData) {
            return res.status(400).json({ error: 'Bill data is required' });
        }

        const recommendations = await recommendationEngine.generateOptimizationPlan({
            billData,
            preferences: userPreferences || {},
            constraints: constraints || {}
        });

        res.json({
            success: true,
            recommendations: recommendations.immediate,
            longTermPlan: recommendations.longTerm,
            potentialSavings: recommendations.savings,
            implementation: recommendations.implementation,
            prioritization: recommendations.prioritization,
            riskAssessment: recommendations.risks,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Optimization recommendations error:', error);
        res.status(500).json({
            error: 'Failed to generate optimization recommendations',
            details: error.message
        });
    }
});

// GET /api/billing/comparative-analysis - Comparative analysis with benchmarks
router.get('/comparative-analysis', async (req, res) => {
    try {
        const { billData, region, homeType, occupancy } = req.query;
        
        if (!billData) {
            return res.status(400).json({ error: 'Bill data is required' });
        }

        const comparison = await patternAnalyzer.generateComparativeAnalysis({
            userBillData: JSON.parse(billData),
            region: region || 'national',
            homeType: homeType || 'average',
            occupancy: occupancy || 'average'
        });

        res.json({
            success: true,
            comparison: comparison.metrics,
            ranking: comparison.ranking,
            insights: comparison.insights,
            opportunities: comparison.opportunities,
            benchmarks: comparison.benchmarks,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Comparative analysis error:', error);
        res.status(500).json({
            error: 'Failed to generate comparative analysis',
            details: error.message
        });
    }
});

// POST /api/billing/dispute-analysis - AI-powered dispute detection
router.post('/dispute-analysis', async (req, res) => {
    try {
        const { billData, previousBills, disputeType } = req.body;
        
        if (!billData) {
            return res.status(400).json({ error: 'Bill data is required' });
        }

        const disputeAnalysis = await anomalyDetector.analyzeDisputePotential({
            currentBill: billData,
            historicalBills: previousBills || [],
            disputeType: disputeType || 'billing_error'
        });

        res.json({
            success: true,
            disputePotential: disputeAnalysis.likelihood,
            evidence: disputeAnalysis.evidence,
            recommendations: disputeAnalysis.recommendations,
            supportingData: disputeAnalysis.supportingData,
            disputeStrategy: disputeAnalysis.strategy,
            confidence: disputeAnalysis.confidence,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Dispute analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze dispute potential',
            details: error.message
        });
    }
});

// GET /api/billing/energy-insights - Advanced energy insights
router.get('/energy-insights', async (req, res) => {
    try {
        const { billData, timeRange, insightType } = req.query;
        
        if (!billData) {
            return res.status(400).json({ error: 'Bill data is required' });
        }

        const insights = await predictiveAnalyzer.generateEnergyInsights({
            data: JSON.parse(billData),
            timeRange: timeRange || '12months',
            insightType: insightType || 'comprehensive'
        });

        res.json({
            success: true,
            insights: insights.keyInsights,
            efficiency: insights.efficiencyMetrics,
            sustainability: insights.sustainabilityMetrics,
            costOptimization: insights.costOptimization,
            behavioralInsights: insights.behavioralInsights,
            projections: insights.projections,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Energy insights error:', error);
        res.status(500).json({
            error: 'Failed to generate energy insights',
            details: error.message
        });
    }
});

// POST /api/billing/smart-alerts - Configure intelligent alerts
router.post('/smart-alerts', async (req, res) => {
    try {
        const { alertTypes, thresholds, preferences } = req.body;
        
        const alertConfig = await anomalyDetector.configureSmartAlerts({
            types: alertTypes || ['usage_spike', 'billing_anomaly', 'efficiency_drop'],
            thresholds: thresholds || {},
            preferences: preferences || {}
        });

        res.json({
            success: true,
            configuration: alertConfig.settings,
            activeAlerts: alertConfig.active,
            schedule: alertConfig.schedule,
            delivery: alertConfig.delivery,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Smart alerts error:', error);
        res.status(500).json({
            error: 'Failed to configure smart alerts',
            details: error.message
        });
    }
});

// GET /api/billing/dashboard-analytics - Dashboard analytics
router.get('/dashboard-analytics', async (req, res) => {
    try {
        const { timeRange, metrics } = req.query;
        
        const analytics = await predictiveAnalyzer.generateDashboardAnalytics({
            timeRange: timeRange || '6months',
            requestedMetrics: metrics ? metrics.split(',') : ['all']
        });

        res.json({
            success: true,
            analytics: analytics.metrics,
            visualizations: analytics.visualizations,
            summaries: analytics.summaries,
            trends: analytics.trends,
            alerts: analytics.alerts,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({
            error: 'Failed to generate dashboard analytics',
            details: error.message
        });
    }
});

module.exports = router;