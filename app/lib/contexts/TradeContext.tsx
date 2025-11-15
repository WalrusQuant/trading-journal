'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trade } from '../types';
import { storage } from '../storage';
import { calculateTradePnL, calculatePnLPercentage } from '../calculations';

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  getTrade: (id: string) => Trade | undefined;
  getTradesByPortfolio: (portfolioId: string) => Trade[];
  refreshTrades: () => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTrades(storage.getTrades());
  }, []);

  const addTrade = (tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const trade: Trade = {
      ...tradeData,
      id: `trade-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    // Auto-calculate P&L if trade is closed
    if (trade.status === 'closed' && trade.exitPrice) {
      trade.pnl = calculateTradePnL(
        trade.entryPrice,
        trade.exitPrice,
        trade.quantity,
        trade.direction,
        trade.fees
      );
      trade.pnlPercentage = calculatePnLPercentage(
        trade.entryPrice,
        trade.exitPrice,
        trade.direction
      );
    }

    storage.addTrade(trade);
    setTrades(storage.getTrades());
  };

  const updateTrade = (id: string, updates: Partial<Trade>) => {
    // Auto-calculate P&L if relevant fields are updated
    if (updates.exitPrice !== undefined || updates.status === 'closed') {
      const trade = trades.find(t => t.id === id);
      if (trade && updates.exitPrice) {
        updates.pnl = calculateTradePnL(
          updates.entryPrice ?? trade.entryPrice,
          updates.exitPrice,
          updates.quantity ?? trade.quantity,
          updates.direction ?? trade.direction,
          updates.fees ?? trade.fees
        );
        updates.pnlPercentage = calculatePnLPercentage(
          updates.entryPrice ?? trade.entryPrice,
          updates.exitPrice,
          updates.direction ?? trade.direction
        );
      }
    }

    storage.updateTrade(id, updates);
    setTrades(storage.getTrades());
  };

  const deleteTrade = (id: string) => {
    storage.deleteTrade(id);
    setTrades(storage.getTrades());
  };

  const getTrade = (id: string) => {
    return trades.find(t => t.id === id);
  };

  const getTradesByPortfolio = (portfolioId: string) => {
    return trades.filter(t => t.portfolioId === portfolioId);
  };

  const refreshTrades = () => {
    setTrades(storage.getTrades());
  };

  if (!isClient) {
    return null;
  }

  return (
    <TradeContext.Provider
      value={{
        trades,
        addTrade,
        updateTrade,
        deleteTrade,
        getTrade,
        getTradesByPortfolio,
        refreshTrades,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrades must be used within a TradeProvider');
  }
  return context;
}
