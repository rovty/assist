import { useState } from 'preact/hooks';
import { setContactInfo } from '../store';

export function PreChatForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      setContactInfo({ name: name.trim(), email: email.trim() });
    }
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

  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '15px', fontWeight: 600 }}>Before we start</div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          Please share your details so we can assist you better.
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Name</label>
          <input
            type="text"
            value={name}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
            required
            placeholder="Your name"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Email</label>
          <input
            type="email"
            value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            required
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: '8px',
            background: '#6366f1',
            color: '#fff',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Start Chat
        </button>
      </form>
    </div>
  );
}
