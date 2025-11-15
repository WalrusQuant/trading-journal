'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTrades } from '../../lib/contexts/TradeContext';
import { usePortfolios } from '../../lib/contexts/PortfolioContext';
import { useSettings } from '../../lib/contexts/SettingsContext';
import { useTags } from '../../lib/contexts/TagContext';
import { formatCurrency, formatPercentage, formatDate, formatDateTime, getPnLColor, getStatusBadgeColor } from '../../lib/formatters';
import Card, { CardHeader, CardTitle } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import TextArea from '../../components/TextArea';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import { Edit, Trash2, Save, X } from 'lucide-react';
import { Trade, AssetType, TradeDirection, TradeStatus } from '../../lib/types';

export default function TradeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tradeId = params.id as string;

  const { trades, getTrade, updateTrade, deleteTrade } = useTrades();
  const { activePortfolio } = usePortfolios();
  const { settings } = useSettings();
  const { tags } = useTags();

  const [trade, setTrade] = useState<Trade | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const foundTrade = getTrade(tradeId);
    if (foundTrade) {
      setTrade(foundTrade);
      setFormData({
        ticker: foundTrade.ticker,
        assetType: foundTrade.assetType,
        direction: foundTrade.direction,
        entryDate: new Date(foundTrade.entryDate).toISOString().split('T')[0],
        entryPrice: foundTrade.entryPrice.toString(),
        exitDate: foundTrade.exitDate
          ? new Date(foundTrade.exitDate).toISOString().split('T')[0]
          : '',
        exitPrice: foundTrade.exitPrice?.toString() || '',
        quantity: foundTrade.quantity.toString(),
        fees: foundTrade.fees.toString(),
        confidence: foundTrade.confidence?.toString() || '3',
        notes: foundTrade.notes || '',
        status: foundTrade.status,
        selectedTags: foundTrade.tags,
      });
    }
  }, [tradeId, trades]);

  if (!trade || !formData) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Trade Not Found
        </h1>
        <Card>
          <p className="text-gray-600 dark:text-gray-400">
            The trade you are looking for does not exist.
          </p>
          <Button onClick={() => router.push('/trades')} className="mt-4">
            Back to Trades
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    updateTrade(trade.id, {
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
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteTrade(trade.id);
    router.push('/trades');
  };

  const handleTagToggle = (tagId: string) => {
    setFormData({
      ...formData,
      selectedTags: formData.selectedTags.includes(tagId)
        ? formData.selectedTags.filter((id: string) => id !== tagId)
        : [...formData.selectedTags, tagId],
    });
  };

  if (isEditing) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Edit Trade
        </h1>

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
                onChange={(e) =>
                  setFormData({ ...formData, ticker: e.target.value.toUpperCase() })
                }
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
                  />
                </>
              )}

              <Input
                label="Quantity *"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />

              <Input
                label="Fees / Commission"
                type="number"
                step="0.01"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              />

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
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2 inline" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2 inline" />
                Save Changes
              </Button>
            </div>
          </Card>
        </form>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {trade.ticker} Trade
        </h1>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2 inline" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2 inline" />
            Delete
          </Button>
        </div>
      </div>

      {/* Trade Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade Information</CardTitle>
            </CardHeader>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ticker</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {trade.ticker}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Asset Type</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1 capitalize">
                  {trade.assetType}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Direction</p>
                <p className="text-lg font-semibold mt-1 capitalize">
                  <span
                    className={
                      trade.direction === 'long'
                        ? 'text-profit-600 dark:text-profit-400'
                        : 'text-loss-600 dark:text-loss-400'
                    }
                  >
                    {trade.direction}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(trade.status)}`}>
                    {trade.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Entry Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {formatDate(trade.entryDate, settings.dateFormat)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Entry Price</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  ${trade.entryPrice.toFixed(2)}
                </p>
              </div>

              {trade.exitDate && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Exit Date</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      {formatDate(trade.exitDate, settings.dateFormat)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Exit Price</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      ${trade.exitPrice?.toFixed(2)}
                    </p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quantity</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {trade.quantity}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fees</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {activePortfolio &&
                    formatCurrency(trade.fees, activePortfolio.currency, settings.hideAmounts)}
                </p>
              </div>

              {trade.confidence && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {trade.confidence}/5
                  </p>
                </div>
              )}
            </div>

            {trade.tags.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {trade.tags.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tag.id}
                        className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {trade.notes && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notes</p>
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {trade.notes}
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {trade.status === 'closed' && trade.pnl !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">P&L</p>
                  <p className={`text-3xl font-bold mt-1 ${getPnLColor(trade.pnl)}`}>
                    {activePortfolio &&
                      formatCurrency(trade.pnl, activePortfolio.currency, settings.hideAmounts)}
                  </p>
                </div>

                {trade.pnlPercentage !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">P&L %</p>
                    <p className={`text-2xl font-bold mt-1 ${getPnLColor(trade.pnlPercentage)}`}>
                      {formatPercentage(trade.pnlPercentage)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Meta</CardTitle>
            </CardHeader>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Created</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">
                  {formatDateTime(trade.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">
                  {formatDateTime(trade.updatedAt)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Trade"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this trade? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Trade
          </Button>
        </div>
      </Modal>
    </div>
  );
}
