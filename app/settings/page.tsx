'use client';

import { useState } from 'react';
import { useSettings } from '../lib/contexts/SettingsContext';
import { storage } from '../lib/storage';
import { downloadFile } from '../lib/utils';
import Card, { CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, toggleTheme } = useSettings();
  const [showClearModal, setShowClearModal] = useState(false);
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    updateSettings(formData);
    alert('Settings saved successfully!');
  };

  const handleExport = () => {
    const data = storage.exportData();
    const json = JSON.stringify(data, null, 2);
    downloadFile(
      json,
      `tradetracker-backup-${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        storage.importData(data);
        alert('Data imported successfully! Reloading page...');
        window.location.reload();
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    storage.clearAll();
    alert('All data cleared! Reloading page...');
    window.location.reload();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Settings</h1>

      <div className="space-y-6 max-w-3xl">
        {/* Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Default Trade Settings</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <Select
              label="Default Asset Type"
              options={[
                { value: 'stock', label: 'Stock' },
                { value: 'option', label: 'Option' },
                { value: 'future', label: 'Future' },
                { value: 'crypto', label: 'Crypto' },
                { value: 'forex', label: 'Forex' },
              ]}
              value={formData.defaultAssetType}
              onChange={(e) =>
                setFormData({ ...formData, defaultAssetType: e.target.value as any })
              }
            />

            <Input
              label="Default Position Size"
              type="number"
              value={formData.defaultPositionSize}
              onChange={(e) =>
                setFormData({ ...formData, defaultPositionSize: parseInt(e.target.value) })
              }
            />

            <Input
              label="Default Risk Amount ($)"
              type="number"
              step="0.01"
              value={formData.defaultRiskAmount}
              onChange={(e) =>
                setFormData({ ...formData, defaultRiskAmount: parseFloat(e.target.value) })
              }
            />
          </div>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <Input
              label="Currency"
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            />

            <Select
              label="Date Format"
              options={[
                { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy' },
                { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' },
                { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' },
              ]}
              value={formData.dateFormat}
              onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
            />

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hideAmounts}
                  onChange={(e) => setFormData({ ...formData, hideAmounts: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hide dollar amounts (privacy mode)
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`px-4 py-2 rounded-lg border ${
                    settings.theme === 'light'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`px-4 py-2 rounded-lg border ${
                    settings.theme === 'dark'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Data
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Download all your data as a JSON backup file.
              </p>
              <Button variant="secondary" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2 inline" />
                Export Data
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Import Data
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Import data from a previously exported backup file.
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <span className="inline-flex items-center px-4 py-2 text-base rounded-lg font-medium transition-colors bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-loss-600 dark:text-loss-400 mb-2">
                Danger Zone
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Permanently delete all your data. This action cannot be undone.
              </p>
              <Button variant="danger" onClick={() => setShowClearModal(true)}>
                <Trash2 className="w-4 h-4 mr-2 inline" />
                Clear All Data
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Clear Data Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Data"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete all your data? This will permanently remove all trades,
          setups, portfolios, and settings. This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearAll}>
            Yes, Clear All Data
          </Button>
        </div>
      </Modal>
    </div>
  );
}
