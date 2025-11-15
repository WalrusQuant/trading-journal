'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTrades } from '../../lib/contexts/TradeContext';
import { usePortfolios } from '../../lib/contexts/PortfolioContext';
import { useSettings } from '../../lib/contexts/SettingsContext';
import { useTags } from '../../lib/contexts/TagContext';
import Card, { CardHeader, CardTitle } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import TextArea from '../../components/TextArea';
import { AssetType, TradeDirection, TradeStatus } from '../../lib/types';

export default function NewTradePage() {
  const router = useRouter();
  const { addTrade } = useTrades();
  const { activePortfolio } = usePortfolios();
  const { settings } = useSettings();
  const { tags } = useTags();

  const [formData, setFormData] = useState({
    ticker: '',
    assetType: settings.defaultAssetType as AssetType,
    direction: 'long' as TradeDirection,
    entryDate: new Date().toISOString().split('T')[0],
    entryPrice: '',
    exitDate: '',
    exitPrice: '',
    quantity: settings.defaultPositionSize.toString(),
    fees: '0',
    confidence: '3',
    notes: '',
    status: 'open' as TradeStatus,
    selectedTags: [] as string[],
    // Asset-specific fields
    tickValue: '',
    tickSize: '',
    multiplier: '100',
    pipValue: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!activePortfolio) {
      alert('Please select a portfolio first');
      return;
    }

    if (!formData.ticker || !formData.entryPrice || !formData.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    addTrade({
      portfolioId: activePortfolio.id,
      ticker: formData.ticker.toUpperCase(),
      assetType: formData.assetType,
      direction: formData.direction,
      entryDate: new Date(formData.entryDate).toISOString(),
      entryPrice: parseFloat(formData.entryPrice),
      exitDate: formData.exitDate ? new Date(formData.exitDate).toISOString() : undefined,
      exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : undefined,
      quantity: parseInt(formData.quantity),
      fees: parseFloat(formData.fees),
      confidence: parseInt(formData.confidence),
      notes: formData.notes || undefined,
      status: formData.status,
      tags: formData.selectedTags,
      // Asset-specific fields
      tickValue: formData.tickValue ? parseFloat(formData.tickValue) : undefined,
      tickSize: formData.tickSize ? parseFloat(formData.tickSize) : undefined,
      multiplier: formData.multiplier ? parseFloat(formData.multiplier) : undefined,
      pipValue: formData.pipValue ? parseFloat(formData.pipValue) : undefined,
    });

    router.push('/trades');
  };

  const handleTagToggle = (tagId: string) => {
    setFormData({
      ...formData,
      selectedTags: formData.selectedTags.includes(tagId)
        ? formData.selectedTags.filter(id => id !== tagId)
        : [...formData.selectedTags, tagId],
    });
  };

  if (!activePortfolio) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          New Trade
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">New Trade</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Trade Details</CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Ticker / Symbol *"
              type="text"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
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

            <Select
              label="Status *"
              options={[
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Closed' },
              ]}
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as TradeStatus })
              }
              required
            />

            <Input
              label="Entry Date *"
              type="date"
              value={formData.entryDate}
              onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
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

            {formData.status === 'closed' && (
              <>
                <Input
                  label="Exit Date"
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                />

                <Input
                  label="Exit Price"
                  type="number"
                  step="0.01"
                  value={formData.exitPrice}
                  onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                  placeholder="0.00"
                />
              </>
            )}

            <Input
              label="Quantity *"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="100"
              required
            />

            <Input
              label="Fees / Commission"
              type="number"
              step="0.01"
              value={formData.fees}
              onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              placeholder="0.00"
            />

            {/* Asset-specific fields */}
            {formData.assetType === 'future' && (
              <>
                <Input
                  label="Tick Value ($) *"
                  type="number"
                  step="0.01"
                  value={formData.tickValue}
                  onChange={(e) => setFormData({ ...formData, tickValue: e.target.value })}
                  placeholder="12.50 (ES: $12.50 per tick)"
                />
                <Input
                  label="Tick Size *"
                  type="number"
                  step="0.001"
                  value={formData.tickSize}
                  onChange={(e) => setFormData({ ...formData, tickSize: e.target.value })}
                  placeholder="0.25 (ES: 0.25 points)"
                />
              </>
            )}

            {formData.assetType === 'option' && (
              <Input
                label="Contract Multiplier"
                type="number"
                value={formData.multiplier}
                onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
                placeholder="100 (standard)"
              />
            )}

            {formData.assetType === 'forex' && (
              <Input
                label="Pip Value ($)"
                type="number"
                step="0.01"
                value={formData.pipValue}
                onChange={(e) => setFormData({ ...formData, pipValue: e.target.value })}
                placeholder="10 (standard lot)"
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confidence Level
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.confidence}
                  onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8">
                  {formData.confidence}/5
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <TextArea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add trade notes, reasoning, or observations..."
              rows={4}
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.selectedTags.includes(tag.id)
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={
                    formData.selectedTags.includes(tag.id)
                      ? { backgroundColor: tag.color }
                      : {}
                  }
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Trade
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
