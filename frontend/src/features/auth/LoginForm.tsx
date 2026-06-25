import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Icon } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

interface LocationState {
  from?: { pathname: string };
}

export function LoginForm() {
  const { login, error, status, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const submitting = status === 'loading';
  const emailInvalid = touched && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const passwordInvalid = touched && password.length < 6;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (emailInvalid || passwordInvalid || !email || !password) return;
    try {
      await login({ email, password });
      const target = (location.state as LocationState)?.from?.pathname ?? ROUTES.dashboard;
      navigate(target, { replace: true });
    } catch {
      // error surfaced via store state
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <header className="login-form__header">
        <span className="login-form__logo">
          <Icon name="IconBuildings" size={24} weight="fill" color="#fff" />
        </span>
        <h1 className="login-form__title">
          Дом<span className="login-form__title-accent">Диспетчер</span>
        </h1>
        <p className="login-form__subtitle">Войдите в систему управления заявками</p>
      </header>

      {error && (
        <Message
          severity="error"
          text={error}
          className="login-form__error"
          onClick={clearError}
        />
      )}

      <div className="login-form__field">
        <label htmlFor="email">Электронная почта</label>
        <InputText
          id="email"
          type="email"
          value={email}
          autoComplete="email"
          placeholder="you@example.com"
          className={emailInvalid ? 'p-invalid' : ''}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailInvalid && <small className="login-form__hint">Введите корректный email</small>}
      </div>

      <div className="login-form__field">
        <label htmlFor="password">Пароль</label>
        <InputText
          id="password"
          type="password"
          value={password}
          autoComplete="current-password"
          placeholder="••••••••"
          className={passwordInvalid ? 'p-invalid' : ''}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordInvalid && <small className="login-form__hint">Минимум 6 символов</small>}
      </div>

      <Button
        type="submit"
        label="Войти"
        icon="pi pi-sign-in"
        loading={submitting}
        className="login-form__submit"
      />

    </form>
  );
}
