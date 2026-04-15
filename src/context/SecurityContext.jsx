import React, { createContext, useContext, useState, useEffect } from 'react';
import { securityEngine } from '../lib/alertsEngine';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
    // Persistent Configuration
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('jyoti_config');
        return saved ? JSON.parse(saved) : {
            biometric: { sensitivity: 85, liveness: true },
            alerts: { timer: 30, sensitivity: 'High' },
            zones: [
                { id: 1, name: 'Reception', level: 'Level 1', max: 10, status: 'SECURE' },
                { id: 2, name: 'Zone-A', level: 'Level 2', max: 6, status: 'SECURE' },
                { id: 3, name: 'Zone-B', level: 'Level 3', max: 4, status: 'ELEVATED' },
                { id: 4, name: 'Server Room', level: 'Level 4', max: 2, status: 'BREACH' }
            ],
            reports: { autoPdf: true, retention: 90 }
        };
    });

    // Real-time State seeded with Sample Data
    const [visitors, setVisitors] = useState([
        { id: 'V-9150', name: 'Arjun Sharma', org: 'TechCorp India', currentZone: 'Zone-A', status: 'Authorized', time: '09:15 AM', flagged: false, x: 0.5, y: 0.3 },
        { id: 'V-1002', name: 'Priya Nair', org: 'MediSoft Solutions', currentZone: 'Reception', status: 'Authorized', time: '10:02 AM', flagged: false, x: 0.2, y: 0.2 },
        { id: 'V-1045', name: 'Rahul Verma', org: 'Unknown', currentZone: 'Zone-B', status: 'Flagged', time: '10:45 AM', flagged: true, x: 0.6, y: 0.7 },
        { id: 'V-1100', name: 'Sneha Iyer', org: 'CloudBase Systems', currentZone: 'Server Room', status: 'Restricted', time: '11:00 AM', flagged: false, x: 0.9, y: 0.8 },
        { id: 'V-9500', name: 'Karan Malhotra', org: 'VIP Guest', currentZone: 'Reception', status: 'Authorized', time: '09:50 AM', flagged: false, x: 0.3, y: 0.2 },
    ]);
    const [alerts, setAlerts] = useState([]);
    const [broadcasts, setBroadcasts] = useState([
        { id: 3, message: 'Server Room on watch, restrict entry', type: 'DANGER', time: '11:02 AM' },
        { id: 2, message: 'one visitor acting suspicious, monitoring', type: 'WARNING', time: '10:50 AM' },
        { id: 1, message: 'Confirm Zone-B status', type: 'INFO', time: '10:48 AM' },
    ]);

    const guardInfo = {
        name: 'Vikram Singh',
        zone: 'Zone-B',
        shift: '9:00 AM – 5:00 PM',
        supervisor: 'Inspector Rajesh Kumar'
    };

    // Sync config with localStorage and Engine
    useEffect(() => {
        localStorage.setItem('jyoti_config', JSON.stringify(config));
        // Update alerts engine logic based on config
        if (securityEngine.updateConfig) {
            securityEngine.updateConfig(config);
        }
    }, [config]);

    // Subscriber for Alerts Engine
    useEffect(() => {
        const unsubscribe = securityEngine.subscribe('global_context', (currentAlerts) => {
            setAlerts(currentAlerts);
        });
        return unsubscribe;
    }, []);

    // Global Actions
    const addVisitor = (newVisitor) => {
        const visitor = {
            ...newVisitor,
            id: newVisitor.id || `V-${Date.now().toString().slice(-4)}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            flagged: false,
            currentZone: 'Reception'
        };
        setVisitors(prev => [visitor, ...prev]);
        return visitor;
    };

    const updateVisitorStatus = (id, updates) => {
        setVisitors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    };

    const acknowledgeAlert = (id) => {
        securityEngine.acknowledgeAlert(id);
    };

    const resolveAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        // Also inform engine if it supports resolution
        if (securityEngine.resolveAlert) securityEngine.resolveAlert(id);
    };

    const triggerBroadcast = (message, type = 'INFO') => {
        const id = Date.now();
        const newBroadcast = { id, message, type, time: new Date().toLocaleTimeString() };
        setBroadcasts(prev => [newBroadcast, ...prev]);
        
        // Auto-clear broadcasts after 10s
        setTimeout(() => {
            setBroadcasts(prev => prev.filter(b => b.id !== id));
        }, 10000);
    };

    const value = {
        config,
        setConfig,
        visitors,
        setVisitors,
        addVisitor,
        updateVisitorStatus,
        alerts,
        acknowledgeAlert,
        resolveAlert,
        broadcasts,
        triggerBroadcast,
        guardInfo
    };

    return (
        <SecurityContext.Provider value={value}>
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (!context) throw new Error('useSecurity must be used within SecurityProvider');
    return context;
};
