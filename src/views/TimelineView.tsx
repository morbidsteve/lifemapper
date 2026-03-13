import { format, parseISO, isAfter, isBefore, addMonths } from 'date-fns';
import { CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react';
import useStore from '../store/useStore';

const MONTHS_TO_SHOW = 8;

export default function TimelineView() {
  const projects = useStore((s) => s.projects);
  const properties = useStore((s) => s.properties);
  const setSelectedProjectId = useStore((s) => s.setSelectedProjectId);
  const setShowProjectModal = useStore((s) => s.setShowProjectModal);

  const now = new Date();
  const months = Array.from({ length: MONTHS_TO_SHOW }, (_, i) => addMonths(now, i - 1));

  // Only include projects with dates
  const timedProjects = projects.filter((p) => p.startDate || p.targetDate);
  const untimedProjects = projects.filter((p) => !p.startDate && !p.targetDate);

  const openProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowProjectModal(true);
  };

  const getProperty = (propertyId: string | null) =>
    propertyId ? properties.find((p) => p.id === propertyId) : null;

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 size={14} className="text-stress-low" />;
    if (status === 'blocked') return <AlertTriangle size={14} className="text-stress-high" />;
    return <CalendarDays size={14} className="text-primary" />;
  };

  const getBarPosition = (project: typeof timedProjects[0]) => {
    const timelineStart = months[0];
    const timelineEnd = months[months.length - 1];
    const totalMs = timelineEnd.getTime() - timelineStart.getTime();

    const start = project.startDate ? parseISO(project.startDate) : now;
    const end = project.targetDate ? parseISO(project.targetDate) : addMonths(start, 2);

    const clampedStart = isBefore(start, timelineStart) ? timelineStart : start;
    const clampedEnd = isAfter(end, timelineEnd) ? timelineEnd : end;

    const leftPct = ((clampedStart.getTime() - timelineStart.getTime()) / totalMs) * 100;
    const widthPct = ((clampedEnd.getTime() - clampedStart.getTime()) / totalMs) * 100;

    return {
      left: `${Math.max(0, leftPct)}%`,
      width: `${Math.max(2, widthPct)}%`,
    };
  };

  const statusColor: Record<string, string> = {
    'not-started': 'bg-gray-300',
    'in-progress': 'bg-primary',
    blocked: 'bg-stress-high',
    completed: 'bg-stress-low',
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-lg font-bold text-text mb-6">Timeline</h2>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-text-light">
          <CalendarDays size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="text-lg font-medium mb-2">No projects yet</p>
          <p className="text-sm">Add projects with dates to see them on the timeline.</p>
        </div>
      ) : (
        <>
          {/* Timeline grid */}
          <div className="card overflow-x-auto mb-6">
            {/* Month headers */}
            <div className="flex border-b border-primary-50 mb-4 min-w-[700px]">
              {months.map((month, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center text-xs font-medium py-2 ${
                    month.getMonth() === now.getMonth() && month.getFullYear() === now.getFullYear()
                      ? 'text-primary font-bold'
                      : 'text-text-muted'
                  }`}
                >
                  {format(month, 'MMM yyyy')}
                </div>
              ))}
            </div>

            {/* Project bars */}
            <div className="space-y-3 min-w-[700px]">
              {timedProjects.map((project) => {
                const prop = getProperty(project.propertyId);
                const pos = getBarPosition(project);

                return (
                  <div
                    key={project.id}
                    className="relative h-10 cursor-pointer group"
                    onClick={() => openProject(project.id)}
                  >
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex">
                      {months.map((_, i) => (
                        <div key={i} className="flex-1 border-r border-primary-50/50 last:border-r-0" />
                      ))}
                    </div>

                    {/* Bar */}
                    <div
                      className={`absolute top-1 h-8 rounded-md ${statusColor[project.status]} opacity-80 group-hover:opacity-100 transition-opacity flex items-center px-2 overflow-hidden`}
                      style={{ left: pos.left, width: pos.width }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {prop && (
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: prop.color }}
                          />
                        )}
                        <span className="text-xs text-white font-medium truncate">
                          {project.name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Today marker */}
            <div className="relative min-w-[700px] h-0">
              <div
                className="absolute top-0 w-px bg-accent h-full pointer-events-none"
                style={{
                  left: `${((now.getTime() - months[0].getTime()) / (months[months.length - 1].getTime() - months[0].getTime())) * 100}%`,
                  height: `${timedProjects.length * 40 + 48}px`,
                  top: `-${timedProjects.length * 40 + 48}px`,
                }}
              />
            </div>
          </div>

          {/* Untimed projects */}
          {untimedProjects.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-light mb-3">
                Unscheduled ({untimedProjects.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {untimedProjects.map((project) => {
                  const prop = getProperty(project.propertyId);
                  return (
                    <div
                      key={project.id}
                      className="card flex items-center gap-3 cursor-pointer hover:shadow-md"
                      onClick={() => openProject(project.id)}
                    >
                      {statusIcon(project.status)}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{project.name}</p>
                        {prop && (
                          <p className="text-xs text-text-muted flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full inline-block"
                              style={{ backgroundColor: prop.color }}
                            />
                            {prop.name}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
