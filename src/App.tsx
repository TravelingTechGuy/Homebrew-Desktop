import React from 'react';
import { BrewProvider, useBrew } from './context/BrewContext';
import { WindowFrame } from './components/swiftui/WindowFrame';
import { Sidebar } from './components/swiftui/Sidebar';
import { DetailInspector } from './components/swiftui/DetailInspector';
import { TerminalDrawer } from './components/terminal/TerminalDrawer';
import { AIAdvisorModal } from './components/views/AIAdvisorModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { PackagesView } from './components/views/PackagesView';
import { DiscoverView } from './components/views/DiscoverView';
import { TapsView } from './components/views/TapsView';
import { ServicesView } from './components/views/ServicesView';
import { DoctorView } from './components/views/DoctorView';
import { BrewfileView } from './components/views/BrewfileView';
import { ElectronAppView } from './components/views/ElectronAppView';

const MainLayout: React.FC = () => {
  const { activeTab, selectedPackage, setSelectedPackage } = useBrew();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'installed':
        return <PackagesView />;
      case 'discover':
        return <DiscoverView />;
      case 'taps':
        return <TapsView />;
      case 'services':
        return <ServicesView />;
      case 'doctor':
        return <DoctorView />;
      case 'brewfile':
        return <BrewfileView />;
      case 'electron':
        return <ElectronAppView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <WindowFrame>
      <div className="flex-1 flex overflow-hidden relative">
        {/* NavigationSplitView Sidebar */}
        <Sidebar />

        {/* Center Content View Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {renderActiveView()}
        </main>

        {/* Detail Inspector Pane */}
        {selectedPackage && (
          <DetailInspector
            packageItem={selectedPackage}
            onClose={() => setSelectedPackage(null)}
          />
        )}
      </div>

      {/* Terminal Drawer */}
      <TerminalDrawer />

      {/* AI Package Advisor Modal */}
      <AIAdvisorModal />
    </WindowFrame>
  );
};

export default function App() {
  return (
    <BrewProvider>
      <MainLayout />
    </BrewProvider>
  );
}
