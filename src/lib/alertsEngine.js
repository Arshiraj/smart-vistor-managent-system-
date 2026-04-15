// src/lib/alertsEngine.js
import { stpModel, SCOUTING_CLASSES } from './predictionModel.js';

export const SEVERITY = {
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
    AI_PREDICTED: 'AI_PREDICTED' // New level for probabilistic alerts
};

// 1. Immutable Rules Database Configuration
const alertRules = [
    {
        id: 'rule_1_v1',
        name: 'Wandering Visitor',
        severity: SEVERITY.HIGH,
        active: true,
        evaluate: (event, context) => {
            return event.type === 'ZONE_CHANGE' &&
                context.visitor?.authorizedZone !== event.targetZone;
        }
    },
    {
        id: 'rule_2_v1',
        name: 'After-Hours Access Attempt',
        severity: SEVERITY.HIGH,
        active: true,
        evaluate: (event, context) => {
            const currentHour = new Date().getHours();
            return event.type === 'CHECK_IN' && (currentHour < 6 || currentHour > 18);
        }
    },
    {
        id: 'rule_3_v1',
        name: 'Repeated Failed Biometrics',
        severity: SEVERITY.CRITICAL,
        active: true,
        evaluate: (event, context) => {
            return event.type === 'BIOMETRIC_FAIL' && context.recentFails >= 3;
        }
    },
    {
        id: 'rule_4_v1',
        name: 'Passback Violation / Badge Cloned',
        severity: SEVERITY.CRITICAL,
        active: true,
        evaluate: (event, context) => {
            return event.type === 'DUPLICATE_SCAN' && context.distanceBetweenScans > 100;
        }
    }
];

class SecurityAlertsSystem {
    constructor() {
        this.subscribers = [];
        this.voiceAlertsEnabled = true;
        this.config = {
            alerts: { timer: 30, sensitivity: 'High' }
        };

        this.activeAlerts = [
            {
                id: 'alert_demo_1',
                ruleId: 'rule_1_v1',
                name: 'Wandering Visitor',
                severity: SEVERITY.HIGH,
                timestamp: '2024-03-29T10:47:00.000Z',
                context: { visitorId: 'V-1045', zone: 'Zone-B' },
                status: 'NEW'
            },
            {
                id: 'alert_demo_2',
                ruleId: 'rule_4_v1',
                name: 'Unauthorized Restricted Zone Entry',
                severity: SEVERITY.CRITICAL,
                timestamp: '2024-03-29T11:01:00.000Z',
                context: { visitorId: 'V-1100', zone: 'Server Room' },
                status: 'NEW'
            },
            {
                id: 'alert_demo_3',
                ruleId: 'ai_stp_v2',
                name: 'AI PREDICTION: Unauthorized access attempt',
                severity: SEVERITY.CRITICAL,
                timestamp: '2024-03-29T11:05:00.000Z',
                context: { probability: '98.5%', confidence: '92.1%', behavior: 'TAILGATING_ATTEMPT', zone: 'Server Room' },
                status: 'NEW'
            }
        ];

        // Asynchronous initialization of the TF.js model
        setTimeout(async () => {
            try {
                await stpModel.init();
                console.log("[STP-MODEL] AI System Online - Predictive Threat Modeling Active.");
            } catch (err) {
                console.error("[STP-MODEL] Initialization failed:", err);
            }
        }, 100);
    }

