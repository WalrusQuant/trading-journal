'use client';

import { useState } from 'react';
import { usePortfolios } from '../lib/contexts/PortfolioContext';
import { useTrades } from '../lib/contexts/TradeContext';
import { useSettings } from '../lib/contexts/SettingsContext';
import { calculatePortfolioBalance, calculatePerformanceMetrics } from '../lib/calculations';
import { formatCurrency, getPnLColor } from '../lib/formatters';
import Card, { CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import { Portfolio } from '../lib/types';

export default function PortfoliosPage() {
  const {
    portfolios,
    activePortfolioId,
    setActivePortfolioId,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
  } = usePortfolios();
  const { trades } = useTrades();
  const { settings } = useSettings();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initialBalance: '10000',
    currency: 'USD',
  });

  const handleCreate = () => {
    if (!formData.name || !formData.initialBalance) {
      alert('Please fill in all required fields');
      return;
    }

    addPortfolio({
      name: formData.name,
      description: formData.description || undefined,
      initialBalance: parseFloat(formData.initialBalance),
      currency: formData.currency,
    });

    setFormData({
      name: '',
      description: '',
      initialBalance: '10000',
      currency: 'USD',
    });
    setShowCreateModal(false);
  };

  const handleEdit = (portfolio: Portfolio) => {
    setEditingId(portfolio.id);
    setFormData({
      name: portfolio.name,
      description: portfolio.description || '',
      initialBalance: portfolio.initialBalance.toString(),
      currency: portfolio.currency,
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;

    updatePortfolio(editingId, {
      name: formData.name,
      description: formData.description || undefined,
      initialBalance: parseFloat(formData.initialBalance),
      currency: formData.currency,
    });

    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      initialBalance: '10000',
      currency: 'USD',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this portfolio?')) {
      deletePortfolio(id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Portfolios</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2 inline" />
          New Portfolio
        </Button>
      </div>

      {/* Portfolios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => {
          const portfolioTrades = trades.filter((t) => t.portfolioId === portfolio.id);
          const metrics = calculatePerformanceMetrics(portfolioTrades);
          const deposits = portfolio.deposits.reduce((sum, d) => sum + d.amount, 0);
          const withdrawals = portfolio.withdrawals.reduce((sum, w) => sum + w.amount, 0);
          const currentBalance = calculatePortfolioBalance(
            portfolio.initialBalance,
            portfolioTrades,
            deposits,
            withdrawals
          );
          const isActive = portfolio.id === activePortfolioId;

          return (
            <Card key={portfolio.id} className={isActive ? 'ring-2 ring-primary-500' : ''}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {portfolio.name}
                  </h3>
                  {portfolio.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {portfolio.description}
                    </p>
                  )}
                </div>
                {isActive && (
                  <span className="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-medium rounded">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
                  <p className={`text-2xl font-bold mt-1 ${getPnLColor(metrics.totalPnL)}`}>
                    {formatCurrency(currentBalance, portfolio.currency, settings.hideAmounts)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
                    <p className={`text-lg font-semibold mt-1 ${getPnLColor(metrics.totalPnL)}`}>
                      {formatCurrency(metrics.totalPnL, portfolio.currency, settings.hideAmounts)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trades</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      {portfolioTrades.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isActive && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActivePortfolioId(portfolio.id)}
                    className="flex-1"
                  >
                    Set Active
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(portfolio)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {portfolios.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(portfolio.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || editingId !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingId(null);
          setFormData({
            name: '',
            description: '',
            initialBalance: '10000',
            currency: 'USD',
          });
        }}
        title={editingId ? 'Edit Portfolio' : 'Create Portfolio'}
      >
        <div className="space-y-4">
          <Input
            label="Portfolio Name *"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Trading Account"
            required
          />

          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description..."
            rows={3}
          />

          <Input
            label="Initial Balance *"
            type="number"
            step="0.01"
            value={formData.initialBalance}
            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
            required
          />

          <Input
            label="Currency *"
            type="text"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            placeholder="USD"
            required
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingId ? handleUpdate : handleCreate}>
              {editingId ? 'Update' : 'Create'} Portfolio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
