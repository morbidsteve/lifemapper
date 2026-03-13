import { Plus } from 'lucide-react';
import useStore from '../store/useStore';
import PropertyCard from '../components/PropertyCard';
import type { ProjectStatus } from '../types';

const COLUMNS: { status: ProjectStatus; label: string; color: string }[] = [
  { status: 'not-started', label: 'Not Started', color: 'border-gray-300' },
  { status: 'in-progress', label: 'In Progress', color: 'border-blue-400' },
  { status: 'blocked', label: 'Blocked', color: 'border-stress-high' },
  { status: 'completed', label: 'Completed', color: 'border-stress-low' },
];

export default function BoardView() {
  const projects = useStore((s) => s.projects);
  const properties = useStore((s) => s.properties);
  const people = useStore((s) => s.people);
  const setSelectedProjectId = useStore((s) => s.setSelectedProjectId);
  const setShowProjectModal = useStore((s) => s.setShowProjectModal);
  const setShowAddPropertyModal = useStore((s) => s.setShowAddPropertyModal);
  const updateProjectStatus = useStore((s) => s.updateProjectStatus);

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('text/plain', projectId);
  };

  const handleDrop = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain');
    if (projectId) {
      updateProjectStatus(projectId, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const openProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowProjectModal(true);
  };

  const getPropertyForProject = (propertyId: string | null) => {
    if (!propertyId) return null;
    return properties.find((p) => p.id === propertyId) ?? null;
  };

  const getAssigneeNames = (assigneeIds: string[]) => {
    return assigneeIds
      .map((id) => people.find((p) => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const priorityDot: Record<string, string> = {
    low: 'bg-stress-low',
    medium: 'bg-stress-medium',
    high: 'bg-stress-high',
    critical: 'bg-red-600',
  };

  const isEmpty = properties.length === 0 && projects.length === 0;

  return (
    <div className="p-4 md:p-6">
      {/* Properties section */}
      {properties.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text">Properties</h2>
            <button
              onClick={() => setShowAddPropertyModal(true)}
              className="btn-secondary text-sm flex items-center gap-1.5"
            >
              <Plus size={16} />
              Add Property
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text">Project Board</h2>
        <span className="text-sm text-text-muted">{projects.length} projects</span>
      </div>

      {isEmpty ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">&#127793;</div>
          <h2 className="text-xl font-bold text-text mb-2">Welcome to LifeMapper</h2>
          <p className="text-text-light mb-6 max-w-md mx-auto">
            Your personal life planning tool. Start by loading sample data to see how it
            works, or add your first property.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => useStore.getState().loadSampleData()}
              className="btn-primary"
            >
              Load Sample Data
            </button>
            <button
              onClick={() => setShowAddPropertyModal(true)}
              className="btn-secondary"
            >
              Add First Property
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map(({ status, label, color }) => {
            const columnProjects = projects.filter((p) => p.status === status);
            return (
              <div
                key={status}
                className={`bg-primary-50/30 rounded-xl p-3 border-t-2 ${color} min-h-[200px]`}
                onDrop={(e) => handleDrop(e, status)}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text">{label}</h3>
                  <span className="text-xs text-text-muted bg-white px-2 py-0.5 rounded-full">
                    {columnProjects.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {columnProjects.map((project) => {
                    const prop = getPropertyForProject(project.propertyId);
                    const completedTasks = project.tasks.filter((t) => t.completed).length;
                    return (
                      <div
                        key={project.id}
                        className="bg-surface rounded-lg p-3 shadow-sm border border-primary-50 cursor-pointer hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={(e) => handleDragStart(e, project.id)}
                        onClick={() => openProject(project.id)}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityDot[project.priority]}`}
                          />
                          <span className="text-sm font-medium text-text leading-tight">
                            {project.name}
                          </span>
                        </div>

                        {prop && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: prop.color }}
                            />
                            <span className="text-xs text-text-muted">{prop.name}</span>
                          </div>
                        )}

                        {!prop && project.category && (
                          <span className="text-xs text-text-muted capitalize mb-2 block">
                            {project.category}
                          </span>
                        )}

                        {project.tasks.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-1 bg-primary-50 rounded-full">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${(completedTasks / project.tasks.length) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-text-muted">
                              {completedTasks}/{project.tasks.length}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          {project.assignees.length > 0 && (
                            <span className="text-xs text-text-muted truncate">
                              {getAssigneeNames(project.assignees)}
                            </span>
                          )}
                          {project.estimatedCost > 0 && (
                            <span className="text-xs text-accent-dark font-medium">
                              ${project.estimatedCost.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
