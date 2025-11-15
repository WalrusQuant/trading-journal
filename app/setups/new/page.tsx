'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSetups } from '../../lib/contexts/SetupContext';
import { usePortfolios } from '../../lib/contexts/PortfolioContext';
import { useSettings } from '../../lib/contexts/SettingsContext';
import { calculateRiskRewardRatio } from '../../lib/calculations';
import Card, { CardHeader, CardTitle } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import TextArea from '../../components/TextArea';
import { AssetType, TradeDirection } from '../../lib/types';

export default function NewSetupPage() {
  const router = useRouter();
  const { addSetup } = useSetups();
  const { activePortfolio } = usePortfolios();
  const { settings } = useSettings();

  const [formData, setFormData] = useState({
    ticker: '',
    assetType: settings.defaultAssetType as AssetType,
    direction: 'long' as TradeDirection,
    entryPrice: '',
    stopLoss: '',
    targetPrice: '',
    positionSize: settings.defaultPositionSize.toString(),
    notes: '',
  });

  const riskRewardRatio =
    formData.entryPrice && formData.stopLoss && formData.targetPrice
      ? calculateRiskRewardRatio(
          parseFloat(formData.entryPrice),
          parseFloat(formData.stopLoss),
          parseFloat(formData.targetPrice),
          formData.direction
        )
      : 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!activePortfolio) {
      alert('Please select a portfolio first');
      return;
    }

    if (
      !formData.ticker ||
      !formData.entryPrice ||
      !formData.stopLoss ||
      !formData.targetPrice ||
      !formData.positionSize
    ) {
      alert('Please fill in all required fields');
      return;
    }

    addSetup({
      portfolioId: activePortfolio.id,
      ticker: formData.ticker.toUpperCase(),
      assetType: formData.assetType,
      direction: formData.direction,
      entryPrice: parseFloat(formData.entryPrice),
      stopLoss: parseFloat(formData.stopLoss),
      targetPrice: parseFloat(formData.targetPrice),
      positionSize: parseInt(formData.positionSize),
      notes: formData.notes || undefined,
      status: 'active',
    });

    router.push('/setups');
  };

  if (!activePortfolio) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          New Trade Setup
        </h1>
        <Card>
          <p className="text-gray-600 dark:text-gray-400">
            Please create or select a portfolio first.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        New Trade Setup
      </h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Setup Details</CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Ticker / Symbol *"
              type="text"
              value={formData.ticker}
              onChange={(e) =>
                setFormData({ ...formData, ticker: e.target.value.toUpperCase() })
              }
              placeholder="AAPL, BTCUSD, etc."
              required
            />

            <Select
              label="Asset Type *"
              options={[
                { value: 'stock', label: 'Stock' },
                { value: 'option', label: 'Option' },
                { value: 'future', label: 'Future' },
                { value: 'crypto', label: 'Crypto' },
                { value: 'forex', label: 'Forex' },
              ]}
              value={formData.assetType}
              onChange={(e) =>
                setFormData({ ...formData, assetType: e.target.value as AssetType })
              }
              required
            />

            <Select
              label="Direction *"
              options={[
                { value: 'long', label: 'Long' },
                { value: 'short', label: 'Short' },
              ]}
              value={formData.direction}
              onChange={(e) =>
                setFormData({ ...formData, direction: e.target.value as TradeDirection })
              }
              required
            />

            <Input
              label="Position Size *"
              type="number"
              value={formData.positionSize}
              onChange={(e) => setFormData({ ...formData, positionSize: e.target.value })}
              placeholder="100"
              required
            />

            <Input
              label="Entry Price *"
              type="number"
              step="0.01"
              value={formData.entryPrice}
              onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
              placeholder="0.00"
              required
            />

            <Input
              label="Stop Loss *"
              type="number"
              step="0.01"
              value={formData.stopLoss}
              onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
              placeholder="0.00"
              required
            />

            <Input
              label="Target Price *"
              type="number"
              step="0.01"
              value={formData.targetPrice}
              onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
              placeholder="0.00"
              required
            />

            <div className="flex items-end">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk/Reward Ratio
                </p>
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    1:{riskRewardRatio > 0 ? riskRewardRatio.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <TextArea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add setup notes, strategy, or reasoning..."
              rows={4}
            />
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">Create Setup</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
