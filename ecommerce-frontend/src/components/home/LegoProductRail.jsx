import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SkeletonCard from './SkeletonCard';
import './LegoProductRail.css';

function LegoProductRail({
  title,
  subtitle,
  items,
  renderItem,
  ctaText,
  ctaHref,
  variant = '',
  id,
  gap = 16,
  perView = 4,
  skeletonCount = perView,
}) {
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const totalPages = items ? Math.ceil(items.length / perView) : 0;
  const itemWidth = `calc((100% - ${(perView - 1) * gap}px) / ${perView})`;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const handleScroll = () => {
      const pageWidth = el.clientWidth + gap;
      const page = Math.round(el.scrollLeft / pageWidth);
      setCurrent(page);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [items, perView, gap]);

  const scrollToPage = (p) => {
    const el = trackRef.current;
    if (!el) return;
    const page = Math.max(0, Math.min(p, totalPages - 1));
    const pageWidth = el.clientWidth + gap;
    el.scrollTo({ left: page * pageWidth, behavior: 'smooth' });
  };

  const onPrev = () => scrollToPage(current - 1);
  const onNext = () => scrollToPage(current + 1);

  const handleKey = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onPrev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToPage(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToPage(totalPages - 1);
    }
  };

  const [drag, setDrag] = useState({ active: false, startX: 0, scroll: 0 });
  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    setDrag({ active: true, startX: e.clientX, scroll: el.scrollLeft });
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.active) return;
    e.preventDefault();
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - drag.startX;
    el.scrollLeft = drag.scroll - dx;
  };
  const endDrag = (e) => {
    if (!drag.active) return;
    const el = trackRef.current;
    if (el) {
      const pageWidth = el.clientWidth + gap;
      const page = Math.round(el.scrollLeft / pageWidth);
      el.scrollTo({ left: page * pageWidth, behavior: 'smooth' });
    }
    setDrag({ active: false, startX: 0, scroll: 0 });
    trackRef.current?.releasePointerCapture?.(e.pointerId);
  };

  const LazyItem = ({ item, idx }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
      const el = ref.current;
      if (!el) return undefined;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        },
        { root: trackRef.current, rootMargin: '100px' }
      );
      obs.observe(el);
      return () => obs.disconnect();
    }, []);
    return (
      <div
        ref={ref}
        style={{ flex: `0 0 ${itemWidth}`, scrollSnapAlign: 'start' }}
      >
        {visible ? renderItem(item, idx) : null}
      </div>
    );
  };

  if (items && items.length === 0) {
    return (
      <section id={id} className={`mb-5 ${variant}`}>
        <div className="d-flex justify-content-between align-items-baseline mb-3">
          <div>
            <h2 className="h4 mb-0">{title}</h2>
            {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
          </div>
        </div>
        <div className="text-center">
          <p>No se pudieron cargar los productos.</p>
          <Link to="/products" className="btn btn-primary">
            Ver productos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className={`mb-5 ${variant}`}>
      <div className="d-flex justify-content-between align-items-baseline mb-3">
        <div>
          <h2 className="h4 mb-0">{title}</h2>
          {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
        </div>
        {ctaText && ctaHref && (
          <Link to={ctaHref} className="btn btn-sm btn-outline-primary">
            {ctaText}
          </Link>
        )}
      </div>
      <div className="position-relative lego-rail-container">
        <div
          ref={trackRef}
          className="lego-rail-track"
          style={{ '--rail-gap': `${gap}px` }}
          tabIndex={0}
          onKeyDown={handleKey}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {items
            ? items.map((item, idx) => (
                <LazyItem item={item} idx={idx} key={idx} />
              ))
            : Array.from({ length: skeletonCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: `0 0 ${itemWidth}`,
                    scrollSnapAlign: 'start',
                  }}
                >
                  <SkeletonCard />
                </div>
              ))}
        </div>
        {totalPages > 1 && (
          <>
            <button
              type="button"
              className="btn btn-light position-absolute top-50 start-0 translate-middle-y"
              onClick={onPrev}
              aria-label="Anterior"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              className="btn btn-light position-absolute top-50 end-0 translate-middle-y"
              onClick={onNext}
              aria-label="Siguiente"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </button>
          </>
        )}
      </div>
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-2 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm p-0 border-0 rounded-circle ${
                i === current ? 'bg-primary' : 'bg-secondary'
              }`}
              style={{ width: '8px', height: '8px' }}
              onClick={() => scrollToPage(i)}
              aria-label={`Ir a la página ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default LegoProductRail;
