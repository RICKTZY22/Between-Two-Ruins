import { Routes, Route, Navigate } from 'react-router-dom';
import CoverPage from '@/components/pages/CoverPage';
import ChapterReader from '@/components/reader/ChapterReader';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CoverPage />} />
      <Route path="/read" element={<Navigate to="/read/1" replace />} />
      <Route path="/read/:ch" element={<ChapterReader />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
