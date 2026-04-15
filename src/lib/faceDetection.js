import * as faceDetection from '@tensorflow-models/face-detection';
import * as tf from '@tensorflow/tfjs';
import { securityEngine } from './alertsEngine';

class BiometricScanner {
    constructor() {
        this.detector = null;
        this.isInitialized = false;
        this.registeredVisitors = [];
    }

    async init() {
        if (this.isInitialized) return;

        const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
        const detectorConfig = {
            runtime: 'tfjs',
        };
        this.detector = await faceDetection.createDetector(model, detectorConfig);
        this.isInitialized = true;
        console.log("[BIOMETRIC-SCANNER] Face Detector Online.");
    }

    /**
     * Scan a frame from webcam and detect face
     * @param {HTMLVideoElement | HTMLImageElement} source 
     */
    async scanFrame(source) {
        if (!this.isInitialized) await this.init();

        const faces = await this.detector.estimateFaces(source);
        if (faces.length === 0) return { detected: false };

        const face = faces[0];
        const { box } = face;

        // In a real system, we'd extract embeddings and compare hashes.
        // For this project, we simulate the identification logic.
        const identification = this._simulateIdentification(face);

        if (!identification.verified && identification.confidence > 0.8) {
            this._triggerUnknownAlert(identification);
        }

        return {
            detected: true,
            box,
            ...identification
        };
    }

    registerVisitor(name) {
        const newId = `V-${Math.floor(Math.random() * 9000) + 1000}`;
        this.registeredVisitors.unshift({ id: newId, name });
        console.log(`[BIO-REGISTRY] New Identity Tokenized: ${name} (${newId})`);
        return newId;
    }

    _simulateIdentification(face) {
        // In a real app, this would compare facial embeddings
        // For this demo, if visitors are registered, we'll match the latest
        const hasVisitors = this.registeredVisitors.length > 0;
        
        if (hasVisitors) {
            const matches = this.registeredVisitors[0];
            return {
                verified: true,
                name: matches.name,
                id: matches.id,
                confidence: 0.98
            };
        }

        // Default simulation for pre-existing visitors
        const boxSize = Math.floor(face.box.width * face.box.height);
        const isKnown = boxSize % 2 !== 0;

        if (isKnown) {
            const visitor = this.registeredVisitors[Math.floor(Math.random() * 2)];
            return {
                verified: true,
                name: visitor.name,
                id: visitor.id,
                confidence: 0.96
            };
        }

        return {
            verified: false,
            name: 'UNKNOWN ENTITY',
            id: 'N/A',
            confidence: 0.92
        };
    }

    _triggerUnknownAlert(result) {
        securityEngine.processEvent(
            { type: 'BIOMETRIC_FAIL' },
            { 
                visitorId: result.id, 
                name: 'UNKNOWN VISITOR', 
                recentFails: 1,
                zone: 'Reception Entrance',
                confidence: (result.confidence * 100).toFixed(1) + '%'
            }
        );
    }
}

export const biometricScanner = new BiometricScanner();
