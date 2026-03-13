import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ProjectModal from './ProjectModal';
import AddPropertyModal from './AddPropertyModal';
import BoardView from '../views/BoardView';
import TimelineView from '../views/TimelineView';
import DashboardView from '../views/DashboardView';
import DecisionTreeView from '../views/DecisionTreeView';
import useStore from '../store/useStore';

export default function Layout() {
  const currentView = useStore((s) => s.currentView);

  const renderView = () => {
    switch (currentView) {
      case 'board':
        return <BoardView />;
      case 'timeline':
        return <TimelineView />;
      case 'dashboard':
        return <DashboardView />;
      case 'decisions':
        return <DecisionTreeView />;
      default:
        return <BoardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{renderView()}</main>
      </div>

      {/* Modals */}
      <ProjectModal />
      <AddPropertyModal />
    </div>
  );
}
