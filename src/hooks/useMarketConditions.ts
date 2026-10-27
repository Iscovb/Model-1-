import { useState, useEffect, useCallback, useRef } from 'react';
import { LiveScannerState } from '../types';
import { evaluateMarketState } from '../services/marketScanner';
import {
  getNotificationPermissionStatus,
  requestNotificationAccess,
  triggerMarketStateNotification,
} from '../services/notificationService';

interface UseMarketConditionsOptions {
  intervalMs?: number;
  initialScenario?: 'CURRENT_DEVELOPING' | 'MORNING_SELL_COMPLETED';
}

export interface ScannerAlertItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'BIAS' | 'SETUP' | 'PURGE';
}

export interface UseMarketConditionsReturn {
  marketState: LiveScannerState;
  isRefreshing: boolean;
  autoRefresh: boolean;
  currentScenario: 'CURRENT_DEVELOPING' | 'MORNING_SELL_COMPLETED';
  lastUpdated: string;
  notificationsEnabled: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  latestAlert: ScannerAlertItem | null;
  refreshNow: () => void;
  setAutoRefresh: (val: boolean | ((prev: boolean) => boolean)) => void;
  setScenario: (scenario: 'CURRENT_DEVELOPING' | 'MORNING_SELL_COMPLETED') => void;
  toggleNotifications: () => Promise<void>;
  testNotification: () => void;
  dismissAlert: () => void;
}

