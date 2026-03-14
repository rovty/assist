import { useState } from 'preact/hooks';
import type { AssistConfig } from '../types';

interface OfflineFormProps {
  config: AssistConfig;
}

export function OfflineForm({ config }: OfflineFormProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: Event) {
    e.preventDefault();
    // TODO: post to API
    setSubmitted(true);
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
        <div style={{ fontSize: '15px', fontWeight: 600 }}>Message sent!</div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          We'll get back to you as soon as we're online.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '15px', fontWeight: 600 }}>We're currently offline</div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          Leave a message and we'll reply as soon as possible.
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          value={form.name}
          onInput={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })}
          required
          placeholder="Your name"
          style={inputStyle}
        />
        <input
          type="email"
          value={form.email}
          onInput={(e) => setForm({ ...form, email: (e.target as HTMLInputElement).value })}
          required
          placeholder="Email address"
          style={inputStyle}
        />
        <textarea
          value={form.message}
          onInput={(e) => setForm({ ...form, message: (e.target as HTMLTextAreaElement).value })}
          required
          placeholder="Your message…"
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: '8px',
            background: config.theme?.primaryColor ?? '#6366f1',
            color: '#fff',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
