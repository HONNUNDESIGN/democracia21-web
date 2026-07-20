// Form de inscripción D21 (DESIGN.md §7) — isla React aislada, sin GSAP ni
// dependencias nuevas. Envía a PUBLIC_FORM_ENDPOINT (Web3Forms style) o entra
// en modo DEMO (console.info + éxito simulado) si no está definido, siguiendo
// el mismo patrón que form/src/pages/index.astro.
import { useId, useRef, useState } from 'react';

type Status = 'idle' | 'enviando' | 'exito' | 'error';

interface FormValues {
  nombre: string;
  email: string;
}

interface FieldErrors {
  nombre?: string;
  email?: string;
}

const FORM_ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT ?? '';
const FORM_ACCESS_KEY = import.meta.env.PUBLIC_FORM_ACCESS_KEY ?? '';
const JOIN_URL = import.meta.env.PUBLIC_JOIN_URL || 'https://democracia21-form.pages.dev/';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function validar(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.nombre.trim()) {
    errors.nombre = 'Escribe tu nombre.';
  } else if (values.nombre.trim().length < 2) {
    errors.nombre = 'El nombre es demasiado corto.';
  }

  if (!values.email.trim()) {
    errors.email = 'Escribe tu email.';
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Introduce un email válido.';
  }

  return errors;
}

export default function JoinForm() {
  const [values, setValues] = useState<FormValues>({ nombre: '', email: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [privacidad, setPrivacidad] = useState(false);
  const [comunicaciones, setComunicaciones] = useState(false);
  const [privacidadError, setPrivacidadError] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const privacidadRef = useRef<HTMLInputElement>(null);
  const groupId = useId();

  const enviando = status === 'enviando';

  const handleChange =
    (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValues((v) => ({ ...v, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handlePrivacidad = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivacidad(e.target.checked);
    if (e.target.checked) setPrivacidadError(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando) return;

    setStatusMsg('');
    const fieldErrors = validar(values);
    setErrors(fieldErrors);

    const faltaPrivacidad = !privacidad;
    setPrivacidadError(faltaPrivacidad);

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    if (faltaPrivacidad) {
      setStatusMsg('Necesitas aceptar la política de privacidad para continuar.');
      privacidadRef.current?.focus();
      return;
    }

    const payload = {
      nombre: values.nombre.trim(),
      email: values.email.trim(),
      acepta_privacidad: 'sí',
      acepta_comunicaciones: comunicaciones ? 'sí' : 'no',
      subject: 'Nueva inscripción · Democracia21',
    };

    setStatus('enviando');

    try {
      if (FORM_ENDPOINT) {
        const body: Record<string, string> = { ...payload };
        if (FORM_ACCESS_KEY) body.access_key = FORM_ACCESS_KEY;

        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        console.info('[Democracia21] MODO DEMO — inscripción (no enviada):', payload);
        await wait(600);
      }
      setStatus('exito');
    } catch (err) {
      console.error('[Democracia21] Error al enviar la inscripción:', err);
      setStatus('error');
      setStatusMsg('No hemos podido enviar tu inscripción. Inténtalo de nuevo en un momento.');
    }
  };

  if (status === 'exito') {
    return (
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-lime p-8 text-center text-ink">
        <h3 className="display text-3xl md:text-4xl">Hecho. Eres oficialmente muy 21.</h3>
        <p className="mt-3 text-base text-ink/70 md:text-lg">
          Te escribimos pronto. Sin spam: eso es muy siglo XX.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <form
        className="rounded-3xl bg-lime p-8 text-left text-ink"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`nombre-${groupId}`} className="text-sm font-semibold text-ink/80">
              Nombre
            </label>
            <input
              id={`nombre-${groupId}`}
              name="nombre"
              type="text"
              required
              autoComplete="name"
              maxLength={80}
              value={values.nombre}
              onChange={handleChange('nombre')}
              aria-invalid={Boolean(errors.nombre)}
              aria-describedby={errors.nombre ? `nombre-error-${groupId}` : undefined}
              className={[
                'rounded-xl border-2 bg-paper px-4 py-3 text-base text-ink outline-none transition-colors',
                'placeholder:text-ink/40 focus:border-ink',
                errors.nombre ? 'border-red-600' : 'border-transparent',
              ].join(' ')}
              placeholder="Tu nombre"
            />
            {errors.nombre && (
              <p id={`nombre-error-${groupId}`} role="alert" className="text-sm font-semibold text-red-700">
                {errors.nombre}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`email-${groupId}`} className="text-sm font-semibold text-ink/80">
              Email
            </label>
            <input
              id={`email-${groupId}`}
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={120}
              value={values.email}
              onChange={handleChange('email')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `email-error-${groupId}` : undefined}
              className={[
                'rounded-xl border-2 bg-paper px-4 py-3 text-base text-ink outline-none transition-colors',
                'placeholder:text-ink/40 focus:border-ink',
                errors.email ? 'border-red-600' : 'border-transparent',
              ].join(' ')}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p id={`email-error-${groupId}`} role="alert" className="text-sm font-semibold text-red-700">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <label
            htmlFor={`privacidad-${groupId}`}
            className="flex cursor-pointer items-start gap-2.5 text-[0.82rem] leading-snug text-ink/80"
          >
            <input
              ref={privacidadRef}
              id={`privacidad-${groupId}`}
              type="checkbox"
              required
              checked={privacidad}
              onChange={handlePrivacidad}
              aria-invalid={privacidadError}
              aria-describedby={privacidadError ? `privacidad-error-${groupId}` : undefined}
              className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 rounded border-2 border-ink/40 bg-paper accent-ink"
            />
            <span>
              He leído y acepto la política de privacidad.
              <span className="text-red-700"> *</span>
            </span>
          </label>
          {privacidadError && (
            <p id={`privacidad-error-${groupId}`} role="alert" className="-mt-2 text-sm font-semibold text-red-700">
              Necesitas aceptar la política de privacidad para continuar.
            </p>
          )}

          <label
            htmlFor={`comunicaciones-${groupId}`}
            className="flex cursor-pointer items-start gap-2.5 text-[0.82rem] leading-snug text-ink/80"
          >
            <input
              id={`comunicaciones-${groupId}`}
              type="checkbox"
              checked={comunicaciones}
              onChange={(e) => setComunicaciones(e.target.checked)}
              className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 rounded border-2 border-ink/40 bg-paper accent-ink"
            />
            <span>
              Quiero recibir novedades de democracia²¹.
              <span className="text-ink/50"> (opcional)</span>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={enviando || (privacidadError && !privacidad)}
          className="mt-6 w-full rounded-xl bg-ink px-5 py-4 text-base font-bold uppercase tracking-[0.06em] text-lime transition-transform duration-200 ease-out hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? 'Enviando…' : 'Apúntame a la otra política'}
        </button>

        <p role="alert" aria-live="polite" className="mt-3 min-h-[1.2em] text-center text-sm font-semibold text-red-700">
          {status === 'error' ? statusMsg : ''}
        </p>
      </form>

      <p className="mt-4 text-center text-sm text-paper/60">
        ¿Prefieres el formulario clásico? Está{' '}
        <a
          href={JOIN_URL}
          target="_blank"
          rel="noopener"
          className="font-semibold text-paper/80 underline underline-offset-2 hover:text-paper"
        >
          aquí
        </a>
        .
      </p>
    </div>
  );
}
