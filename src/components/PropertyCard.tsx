import { Home, MapPin, TrendingUp, ChevronRight } from 'lucide-react';
import type { Property } from '../types';
import { useProjectsByProperty } from '../hooks/useSelectors';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const projects = useProjectsByProperty(property.id);
  const activeProjects = projects.filter((p) => p.status !== 'completed');
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const equity = property.estimatedValue - property.mortgageBalance;

  const typeLabels: Record<string, string> = {
    house: 'House',
    land: 'Land',
    'house-and-land': 'House & Land',
  };

  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: property.color }}
          >
            <Home size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-text text-sm">
              {property.name}
              {property.isCurrentHome && (
                <span className="ml-2 text-xs bg-primary-50 text-primary-dark px-2 py-0.5 rounded-full">
                  Home
                </span>
              )}
            </h3>
            <p className="text-xs text-text-muted">{typeLabels[property.type]}</p>
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-text-muted group-hover:text-primary transition-colors"
        />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-text-light mb-3">
        <MapPin size={12} />
        <span>{property.address}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-primary-50/50 rounded-lg p-2">
          <p className="text-xs text-text-muted">Value</p>
          <p className="text-sm font-semibold text-text">
            ${property.estimatedValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-primary-50/50 rounded-lg p-2">
          <div className="flex items-center gap-1">
            <TrendingUp size={10} className="text-primary" />
            <p className="text-xs text-text-muted">Equity</p>
          </div>
          <p className="text-sm font-semibold text-primary-dark">
            ${equity.toLocaleString()}
          </p>
        </div>
      </div>

      {property.monthlyPayment > 0 && (
        <p className="text-xs text-text-muted mb-3">
          ${property.monthlyPayment.toLocaleString()}/mo mortgage
        </p>
      )}

      <div className="flex items-center gap-2 text-xs">
        {activeProjects.length > 0 && (
          <span className="bg-accent/10 text-accent-dark px-2 py-1 rounded-full">
            {activeProjects.length} active
          </span>
        )}
        {completedProjects.length > 0 && (
          <span className="bg-stress-low/20 text-green-700 px-2 py-1 rounded-full">
            {completedProjects.length} done
          </span>
        )}
        {projects.length === 0 && (
          <span className="text-text-muted">No projects</span>
        )}
      </div>
    </div>
  );
}
