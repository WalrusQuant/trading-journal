'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSetups } from '../../lib/contexts/SetupContext';
import { useTrades } from '../../lib/contexts/TradeContext';
import { usePortfolios } from '../../lib/contexts/PortfolioContext';
import { formatDate, formatDateTime, getStatusBadgeColor } from '../../lib/formatters';
import { useSettings } from '../../lib/contexts/SettingsContext';
import Card, { CardHeader, CardTitle } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import TextArea from '../../components/TextArea';
import Modal from '../../components/Modal';
import { Edit, Trash2, Save, X, TrendingUp } from 'lucide-react';
import { TradeSetup, AssetType, TradeDirection } from '../../lib/types';

export default function SetupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const setupId = params.id as string;

  const { setups, getSetup, updateSetup, deleteSetup } = useSetups();
  const { addTrade } = useTrades();
  const { activePortfolio } = usePortfolios();
  const { settings } = useSettings();

  const [setup, setSetup] = useState<TradeSetup | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [convertData, setConvertData] = useState({
    entryPrice: '',
    entryDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const foundSetup = getSetup(setupId);
    if (foundSetup) {
      setSetup(foundSetup);
      setFormData({
        ticker: foundSetup.ticker,
        assetType: foundSetup.assetType,
        direction: foundSetup.direction,
        entryPrice: foundSetup.entryPrice.toString(),
        stopLoss: foundSetup.stopLoss.toString(),
        targetPrice: foundSetup.targetPrice.toString(),
        positionSize: foundSetup.positionSize.toString(),
        notes: foundSetup.notes || '',
      });
      setConvertData({
        entryPrice: foundSetup.entryPrice.toString(),
        entryDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [setupId, setups]);

  if (!setup || !formData) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Setup Not Found
        </h1>
        <Card>
          <p className="text-gray-600 dark:text-gray-400">
            The setup you are looking for does not exist.
          </p>
          <Button onClick={() => router.push('/setups')} className="mt-4">
            Back to Setups
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    updateSetup(setup.id, {
      ticker: formData.ticker.toUpperCase(),
      assetType: formData.assetType,
      direction: formData.direction,
      entryPrice: parseFloat(formData.entryPrice),
      stopLoss: parseFloat(formData.stopLoss),
      targetPrice: parseFloat(formData.targetPrice),
      positionSize: parseInt(formData.positionSize),
      notes: formData.notes || undefined,
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteSetup(setup.id);
    router.push('/setups');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this setup?')) {
      updateSetup(setup.id, { status: 'cancelled' });
      router.push('/setups');
    }
  };

  const handleConvert = () => {
    if (!activePortfolio) return;

    // Create trade from setup
    addTrade({
      portfolioId: activePortfolio.id,
      ticker: setup.ticker,
      assetType: setup.assetType,
      direction: setup.direction,
      entryDate: new Date(convertData.entryDate).toISOString(),
      entryPrice: parseFloat(convertData.entryPrice),
      quantity: setup.positionSize,
      fees: 0,
      status: 'open',
      tags: [],
      notes: setup.notes
        ? `Converted from setup.\n\nOriginal Setup Notes:\n${setup.notes}`
        : 'Converted from setup',
    });

    // Mark setup as converted
    updateSetup(setup.id, { status: 'converted', convertedTradeId: `trade-${Date.now()}` });

    setShowConvertModal(false);
    router.push('/trades');
  };

  if (isEditing) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Edit Setup
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

              <Input
                label="Stop Loss *"
                type="number"
                step="0.01"
                value={formData.stopLoss}
                onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                required
              />

              <Input
                label="Target Price *"
                type="number"
                step="0.01"
                value={formData.targetPrice}
                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                required
              />
            </div>

            <div className="mt-6">
              <TextArea
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
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
          {setup.ticker} Setup
        </h1>
        <div className="flex space-x-3">
          {setup.status === 'active' && (
            <>
              <Button onClick={() => setShowConvertModal(true)}>
                <TrendingUp className="w-4 h-4 mr-2 inline" />
                Convert to Trade
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2 inline" />
                Edit
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel Setup
              </Button>
            </>
          )}
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2 inline" />
            Delete
          </Button>
        </div>
      </div>

      {/* Setup Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Setup Information</CardTitle>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(setup.status)}`}>
                  {setup.status}
                </span>
              </div>
            </CardHeader>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ticker</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {setup.ticker}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Asset Type</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1 capitalize">
                  {setup.assetType}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Direction</p>
                <p className="text-lg font-semibold mt-1 capitalize">
                  <span
                    className={
                      setup.direction === 'long'
                        ? 'text-profit-600 dark:text-profit-400'
                        : 'text-loss-600 dark:text-loss-400'
                    }
                  >
                    {setup.direction}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Position Size</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {setup.positionSize}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Entry Price</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  ${setup.entryPrice.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stop Loss</p>
                <p className="text-lg font-semibold text-loss-600 dark:text-loss-400 mt-1">
                  ${setup.stopLoss.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Target Price</p>
                <p className="text-lg font-semibold text-profit-600 dark:text-profit-400 mt-1">
                  ${setup.targetPrice.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Risk/Reward Ratio</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  1:{setup.riskRewardRatio.toFixed(2)}
                </p>
              </div>
            </div>

            {setup.notes && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notes</p>
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {setup.notes}
                </p>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Meta</CardTitle>
            </CardHeader>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Created</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">
                  {formatDateTime(setup.createdAt)}
                </p>
              </div>

              {setup.convertedTradeId && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Converted to Trade</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">
                    Yes
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Convert to Trade Modal */}
      <Modal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        title="Convert Setup to Trade"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Convert this setup into an active trade. You can adjust the entry price and date.
          </p>

          <Input
            label="Entry Date"
            type="date"
            value={convertData.entryDate}
            onChange={(e) => setConvertData({ ...convertData, entryDate: e.target.value })}
          />

          <Input
            label="Entry Price"
            type="number"
            step="0.01"
            value={convertData.entryPrice}
            onChange={(e) => setConvertData({ ...convertData, entryPrice: e.target.value })}
          />

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Setup Details
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Ticker:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                  {setup.ticker}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Direction:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {setup.direction}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Size:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                  {setup.positionSize}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Stop Loss:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                  ${setup.stopLoss.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="secondary" onClick={() => setShowConvertModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvert}>
              <TrendingUp className="w-4 h-4 mr-2 inline" />
              Convert to Trade
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Setup"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this setup? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Setup
          </Button>
        </div>
      </Modal>
    </div>
  );
}