export function useMarketConditions({
  intervalMs = 15000,
  initialScenario = 'CURRENT_DEVELOPING',
}: UseMarketConditionsOptions = {}): UseMarketConditionsReturn {
  const [scenario, setScenarioState] = useState<'CURRENT_DEVELOPING' | 'MORNING_SELL_COMPLETED'>(
    initialScenario
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [marketState, setMarketState] = useState<LiveScannerState>(() =>
    evaluateMarketState(initialScenario)
  );

  // Notifications State
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('model1_scanner_notifications');
    return saved === 'true';
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    () => getNotificationPermissionStatus()
  );

  const [latestAlert, setLatestAlert] = useState<ScannerAlertItem | null>(null);

  // Reference to track previous state for difference detection
  const previousStateRef = useRef<{
    dailyBias: string;
    direction: string;
    stage: string;
    purgeStatus: string;
    scenario: string;
  }>({
    dailyBias: marketState.dailyBias,
    direction: marketState.activeSetup.direction,
    stage: marketState.activeSetup.currentStage,
    purgeStatus: marketState.purgeStatus,
    scenario: initialScenario,
  });

  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;

  const notificationsEnabledRef = useRef(notificationsEnabled);
  notificationsEnabledRef.current = notificationsEnabled;

  // Handler to compare previous state with new state and alert if changed
  const checkAndAlertStateChanges = useCallback((newState: LiveScannerState, newScenario: string) => {
    const prev = previousStateRef.current;
    const isBiasChange = prev.dailyBias !== newState.dailyBias;
    const isDirectionChange = prev.direction !== newState.activeSetup.direction;
    const isStageChange = prev.stage !== newState.activeSetup.currentStage;
    const isPurgeChange = prev.purgeStatus !== newState.purgeStatus;
    const isScenarioChange = prev.scenario !== newScenario;

    // Check if any meaningful state or bias change occurred
    if (isBiasChange || isDirectionChange || isStageChange || isPurgeChange || isScenarioChange) {
      let title = 'XAUUSD Model#1 Market Alert';
      let body = '';
      let type: 'BIAS' | 'SETUP' | 'PURGE' = 'SETUP';

      if (isDirectionChange || isStageChange) {
        type = 'SETUP';
        title = `🚨 Setup Alert: ${newState.activeSetup.direction} [${newState.activeSetup.confidenceScore}/11]`;
        body = `XAUUSD $${newState.currentPrice.toFixed(2)} | Stage: ${newState.activeSetup.currentStage} | Bias: ${newState.dailyBias}`;
      } else if (isBiasChange) {
        type = 'BIAS';
        title = `🎯 Bias Update: ${newState.dailyBias}`;
        body = `Daily Bias is now ${newState.dailyBias}. Target: ${newState.biasUpdateSummary}`;
      } else if (isPurgeChange) {
        type = 'PURGE';
        title = `⚡ Purge Hour: ${newState.purgeStatus === 'ACTIVE_PURGE' ? 'ACTIVE' : 'Ended'}`;
        body = newState.purgeDetails;
      } else {
        title = `📊 Market State: ${newScenario === 'MORNING_SELL_COMPLETED' ? 'Morning Sell Filled' : 'Live Developing'}`;
        body = `Price: $${newState.currentPrice.toFixed(2)} | Bias: ${newState.dailyBias} | Setup: ${newState.activeSetup.direction}`;
      }

      const alertItem: ScannerAlertItem = {
        id: `alert-${Date.now()}`,
        title,
        body,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type,
      };

      setLatestAlert(alertItem);

      // Trigger browser notification & audio chime if enabled
      if (notificationsEnabledRef.current) {
        triggerMarketStateNotification(title, body, `model1-${type.toLowerCase()}`);
      }

      // Update ref
      previousStateRef.current = {
        dailyBias: newState.dailyBias,
        direction: newState.activeSetup.direction,
        stage: newState.activeSetup.currentStage,
        purgeStatus: newState.purgeStatus,
        scenario: newScenario,
      };
    }
  }, []);

  const refreshNow = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      const nextState = evaluateMarketState(scenarioRef.current);
      setMarketState(nextState);
      checkAndAlertStateChanges(nextState, scenarioRef.current);
      setIsRefreshing(false);
    }, 200);
  }, [checkAndAlertStateChanges]);

  const setScenario = useCallback((newScenario: 'CURRENT_DEVELOPING' | 'MORNING_SELL_COMPLETED') => {
    setScenarioState(newScenario);
    setIsRefreshing(true);
    setTimeout(() => {
      const nextState = evaluateMarketState(newScenario);
      setMarketState(nextState);
      checkAndAlertStateChanges(nextState, newScenario);
      setIsRefreshing(false);
    }, 200);
  }, [checkAndAlertStateChanges]);

  // Toggle notifications on/off
  const toggleNotifications = useCallback(async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('model1_scanner_notifications', 'false');
      return;
    }

    const currentPerm = getNotificationPermissionStatus();
    if (currentPerm === 'unsupported') {
      setNotificationPermission('unsupported');
      // Still enable in-app audio chime & banner
      setNotificationsEnabled(true);
      localStorage.setItem('model1_scanner_notifications', 'true');
      return;
    }

    if (currentPerm === 'granted') {
      setNotificationsEnabled(true);
      localStorage.setItem('model1_scanner_notifications', 'true');
      triggerMarketStateNotification(
        '🔔 Model#1 Live Scanner Alert',
        'Ogeysiisyada tooska ah waa la daaray! Waxaad heli doontaa digniin marka suuqu isbeddelo.'
      );
      return;
    }

    // Request permission
    const result = await requestNotificationAccess();
    setNotificationPermission(result);

    if (result === 'granted') {
      setNotificationsEnabled(true);
      localStorage.setItem('model1_scanner_notifications', 'true');
      triggerMarketStateNotification(
        '🔔 Model#1 Live Scanner Alert',
        'Ogeysiisyada browser-ka waa la daaray! Digniinaha suuqa XAUUSD si toos ah ayaad u heli doontaa.'
      );
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('model1_scanner_notifications', 'false');
    }
  }, [notificationsEnabled]);

  // Test notification helper
  const testNotification = useCallback(() => {
    triggerMarketStateNotification(
      '🔔 Tijaabada Ogeysiiska Model#1 (Test Alert)',
      `XAUUSD: $${marketState.currentPrice.toFixed(2)} | Bias: ${marketState.dailyBias} | Setup: ${marketState.activeSetup.direction}`
    );
    setLatestAlert({
      id: `test-${Date.now()}`,
      title: '🔔 Tijaabada Ogeysiiska Model#1 (Test Alert)',
      body: `XAUUSD: $${marketState.currentPrice.toFixed(2)} | Bias: ${marketState.dailyBias} | Setup: ${marketState.activeSetup.direction}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'SETUP',
    });
  }, [marketState]);

  const dismissAlert = useCallback(() => {
    setLatestAlert(null);
  }, []);

  // Periodic polling interval
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      refreshNow();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoRefresh, intervalMs, refreshNow]);

  return {
    marketState,
    isRefreshing,
    autoRefresh,
    currentScenario: scenario,
    lastUpdated: marketState.lastUpdated,
    notificationsEnabled,
    notificationPermission,
    latestAlert,
    refreshNow,
    setAutoRefresh,
    setScenario,
    toggleNotifications,
    testNotification,
    dismissAlert,
  };
}
