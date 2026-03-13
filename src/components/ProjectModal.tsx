import { X, CheckCircle2, Circle, AlertTriangle, Clock } from 'lucide-react';
import useStore from '../store/useStore';

export default function ProjectModal() {
  const selectedProjectId = useStore((s) => s.selectedProjectId);
  const projects = useStore((s) => s.projects);
  const properties = useStore((s) => s.properties);
  const people = useStore((s) => s.people);
  const setSelectedProjectId = useStore((s) => s.setSelectedProjectId);
  const setShowProjectModal = useStore((s) => s.setShowProjectModal);
  const showProjectModal = useStore((s) => s.showProjectModal);
  const toggleTask = useStore((s) => s.toggleTask);
  const updateProjectStatus = useStore((s) => s.updateProjectStatus);

  const project = projects.find((p) => p.id === selectedProjectId);
  if (!showProjectModal || !project) return null;

  const property = properties.find((p) => p.id === project.propertyId);
  const assignees = people.filter((p) => project.assignees.includes(p.id));
  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const taskProgress = project.tasks.length > 0 ? Math.round((completedTasks / project.tasks.length) * 100) : 0;

  const statusColors: Record<string, string> = {
    'not-started': 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-blue-50 text-blue-600',
    blocked: 'bg-red-50 text-stress-high',
    completed: 'bg-green-50 text-green-600',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-stress-low/20 text-green-700',
    medium: 'bg-stress-medium/20 text-amber-700',
    high: 'bg-stress-high/20 text-red-600',
    critical: 'bg-red-100 text-red-700',
  };

  const stressColor =
    project.stressWeight > 7 ? 'text-stress-high' : project.stressWeight > 4 ? 'text-stress-medium' : 'text-stress-low';

  const close = () => {
    setShowProjectModal(false);
    setSelectedProjectId(null);
  };

  return (
    <>
      <div className="modal-backdrop" onClick={close} />
      <div className="modal-content w-full max-w-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-text">{project.name}</h2>
            {property && (
              <p className="text-sm text-text-light flex items-center gap-1.5 mt-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: property.color }}
                />
                {property.name}
              </p>
            )}
          </div>
          <button onClick={close} className="p-1 hover:bg-primary-50 rounded">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <p className="text-sm text-text-light mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[project.status]}`}>
            {project.status.replace('-', ' ')}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColors[project.priority]}`}>
            {project.priority} priority
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-dark font-medium">
            {project.category}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stressColor}`}>
            <AlertTriangle size={10} className="inline mr-1" />
            Stress: {project.stressWeight}/10
          </span>
        </div>

        {/* Quick status change */}
        <div className="flex gap-2 mb-4">
          {(['not-started', 'in-progress', 'blocked', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => updateProjectStatus(project.id, status)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                project.status === status
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary-100 hover:border-primary-300 text-text-light'
              }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Financial info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-primary-50/50 rounded-lg p-3">
            <p className="text-xs text-text-muted">Estimated Cost</p>
            <p className="text-sm font-semibold text-text">
              ${project.estimatedCost.toLocaleString()}
            </p>
          </div>
          <div className="bg-primary-50/50 rounded-lg p-3">
            <p className="text-xs text-text-muted">Spent So Far</p>
            <p className="text-sm font-semibold text-text">
              ${project.actualCost.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Dates */}
        {(project.startDate || project.targetDate) && (
          <div className="flex items-center gap-4 mb-4 text-xs text-text-light">
            <Clock size={14} />
            {project.startDate && <span>Started: {project.startDate}</span>}
            {project.targetDate && <span>Target: {project.targetDate}</span>}
          </div>
        )}

        {/* Tasks */}
        {project.tasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text">
                Tasks ({completedTasks}/{project.tasks.length})
              </h3>
              <span className="text-xs text-text-muted">{taskProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-primary-50 rounded-full mb-3">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
            <ul className="space-y-1.5 max-h-40 overflow-y-auto">
              {project.tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-primary-50/50 rounded-md px-2 py-1"
                  onClick={() => toggleTask(project.id, task.id)}
                >
                  {task.completed ? (
                    <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
                  ) : (
                    <Circle size={16} className="text-text-muted flex-shrink-0" />
                  )}
                  <span className={task.completed ? 'line-through text-text-muted' : 'text-text'}>
                    {task.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assignees */}
        {assignees.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text mb-2">Assignees</h3>
            <div className="flex flex-wrap gap-2">
              {assignees.map((person) => (
                <span
                  key={person.id}
                  className="text-xs bg-primary-50 text-primary-dark px-3 py-1 rounded-full"
                >
                  {person.name} ({person.role})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {project.notes && (
          <div className="bg-accent/5 rounded-lg p-3 text-sm text-text-light border border-accent/20">
            <p className="text-xs font-medium text-accent-dark mb-1">Notes</p>
            {project.notes}
          </div>
        )}
      </div>
    </>
  );
}
