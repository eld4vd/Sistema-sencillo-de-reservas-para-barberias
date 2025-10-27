import './App.css'
import { BrowserRouter } from 'react-router-dom';
import MyRoutes from './routes/routes';
import { AuthProvider } from './context/AuthProvider';
import { NotificationsProvider } from './context/NotificationsProvider';

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <MyRoutes />
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  )
}

export default App