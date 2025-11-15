'use client';

import { useState } from 'react';
import { useTags } from '../lib/contexts/TagContext';
import Card, { CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Tag as TagIcon } from 'lucide-react';
import { TagCategory } from '../lib/types';

export default function TagsPage() {
  const { tags, addTag, updateTag, deleteTag } = useTags();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    category: 'strategy' as TagCategory,
  });

  const handleCreate = () => {
    if (!formData.name) {
      alert('Please enter a tag name');
      return;
    }

    addTag(formData);

    setFormData({
      name: '',
      color: '#3b82f6',
      category: 'strategy',
    });
    setShowCreateModal(false);
  };

  const handleEdit = (tag: any) => {
    setEditingId(tag.id);
    setFormData({
      name: tag.name,
      color: tag.color,
      category: tag.category,
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;

    updateTag(editingId, formData);

    setEditingId(null);
    setFormData({
      name: '',
      color: '#3b82f6',
      category: 'strategy',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      deleteTag(id);
    }
  };

  const groupedTags = {
    strategy: tags.filter((t) => t.category === 'strategy'),
    setup: tags.filter((t) => t.category === 'setup'),
    condition: tags.filter((t) => t.category === 'condition'),
    mistake: tags.filter((t) => t.category === 'mistake'),
    other: tags.filter((t) => t.category === 'other'),
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tags</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2 inline" />
          New Tag
        </Button>
      </div>

      {/* Tags by Category */}
      <div className="space-y-6">
        {Object.entries(groupedTags).map(([category, categoryTags]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category} Tags</CardTitle>
            </CardHeader>

            {categoryTags.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No {category} tags yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {categoryTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                  >
                    <span
                      className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                    <button
                      onClick={() => handleEdit(tag)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || editingId !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingId(null);
          setFormData({
            name: '',
            color: '#3b82f6',
            category: 'strategy',
          });
        }}
        title={editingId ? 'Edit Tag' : 'Create Tag'}
      >
        <div className="space-y-4">
          <Input
            label="Tag Name *"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Momentum, Breakout, etc."
            required
          />

          <Select
            label="Category *"
            options={[
              { value: 'strategy', label: 'Strategy' },
              { value: 'setup', label: 'Setup' },
              { value: 'condition', label: 'Condition' },
              { value: 'mistake', label: 'Mistake' },
              { value: 'other', label: 'Other' },
            ]}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as TagCategory })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color *
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-20 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{formData.color}</span>
              <span
                className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: formData.color }}
              >
                Preview
              </span>
            </div>
          </div>

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
              {editingId ? 'Update' : 'Create'} Tag
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
