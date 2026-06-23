import { BrowserRouter } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { AppBootstrap } from '@/app/AppBootstrap';
import { AppRouter } from '@/app/router';

export default function App() {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <BrowserRouter>
        <AppBootstrap>
          <AppRouter />
        </AppBootstrap>
      </BrowserRouter>
    </PrimeReactProvider>
  );
}
