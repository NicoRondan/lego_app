import React from 'react';

const benefits = [
  { icon: 'fa-truck', text: 'Envíos a todo el país' },
  { icon: 'fa-credit-card', text: 'Cuotas sin interés' },
  { icon: 'fa-store', text: 'Retiro en tienda' },
  { icon: 'fa-undo', text: 'Devoluciones 30 días' },
];

function BenefitsBar() {
  return (
    <div className="d-flex justify-content-around py-3 bg-dark text-white flex-wrap">
      {benefits.map((b) => (
        <div key={b.text} className="text-center m-2">
          <i className={`fa ${b.icon} mb-1`} aria-hidden="true"></i>
          <span className="ms-2">{b.text}</span>
        </div>
      ))}
    </div>
  );
}

export default BenefitsBar;
