import { Routes, Route, Navigate } from 'react-router-dom';
import PhotoCover from '@/components/pages/PhotoCover';
import ChapterReader from '@/components/reader/ChapterReader';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PhotoCover />} />
      <Route path="/read" element={<Navigate to="/read/1" replace />} />
      <Route path="/read/:ch" element={<ChapterReader />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
