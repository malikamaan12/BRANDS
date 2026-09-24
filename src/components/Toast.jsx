import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="dynamic-island-toast">
      <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
      <span>{message}</span>
    </div>
  );
}