    setVoiceAlerts(enabled) {
        this.voiceAlertsEnabled = enabled;
        console.log(`[VOICE-ALERTS] ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    updateConfig(newConfig) {
        this.config = newConfig;
        console.log("[ENGINE-CONFIG] System configuration synchronized.");
    }

    speakAlert(alert) {
        if (!this.voiceAlertsEnabled) return;
        
        // Ensure browser supports synthesis
        if (!window.speechSynthesis) return;

        const zone = alert.context?.zone || alert.context?.currentZoneName || 'Unknown Zone';
        const visitorId = alert.context?.visitorId || 'Unknown ID';
        const text = `Security Alert. ${alert.name} detected. Visitor ${visitorId} in ${zone}. Threat level ${alert.severity}.`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Optional: Filter for specific voice (e.g., more "system" like)
        const voices = window.speechSynthesis.getVoices();
        const systemVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('Samantha')) || voices[0];
        if (systemVoice) utterance.voice = systemVoice;

        window.speechSynthesis.speak(utterance);
    }

    /**
     * AI-Powered Behavior Prediction
     * @param {string} visitorId
     * @param {Object} event
     * @param {Object} metadata - { x, y, accessLevel, thermal, sentiment, currentZoneName, visitFrequency }
     */
    async predictBehavior(visitorId, event, metadata) {
        if (!this.visitorStates.has(visitorId)) {
            this.visitorStates.set(visitorId, { trajectory: [], metadata: {} });
        }

        const state = this.visitorStates.get(visitorId);
        const lastStep = state.trajectory[state.trajectory.length - 1];
        const timestamp = Date.now();
        const timeDelta = lastStep ? (timestamp - lastStep.timestamp) / 1000 : 0;

        // Record normalized movement
        state.trajectory.push({
            x: metadata.x !== undefined ? metadata.x : 0.5,
            y: metadata.y !== undefined ? metadata.y : 0.5,
            timeDelta,
            timestamp
        });

        // Windowing for sequence models
        if (state.trajectory.length > 10) state.trajectory.shift();

        state.metadata = {
            accessLevel: metadata.accessLevel || 1,
            thermalNormalized: metadata.thermal > 37.5 ? 1.0 : 0.0,
            sentimentScore: metadata.sentiment === 'Agitated' ? 0.9 : 0.2,
            currentZoneID: metadata.currentZoneID || 1,
            currentZoneName: metadata.currentZoneName || 'General Zone',
            visitFrequency: metadata.visitFrequency || 1
        };

        try {
            // TF.js Inference
            const prediction = await stpModel.predict({
                trajectory: state.trajectory,
                metadata: state.metadata
            });

            // Threshold for triggering predictive alerts
            const TRIGGER_THRESHOLD = 0.65;

            if (prediction.breachProbability > TRIGGER_THRESHOLD && prediction.classification !== SCOUTING_CLASSES.NORMAL) {
                console.info(`[STP-MODEL] Predictive Alert: ${prediction.classification} (Prob: ${prediction.breachProbability.toFixed(3)})`);

                this.createNewAlert({
                    ruleId: 'ai_stp_v2',
                    name: `AI PREDICTION: ${prediction.classification.replace(/_/g, ' ')}`,
                    severity: prediction.breachProbability > 0.85 ? SEVERITY.CRITICAL : SEVERITY.AI_PREDICTED,
                    context: {
                        probability: (prediction.breachProbability * 100).toFixed(1) + '%',
                        confidence: (prediction.confidence * 100).toFixed(1) + '%',
                        behavior: prediction.classification,
                        evidence: prediction.evidenceChain,
                        visitorId: visitorId,
                        zone: state.metadata.currentZoneName
                    }
                });
            }
        } catch (error) {
            console.error("[STP-MODEL] Inference failed, falling back to deterministic rules:", error);
        }
    }

    async processEvent(event, context) {
        const visitorId = context.visitorId || `v_${Math.random().toString(36).substr(2, 5)}`;

        // A. Deterministic Rules
        alertRules.filter(r => r.active).forEach(rule => {
            if (rule.evaluate(event, context)) {
                this.createNewAlert({
                    ruleId: rule.id,
                    name: rule.name,
                    severity: rule.severity,
                    context: { ...context, visitorId }
                });
            }
        });

        // B. Predictive Behavioral Logic
        const motionEvents = ['ZONE_CHANGE', 'SCAN_EVENT', 'HEARTBEAT', 'TELEMETRY'];
        if (motionEvents.includes(event.type)) {
            // Predictive models enrich signals in parallel
            this.predictBehavior(visitorId, event, context);
        }

        return this.activeAlerts;
    }

    async processBatch(events) {
        // High-performance batch processing for multiple visitors
        return Promise.all(events.map(e => this.processEvent(e.event, e.context)));
    }

    createNewAlert(config) {
        const newAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            ruleId: config.ruleId,
            name: config.name,
            severity: config.severity,
            timestamp: new Date().toISOString(),
            context: config.context,
            status: 'NEW'
        };

        this.activeAlerts.unshift(newAlert);
        this.notifySubscribers();
        this.handleEscalation([newAlert]);
        
        // Voice Alert Trigger
        if (newAlert.severity === SEVERITY.CRITICAL || newAlert.severity === SEVERITY.HIGH || newAlert.severity === SEVERITY.AI_PREDICTED) {
            this.speakAlert(newAlert);
        }

        return newAlert;
    }

    handleEscalation(alerts) {
        const t2Delay = (this.config.alerts?.timer || 30) * 1000;
        const t3Delay = t2Delay * 2;

        alerts.forEach(alert => {
            // T-Series Escalation Protocol Integration
            if (alert.severity === SEVERITY.CRITICAL || alert.severity === SEVERITY.AI_PREDICTED) {
                const isHighProbBreach = alert.severity === SEVERITY.AI_PREDICTED &&
                    parseFloat(alert.context.probability) > 85;

                // T+0: Instant Context Injection (CCTV/Lockdown Ready)
                console.warn(`[T+0s ESCALATION] ${alert.name} in ${alert.context.zone || 'Unknown Zone'}. Preparing CCTV context.`);

                // T+N: Guard Node Ping (T2)
                setTimeout(() => {
                    const active = this.activeAlerts.find(a => a.id === alert.id);
                    if (active && active.status === 'NEW') {
                        console.error(`[T+${t2Delay/1000}s ESCALATION] Alert ${alert.id} UNACKNOWLEDGED. Paging guard node.`);

                        // T+2N: Manager Paging (T3)
                        setTimeout(() => {
                            const stillActive = this.activeAlerts.find(a => a.id === alert.id);
                            if (stillActive && stillActive.status === 'NEW') {
                                console.error(`[T+${t3Delay/1000}s GLOBAL ESCALATION] CRITICAL BREACH PATTERN CONFIRMED. Initiating manager protocol.`);
                            }
                        }, t2Delay);
                    }
                }, t2Delay);
            }
        });
    }

    subscribe(sessionToken, callback) {
        this.subscribers.push(callback);
        callback([...this.activeAlerts]);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    notifySubscribers() {
        this.subscribers.forEach(cb => cb([...this.activeAlerts]));
    }

    acknowledgeAlert(alertId) {
        const alert = this.activeAlerts.find(a => a.id === alertId);
        if (alert) {
            alert.status = 'ACKNOWLEDGED';
            alert.resolutionTime = new Date().toISOString();
            this.notifySubscribers();
        }
    }

    resolveAlert(alertId) {
        this.activeAlerts = this.activeAlerts.filter(a => a.id !== alertId);
        this.notifySubscribers();
    }
}

export const securityEngine = new SecurityAlertsSystem();
