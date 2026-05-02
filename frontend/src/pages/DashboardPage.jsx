import { useState } from 'react';
import Header from '../components/Header';
import DocumentPanel from '../components/DocumentPanel';
import ChatPanel from '../components/ChatPanel';

export default function DashboardPage({ darkMode, toggleTheme }) {
  const [activeDocId, setActiveDocId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header darkMode={darkMode} toggleTheme={toggleTheme} showNav={false} />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          marginTop: '64px',
          overflow: 'hidden',
        }}
      >
        {/* Left Panel — Documents (30%) */}
        <div
          style={{
            width: '30%',
            minWidth: '280px',
            maxWidth: '380px',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <DocumentPanel
            onDocumentSelect={setActiveDocId}
            activeDocId={activeDocId}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Right Panel — Chat (70%) */}
        <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <ChatPanel sessionId={activeDocId || 'default'} />
        </div>
      </div>
    </div>
  );
}
