import React, { useRef } from 'react';
import { Form } from 'react-bootstrap';

const DateInput = ({ dateFiltre, setDateFiltre }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.(); // pour navigateurs récents
      inputRef.current.focus(); // fallback
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '200px' }}>
      <Form.Control
        ref={inputRef}
        type="date"
        value={dateFiltre}
        onChange={(e) => setDateFiltre(e.target.value)}
        style={{ paddingRight: '40px' }}
      />
      <i
        className="fas fa-calendar-alt"
        onClick={handleIconClick}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#007bff',
          cursor: 'pointer',
        }}
      />
    </div>
  );
};

export default DateInput;
