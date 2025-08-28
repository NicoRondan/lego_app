import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrickButton from "./lego/BrickButton";
import BrickBadge from "./lego/BrickBadge";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import QuantityStepper from "./QuantityStepper";
import { toast } from "react-toastify";
import "./ProductCard.css";
import * as api from "../services/api";

// Card component for displaying a product in a grid with minimalist design.
function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [wish, setWish] = useState(false);
  const { cart, addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const added = cart?.items?.some(
    (it) => it.product?.id === product.id || it.productId === product.id
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login", { state: { redirectTo: location.pathname + location.search } });
      return;
    }
    try {
      setLoading(true);
      await addItem({ productId: product.id, quantity: qty });
      toast.success("Agregado");
      setQty(1);
    } catch (err) {
      // error toast handled in api
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login", { state: { redirectTo: location.pathname + location.search } });
      return;
    }
    try {
      if (!wish) {
        await api.addToWishlist(product.id);
        setWish(true);
        toast.success("Agregado a wishlist");
      } else {
        // find item in wishlist then remove
        const wl = await api.getWishlist();
        const item = wl?.items?.find((it) => (it.product?.id === product.id || it.productId === product.id));
        if (item) {
          await api.removeFromWishlist(item.id);
          setWish(false);
          toast.info("Quitado de wishlist");
        }
      }
    } catch (err) {
      // error handled by api toast
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
            className="position-absolute start-0 m-2"
            style={{ top: product.isNew ? "2.5rem" : 0 }}
          >
            Oferta
          </BrickBadge>
        )}
        <button
          type="button"
          className={`btn ${wish ? "btn-danger" : "btn-outline-danger"} wishlist-btn position-absolute top-0 end-0 m-2 z-3`}
          aria-label="Agregar a wishlist"
          onClick={handleWishlist}
        >
          <i
            className={`${wish ? "fa-solid" : "fa-regular"} fa-heart`}
            aria-hidden="true"
          ></i>
        </button>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="card-img-top"
            style={{ objectFit: "contain", height: "180px", width: "100%" }}
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
          <div
            className="mt-auto d-flex align-items-center gap-2 position-relative z-3 product-actions"
            onClick={(e) => e.stopPropagation()}
          >
            <QuantityStepper
              value={qty}
              onChange={setQty}
              min={1}
              max={product.stock}
            />
            <BrickButton
              color={added ? "green" : "yellow"}
              onClick={handleAdd}
              disabled={added || loading}
              className="flex-grow-1 d-flex align-items-center justify-content-center"
            >
              <i
                className={`fa-solid ${added ? "fa-check" : "fa-cart-plus"} me-1`}
                aria-hidden="true"
              ></i>
              {added ? "Añadido" : "Agregar"}
            </BrickButton>
          </div>
        </div>
        <Link
          to={`/products/${product.id}`}
          className="stretched-link"
          aria-label={product.name}
        ></Link>
      </div>
    </div>
  );
}

export default ProductCard;
