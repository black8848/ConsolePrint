import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IssueListPage } from './pages/IssueListPage';
import { IssueDetailPage } from './pages/IssueDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IssueListPage />} />
        <Route path="/issue/:id" element={<IssueDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
