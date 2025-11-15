'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TradeSetup } from '../types';
import { storage } from '../storage';
import { calculateRiskRewardRatio } from '../calculations';

interface SetupContextType {
  setups: TradeSetup[];
  addSetup: (setup: Omit<TradeSetup, 'id' | 'createdAt' | 'riskRewardRatio'>) => void;
  updateSetup: (id: string, updates: Partial<TradeSetup>) => void;
  deleteSetup: (id: string) => void;
  getSetup: (id: string) => TradeSetup | undefined;
  getSetupsByPortfolio: (portfolioId: string) => TradeSetup[];
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [setups, setSetups] = useState<TradeSetup[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSetups(storage.getSetups());
  }, []);

  const addSetup = (setupData: Omit<TradeSetup, 'id' | 'createdAt' | 'riskRewardRatio'>) => {
    const setup: TradeSetup = {
      ...setupData,
      id: `setup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      riskRewardRatio: calculateRiskRewardRatio(
        setupData.entryPrice,
        setupData.stopLoss,
        setupData.targetPrice,
        setupData.direction
      ),
    };

    storage.addSetup(setup);
    setSetups(storage.getSetups());
  };

  const updateSetup = (id: string, updates: Partial<TradeSetup>) => {
    // Recalculate risk/reward if relevant fields are updated
    const setup = setups.find(s => s.id === id);
    if (setup && (updates.entryPrice !== undefined || updates.stopLoss !== undefined || updates.targetPrice !== undefined)) {
      updates.riskRewardRatio = calculateRiskRewardRatio(
        updates.entryPrice ?? setup.entryPrice,
        updates.stopLoss ?? setup.stopLoss,
        updates.targetPrice ?? setup.targetPrice,
        updates.direction ?? setup.direction
      );
    }

    storage.updateSetup(id, updates);
    setSetups(storage.getSetups());
  };

  const deleteSetup = (id: string) => {
    storage.deleteSetup(id);
    setSetups(storage.getSetups());
  };

  const getSetup = (id: string) => {
    return setups.find(s => s.id === id);
  };

  const getSetupsByPortfolio = (portfolioId: string) => {
    return setups.filter(s => s.portfolioId === portfolioId);
  };

  if (!isClient) {
    return null;
  }

  return (
    <SetupContext.Provider
      value={{
        setups,
        addSetup,
        updateSetup,
        deleteSetup,
        getSetup,
        getSetupsByPortfolio,
      }}
    >
      {children}
    </SetupContext.Provider>
  );
}

export function useSetups() {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error('useSetups must be used within a SetupProvider');
  }
  return context;
}
