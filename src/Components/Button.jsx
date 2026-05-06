import { useRef } from 'react';
import './Button.css';

function Button({ text, onClick, className = '' }) {
  const btnRef = useRef(null);

  const handleClick = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple-span';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
    onClick?.();
  };

  return (
    <button
      ref={btnRef}
      className={`app-button ${className}`}
      onClick={handleClick}
    >
      {text}
    </button>
  );
}

export default Button;
