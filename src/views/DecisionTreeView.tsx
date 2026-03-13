import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2, GitFork } from 'lucide-react';
import useStore from '../store/useStore';

export default function DecisionTreeView() {
  const scenarios = useStore((s) => s.scenarios);
  const projects = useStore((s) => s.projects);
  const properties = useStore((s) => s.properties);
  const addScenario = useStore((s) => s.addScenario);
  const deleteScenario = useStore((s) => s.deleteScenario);
  const setSelectedProjectId = useStore((s) => s.setSelectedProjectId);
  const setShowProjectModal = useStore((s) => s.setShowProjectModal);

  const [selectedScenario, setSelectedScenario] = useState<string | null>(
    scenarios.length > 0 ? scenarios[0].id : null
  );

  const scenario = scenarios.find((s) => s.id === selectedScenario);

  const handleAddScenario = () => {
    const id = addScenario({
      name: `Scenario ${scenarios.length + 1}`,
      description: 'New scenario - add steps to plan your path forward',
      steps: [],
    });
    setSelectedScenario(id);
  };

  const handleDeleteScenario = (id: string) => {
    deleteScenario(id);
    if (selectedScenario === id) {
      setSelectedScenario(scenarios.length > 1 ? scenarios[0].id : null);
    }
  };

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.data?.projectId) {
        setSelectedProjectId(node.data.projectId as string);
        setShowProjectModal(true);
      }
    },
    [setSelectedProjectId, setShowProjectModal]
  );

  // Build ReactFlow nodes/edges from scenario
  const { nodes, edges } = useMemo(() => {
    if (!scenario) return { nodes: [], edges: [] };

    const flowNodes: Node[] = [
      {
        id: 'start',
        type: 'default',
        position: { x: 250, y: 0 },
        data: {
          label: (
            <div className="text-center">
              <p className="font-bold text-sm text-primary-dark">{scenario.name}</p>
              <p className="text-xs text-text-muted mt-1">{scenario.description}</p>
            </div>
          ),
        },
        style: {
          background: '#F0F5F1',
          border: '2px solid #6B8F71',
          borderRadius: '12px',
          padding: '12px',
          width: 220,
        },
      },
    ];

    const flowEdges: Edge[] = [];

    scenario.steps
      .sort((a, b) => a.order - b.order)
      .forEach((step, i) => {
        const project = projects.find((p) => p.id === step.projectId);
        const property = project?.propertyId
          ? properties.find((p) => p.id === project.propertyId)
          : null;

        const nodeId = `step-${step.id}`;
        const statusColors: Record<string, { bg: string; border: string }> = {
          'not-started': { bg: '#F9FAFB', border: '#D1D5DB' },
          'in-progress': { bg: '#EFF6FF', border: '#60A5FA' },
          blocked: { bg: '#FEF2F2', border: '#E07A7A' },
          completed: { bg: '#F0FDF4', border: '#7ABF7E' },
        };
        const colors = project ? statusColors[project.status] : statusColors['not-started'];

        flowNodes.push({
          id: nodeId,
          type: 'default',
          position: { x: 250, y: 120 + i * 120 },
          data: {
            projectId: step.projectId,
            label: (
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-text-muted">Step {step.order}</span>
                  {project && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: colors.bg, color: colors.border }}
                    >
                      {project.status.replace('-', ' ')}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-sm text-text">
                  {project?.name || 'Unknown Project'}
                </p>
                {property && (
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: property.color }}
                    />
                    {property.name}
                  </p>
                )}
                {step.notes && (
                  <p className="text-xs text-text-light mt-1 italic">{step.notes}</p>
                )}
                {project && project.estimatedCost > 0 && (
                  <p className="text-xs text-accent-dark font-medium mt-1">
                    ${project.estimatedCost.toLocaleString()}
                  </p>
                )}
              </div>
            ),
          },
          style: {
            background: colors.bg,
            border: `2px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '12px',
            width: 220,
          },
        });

        const sourceId = i === 0 ? 'start' : `step-${scenario.steps.sort((a, b) => a.order - b.order)[i - 1].id}`;
        flowEdges.push({
          id: `edge-${i}`,
          source: sourceId,
          target: nodeId,
          animated: project?.status === 'in-progress',
          style: { stroke: '#9BB5A0', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#9BB5A0',
          },
        });
      });

    return { nodes: flowNodes, edges: flowEdges };
  }, [scenario, projects, properties]);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text">Decision Scenarios</h2>
        <button onClick={handleAddScenario} className="btn-secondary text-sm flex items-center gap-1.5">
          <Plus size={16} />
          New Scenario
        </button>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-20 flex-1 flex flex-col items-center justify-center">
          <GitFork size={48} className="text-text-muted mb-4" />
          <p className="text-lg font-medium text-text mb-2">No scenarios yet</p>
          <p className="text-sm text-text-light mb-6 max-w-md">
            Create decision scenarios to map out different approaches to your life projects.
            Each scenario lets you order projects into a sequence to visualize the path forward.
          </p>
          <button onClick={handleAddScenario} className="btn-primary">
            Create First Scenario
          </button>
        </div>
      ) : (
        <>
          {/* Scenario tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {scenarios.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap ${
                  selectedScenario === s.id
                    ? 'bg-primary text-white'
                    : 'bg-primary-50 text-text-light hover:bg-primary-100'
                }`}
              >
                <span onClick={() => setSelectedScenario(s.id)}>{s.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteScenario(s.id);
                  }}
                  className="hover:text-stress-high ml-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Flow canvas */}
          {scenario && (
            <div className="flex-1 bg-primary-50/30 rounded-xl border border-primary-50 min-h-[400px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={onNodeClick}
                fitView
                proOptions={{ hideAttribution: true }}
              >
                <Controls
                  style={{
                    background: '#fff',
                    border: '1px solid #DCE8DE',
                    borderRadius: '8px',
                  }}
                />
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  color="#B8D1BC"
                />
              </ReactFlow>
            </div>
          )}

          {/* Scenario summary */}
          {scenario && scenario.steps.length > 0 && (
            <div className="mt-4 card">
              <h3 className="text-sm font-semibold text-text mb-2">Scenario Summary</h3>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-text-muted">Steps: </span>
                  <span className="font-medium text-text">{scenario.steps.length}</span>
                </div>
                <div>
                  <span className="text-text-muted">Est. Total Cost: </span>
                  <span className="font-medium text-text">
                    $
                    {scenario.steps
                      .reduce((sum, step) => {
                        const proj = projects.find((p) => p.id === step.projectId);
                        return sum + (proj?.estimatedCost || 0);
                      }, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Completed: </span>
                  <span className="font-medium text-text">
                    {scenario.steps.filter((step) => {
                      const proj = projects.find((p) => p.id === step.projectId);
                      return proj?.status === 'completed';
                    }).length}
                    /{scenario.steps.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
