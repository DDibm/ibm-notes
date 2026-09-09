import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Theme } from '@carbon/react';
import { ProjectsProvider } from './context/ProjectsContext';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import ProjectsHome from './pages/ProjectsHome';
import NoteViewer from './pages/NoteViewer';
import NewProject from './pages/NewProject';
import './styles/index.scss';

function App() {
  return (
    <Theme theme="g10">
      <BrowserRouter>
        <ProjectsProvider>
          <AppHeader />
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<ProjectsHome />} />
                <Route path="/project/:id" element={<NoteViewer />} />
                <Route path="/new" element={<NewProject />} />
              </Routes>
            </main>
          </div>
        </ProjectsProvider>
      </BrowserRouter>
    </Theme>
  );
}

export default App;
