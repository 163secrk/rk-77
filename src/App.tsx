import { Outlet } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';

export default function App() {
  useSocket();

  return <Outlet />;
}
