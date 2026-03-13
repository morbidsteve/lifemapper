import { useState } from 'react';
import { X } from 'lucide-react';
import type { PropertyType } from '../types';
import useStore from '../store/useStore';

const COLORS = ['#6B8F71', '#D4A843', '#7AAFBF', '#BF7A9E', '#7A8FBF', '#BFA07A', '#9E7ABF'];

export default function AddPropertyModal() {
  const showAddPropertyModal = useStore((s) => s.showAddPropertyModal);
  const setShowAddPropertyModal = useStore((s) => s.setShowAddPropertyModal);
  const addProperty = useStore((s) => s.addProperty);

  const [name, setName] = useState('');
  const [type, setType] = useState<PropertyType>('house');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [isCurrentHome, setIsCurrentHome] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState('');
  const [mortgageBalance, setMortgageBalance] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  if (!showAddPropertyModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProperty({
      name: name.trim(),
      type,
      address: address.trim(),
      description: description.trim(),
      isCurrentHome,
      estimatedValue: Number(estimatedValue) || 0,
      mortgageBalance: Number(mortgageBalance) || 0,
      monthlyPayment: Number(monthlyPayment) || 0,
      notes: '',
      color,
    });

    setName('');
    setType('house');
    setAddress('');
    setDescription('');
    setIsCurrentHome(false);
    setEstimatedValue('');
    setMortgageBalance('');
    setMonthlyPayment('');
    setColor(COLORS[0]);
    setShowAddPropertyModal(false);
  };

  const close = () => setShowAddPropertyModal(false);

  return (
    <>
      <div className="modal-backdrop" onClick={close} />
      <div className="modal-content w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">Add Property</h2>
          <button onClick={close} className="p-1 hover:bg-primary-50 rounded">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main House"
              className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PropertyType)}
              className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
            >
              <option value="house">House</option>
              <option value="land">Land</option>
              <option value="house-and-land">House & Land</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
              className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text mb-1">Est. Value</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">Mortgage</label>
              <input
                type="number"
                value={mortgageBalance}
                onChange={(e) => setMortgageBalance(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">Monthly</label>
              <input
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrentHome"
              checked={isCurrentHome}
              onChange={(e) => setIsCurrentHome(e.target.checked)}
              className="rounded border-primary-200 text-primary focus:ring-primary"
            />
            <label htmlFor="isCurrentHome" className="text-sm text-text">
              This is my current home
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-text scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={close} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Add Property
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
