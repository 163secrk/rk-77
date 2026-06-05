import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Lobby from '../pages/Lobby';
import Room from '../pages/Room';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Lobby />,
      },
      {
        path: 'room/:roomId',
        element: <Room />,
      },
    ],
  },
]);
