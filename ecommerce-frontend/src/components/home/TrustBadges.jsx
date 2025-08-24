import React from 'react';

const badges = [
  { src: '/assets/home/badge-mp.svg', alt: 'Mercado Pago' },
  { src: '/assets/home/badge-ssl.svg', alt: 'Sitio seguro SSL' },
  { src: '/assets/home/badge-support.svg', alt: 'Soporte en línea' },
];

function TrustBadges() {
  return (
    <div className="d-flex justify-content-center gap-4 py-4">
      {badges.map((b) => (
        <img key={b.alt} src={b.src} alt={b.alt} width="60" height="60" />
      ))}
    </div>
  );
}

export default TrustBadges;
