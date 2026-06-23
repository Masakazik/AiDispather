import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <div className="app-center-screen not-found">
      <h1 className="not-found__code">404</h1>
      <p className="not-found__text">Страница не найдена</p>
      <Link to={ROUTES.dashboard}>
        <Button label="На главную" icon="pi pi-home" />
      </Link>
    </div>
  );
}
