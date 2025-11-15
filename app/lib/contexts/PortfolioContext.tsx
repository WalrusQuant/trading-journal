'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Portfolio, Transaction } from '../types';
import { storage } from '../storage';

interface PortfolioContextType {
  portfolios: Portfolio[];
  activePortfolioId: string | null;
  activePortfolio: Portfolio | null;
  setActivePortfolioId: (id: string) => void;
  addPortfolio: (portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'currentBalance' | 'deposits' | 'withdrawals'>) => void;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  getPortfolio: (id: string) => Portfolio | undefined;
  addDeposit: (portfolioId: string, amount: number, note?: string) => void;
  addWithdrawal: (portfolioId: string, amount: number, note?: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioIdState] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    let loadedPortfolios = storage.getPortfolios();

    // Initialize with default portfolio if none exist
    if (loadedPortfolios.length === 0) {
      const defaultPortfolio: Portfolio = {
        id: `portfolio-${Date.now()}`,
        name: 'Main Portfolio',
        description: 'My primary trading portfolio',
        initialBalance: 10000,
        currentBalance: 10000,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        deposits: [],
        withdrawals: [],
      };
      storage.addPortfolio(defaultPortfolio);
      loadedPortfolios = [defaultPortfolio];
    }

    setPortfolios(loadedPortfolios);

    const savedActiveId = storage.getActivePortfolioId();
    if (savedActiveId && loadedPortfolios.find(p => p.id === savedActiveId)) {
      setActivePortfolioIdState(savedActiveId);
    } else {
      setActivePortfolioIdState(loadedPortfolios[0].id);
      storage.setActivePortfolioId(loadedPortfolios[0].id);
    }
  }, []);

  const setActivePortfolioId = (id: string) => {
    setActivePortfolioIdState(id);
    storage.setActivePortfolioId(id);
  };

  const addPortfolio = (portfolioData: Omit<Portfolio, 'id' | 'createdAt' | 'currentBalance' | 'deposits' | 'withdrawals'>) => {
    const portfolio: Portfolio = {
      ...portfolioData,
      id: `portfolio-${Date.now()}`,
      createdAt: new Date().toISOString(),
      currentBalance: portfolioData.initialBalance,
      deposits: [],
      withdrawals: [],
    };

    storage.addPortfolio(portfolio);
    setPortfolios(storage.getPortfolios());
  };

  const updatePortfolio = (id: string, updates: Partial<Portfolio>) => {
    storage.updatePortfolio(id, updates);
    setPortfolios(storage.getPortfolios());
  };

  const deletePortfolio = (id: string) => {
    storage.deletePortfolio(id);
    const updated = storage.getPortfolios();
    setPortfolios(updated);

    if (activePortfolioId === id && updated.length > 0) {
      setActivePortfolioId(updated[0].id);
    }
  };

  const getPortfolio = (id: string) => {
    return portfolios.find(p => p.id === id);
  };

  const addDeposit = (portfolioId: string, amount: number, note?: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (portfolio) {
      const transaction: Transaction = {
        id: `deposit-${Date.now()}`,
        amount,
        date: new Date().toISOString(),
        note,
      };

      const deposits = [...portfolio.deposits, transaction];
      updatePortfolio(portfolioId, { deposits });
    }
  };

  const addWithdrawal = (portfolioId: string, amount: number, note?: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (portfolio) {
      const transaction: Transaction = {
        id: `withdrawal-${Date.now()}`,
        amount,
        date: new Date().toISOString(),
        note,
      };

      const withdrawals = [...portfolio.withdrawals, transaction];
      updatePortfolio(portfolioId, { withdrawals });
    }
  };

  const activePortfolio = activePortfolioId ? getPortfolio(activePortfolioId) || null : null;

  if (!isClient) {
    return null;
  }

  return (
    <PortfolioContext.Provider
      value={{
        portfolios,
        activePortfolioId,
        activePortfolio,
        setActivePortfolioId,
        addPortfolio,
        updatePortfolio,
        deletePortfolio,
        getPortfolio,
        addDeposit,
        addWithdrawal,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolios() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolios must be used within a PortfolioProvider');
  }
  return context;
}
