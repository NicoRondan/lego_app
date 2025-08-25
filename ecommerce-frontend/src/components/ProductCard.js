import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrickButton from "./lego/BrickButton";
import BrickBadge from "./lego/BrickBadge";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import QuantityStepper from "./QuantityStepper";
import { toast } from "react-toastify";
import "./ProductCard.css";

// Card component for displaying a product in a grid with minimalist design.
function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);
  const [showQty, setShowQty] = useState(false);
  const [qty, setQty] = useState(1);
  const { cart, addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const added = cart?.items?.some(
    (it) => it.product?.id === product.id || it.productId === product.id
  );

  const handleAddClick = () => {
    if (!user) {
      navigate("/login", { state: { redirectTo: location.pathname + location.search } });
      return;
    }
    setShowQty(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await addItem({ productId: product.id, quantity: qty });
      toast.success("Agregado");
      setShowQty(false);
      setQty(1);
    } catch (err) {
      // error toast handled in api
    } finally {
      setLoading(false);
    }
  };
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        product.reviews.length
      : null;
  const pieceCount = product.pieceCount || product.pieces;
  return (
    <div className="col-md-4 col-sm-6 mb-4" role="listitem">
      <div
        className="card h-100 brick-card position-relative"
        role="article"
        aria-label={product.name}
      >
        {product.isNew && (
          <BrickBadge
            color="lego-yellow"
            className="position-absolute top-0 start-0 m-2"
          >
            Nuevo
          </BrickBadge>
        )}
        {product.isOnSale && (
          <BrickBadge
            color="lego-red"
            className="position-absolute top-0 end-0 m-2"
          >
            Oferta
          </BrickBadge>
        )}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="card-img-top"
            style={{ objectFit: "cover", height: "180px" }}
          />
        ) : (
          <div
            className="card-img-top bg-secondary"
            style={{ height: "180px" }}
          ></div>
        )}
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text flex-grow-1">
            {product.description?.substring(0, 80)}
            {product.description && product.description.length > 80 ? "…" : ""}
          </p>
          <div className="product-meta">
            {avgRating && (
              <span>
                <span role="img" aria-label="rating">
                  ⭐
                </span>
                {avgRating.toFixed(1)}
              </span>
            )}
            {pieceCount && (
              <span>
                <span role="img" aria-label="pieces">
                  🧱
                </span>
                {pieceCount}
              </span>
            )}
          </div>
          <p className="card-text fw-bold">
            ${parseFloat(product.price).toFixed(2)}
          </p>
          <div className="mt-auto position-relative">
            <BrickButton
              className="w-100 mb-2"
              color={added ? "green" : "yellow"}
              onClick={handleAddClick}
              disabled={added}
            >
              {added ? "✔ Añadido" : "Añadir al carrito"}
            </BrickButton>
            {showQty && (
              <div
                className="position-absolute start-50 translate-middle-x bg-white border rounded p-3 shadow"
                style={{ zIndex: 10 }}
              >
                <QuantityStepper value={qty} onChange={setQty} min={1} max={product.stock} />
                <div className="d-flex mt-2">
                  <button
                    className="btn btn-primary me-2 flex-fill"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? "Añadiendo…" : "Confirmar"}
                  </button>
                  <button
                    className="btn btn-outline-secondary flex-fill"
                    onClick={() => setShowQty(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            <Link
              to={`/products/${product.id}`}
              className="text-decoration-none"
            >
              <BrickButton className="w-100">Ver</BrickButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
