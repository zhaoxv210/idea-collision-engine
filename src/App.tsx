import { useState } from 'react';
import { CanvasPage } from '@/pages/CanvasPage';
import { SettingsPage } from '@/components/SettingsPage';

type View = 'canvas' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('canvas');

  if (view === 'settings') {
    return <SettingsPage onBack={() => setView('canvas')} />;
  }

  return <CanvasPage onSettings={() => setView('settings')} />;
}
