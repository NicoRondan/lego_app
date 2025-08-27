import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createProduct, getCategories } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import InfoTooltip from '../../components/InfoTooltip';

// Minimal resolver to integrate Zod with React Hook Form without extra deps
const zodResolver = (schema) => async (values) => {
  const result = schema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };
  const errors = result.error.issues.reduce((acc, issue) => {
    const [field] = issue.path;
    acc[field] = { type: issue.code, message: issue.message };
    return acc;
  }, {});
  return { values: {}, errors };
};

// Simple slugify implementation
const slugify = (str) =>
  str
    .toString()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  setNumber: z.string().min(1, 'Número de set requerido'),
  slug: z.string().min(1, 'Slug requerido'),
  pieces: z
    .preprocess((v) => (v === '' ? undefined : Number(v)), z.number().int().positive().optional()),
  price: z.preprocess(
    (v) => (v === '' ? undefined : Number(v)),
    z.number({ required_error: 'Precio requerido' }).nonnegative('Precio inválido')
  ),
  stock: z.preprocess(
    (v) => (v === '' ? undefined : Number(v)),
    z.number({ required_error: 'Stock requerido' })
      .int()
      .nonnegative('Stock inválido')
  ),
  categories: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url('URL inválida'),
        alt: z.string().optional(),
        primary: z.boolean().optional(),
        order: z.number().int().optional(),
      })
    )
    .optional(),
});

function ImageGalleryManager({ images, setImages }) {
  const [url, setUrl] = useState('');

  const handleFiles = (fileList) => {
    const files = Array.from(fileList);
    const newImgs = files.map((file, idx) => ({
      id: Date.now() + idx,
      file,
      url: URL.createObjectURL(file),
      alt: '',
      primary: images.length === 0 && idx === 0,
      order: images.length + idx,
    }));
    setImages([...images, ...newImgs]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const addUrl = () => {
    if (!url) return;
    setImages([
      ...images,
      {
        id: Date.now(),
        url,
        alt: '',
        primary: images.length === 0,
        order: images.length,
      },
    ]);
    setUrl('');
  };

  const updateImage = (id, field, value) => {
    setImages(images.map((img) => (img.id === id ? { ...img, [field]: value } : img)));
  };

  const removeImage = (id) => {
    const filtered = images.filter((img) => img.id !== id);
    setImages(filtered.map((img, i) => ({ ...img, order: i })));
  };

  const moveImage = (id, dir) => {
    const index = images.findIndex((img) => img.id === id);
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(index, 1);
    newImages.splice(newIndex, 0, moved);
    setImages(newImages.map((img, i) => ({ ...img, order: i })));
  };

  const selectPrimary = (id) => {
    setImages(images.map((img) => ({ ...img, primary: img.id === id })));
  };

  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Agregar por URL</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
          <button type="button" className="btn btn-outline-secondary" onClick={addUrl}>
            Agregar
          </button>
        </div>
      </div>

      <div
        className="mb-3 p-3 border border-secondary rounded text-center"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p className="mb-2">Arrastra imágenes aquí o selecciona</p>
        <input type="file" multiple className="form-control" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {images.length > 0 && (
        <ul className="list-group">
          {images.map((img, idx) => (
            <li key={img.id} className="list-group-item">
              <div className="d-flex align-items-center">
                <img
                  src={img.url}
                  alt="preview"
                  className="me-2"
                  style={{ width: 64, height: 64, objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <input
                    type="text"
                    className="form-control form-control-sm mb-1"
                    placeholder="Texto alternativo"
                    value={img.alt}
                    onChange={(e) => updateImage(img.id, 'alt', e.target.value)}
                  />
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={idx === 0}
                      onClick={() => moveImage(img.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(img.id, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeImage(img.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="form-check ms-3">
                  <input
                    type="radio"
                    name="primaryImage"
                    className="form-check-input"
                    checked={img.primary || false}
                    onChange={() => selectPrimary(img.id)}
                  />
                  <label className="form-check-label">Principal</label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NewProductPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basicos');
  const [images, setImages] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { price: '', stock: '', images: [], categories: [] },
  });

  useEffect(() => {
    setValue('images', images);
  }, [images, setValue]);

  const name = watch('name');
  const setNumber = watch('setNumber');
  const [slugTouched, setSlugTouched] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!slugTouched) {
      const s = slugify(`${setNumber || ''}-${name || ''}`);
      setValue('slug', s);
    }
  }, [name, setNumber, slugTouched, setValue]);

  useEffect(() => {
    getCategories().then(setAllCategories).catch(() => {});
  }, []);

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (!allCategories.find((c) => c.name === trimmed)) {
      setAllCategories([...allCategories, { name: trimmed }]);
    }
    const current = getValues('categories') || [];
    if (!current.includes(trimmed)) setValue('categories', [...current, trimmed]);
    setNewCategory('');
  };

  const onSubmit = async (data, status) => {
    try {
      const resp = await createProduct({ ...data, status });
      toast.success('Producto creado');
      if (status === 'draft' && resp?.id) navigate(`/admin/products/${resp.id}`);
      else if (resp?.slug) navigate(`/products/${resp.slug}`);
      else navigate('/admin');
    } catch (err) {
      // error handled by api.js toast
    }
  };

  const onError = () => toast.error('Revisa los campos obligatorios');
  const handleDraft = handleSubmit((data) => onSubmit(data, 'draft'), onError);
  const handlePublish = handleSubmit((data) => onSubmit(data, 'published'), onError);
  const handleCancel = () => navigate('/admin');

  return (
    <AdminLayout>
      <h2>Crear nuevo producto</h2>
      <form>
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === 'basicos' ? 'active' : ''}`}
              onClick={() => setActiveTab('basicos')}
            >
              Básicos
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === 'construccion' ? 'active' : ''}`}
              onClick={() => setActiveTab('construccion')}
            >
              Construcción
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === 'precio' ? 'active' : ''}`}
              onClick={() => setActiveTab('precio')}
            >
              Precio
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === 'estado' ? 'active' : ''}`}
              onClick={() => setActiveTab('estado')}
            >
              Estado & Stock
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === 'medios' ? 'active' : ''}`}
              onClick={() => setActiveTab('medios')}
            >
              Medios
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === 'seo' ? 'active' : ''}`}
              onClick={() => setActiveTab('seo')}
            >
              SEO
            </button>
          </li>
        </ul>

        <div className="tab-content">
          <div className={`tab-pane fade ${activeTab === 'basicos' ? 'show active' : ''}`}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" htmlFor="setNumber">
                  Set # <span className="text-danger">*</span>
                  <InfoTooltip text="Número oficial del set" />
                </label>
                <input
                  id="setNumber"
                  type="text"
                  className="form-control"
                  placeholder="Ej: 12345"
                  {...register('setNumber')}
                  required
                />
                {errors.setNumber && <div className="text-danger small">{errors.setNumber.message}</div>}
              </div>
              <div className="col-md-8">
                <label className="form-label" htmlFor="name">
                  Nombre <span className="text-danger">*</span>
                  <InfoTooltip text="Nombre del producto" />
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  placeholder="Nombre del producto"
                  {...register('name')}
                  required
                />
                {errors.name && <div className="text-danger small">{errors.name.message}</div>}
              </div>
              <div className="col-md-8">
                <label className="form-label" htmlFor="slug">
                  Slug <span className="text-danger">*</span>
                  <InfoTooltip text="URL amigable" />
                </label>
                <input
                  id="slug"
                  type="text"
                  className="form-control"
                  placeholder="set-nombre"
                  {...register('slug', { onChange: () => setSlugTouched(true) })}
                  required
                />
                {errors.slug && <div className="text-danger small">{errors.slug.message}</div>}
              </div>
              <div className="col-md-8">
                <label className="form-label" htmlFor="categories">
                  Categorías
                  <InfoTooltip text="Colecciones o temas" />
                </label>
                <select
                  id="categories"
                  multiple
                  className="form-select"
                  {...register('categories')}
                >
                  {allCategories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="input-group mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Agregar categoría"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={addCategory}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`tab-pane fade ${activeTab === 'construccion' ? 'show active' : ''}`}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" htmlFor="pieces">
                  Piezas
                  <InfoTooltip text="Cantidad de piezas" />
                </label>
                <input
                  id="pieces"
                  type="number"
                  className="form-control"
                  placeholder="Ej: 500"
                  {...register('pieces')}
                />
                {errors.pieces && <div className="text-danger small">{errors.pieces.message}</div>}
              </div>
            </div>
          </div>

          <div className={`tab-pane fade ${activeTab === 'precio' ? 'show active' : ''}`}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" htmlFor="price">
                  Precio <span className="text-danger">*</span>
                  <InfoTooltip text="Precio de venta" />
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="0.00"
                  {...register('price')}
                  required
                />
                {errors.price && <div className="text-danger small">{errors.price.message}</div>}
              </div>
            </div>
          </div>

          <div className={`tab-pane fade ${activeTab === 'estado' ? 'show active' : ''}`}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" htmlFor="stock">
                  Stock <span className="text-danger">*</span>
                  <InfoTooltip text="Cantidad disponible" />
                </label>
                <input
                  id="stock"
                  type="number"
                  className="form-control"
                  placeholder="0"
                  {...register('stock')}
                  required
                />
                {errors.stock && <div className="text-danger small">{errors.stock.message}</div>}
              </div>
            </div>
          </div>

          <div className={`tab-pane fade ${activeTab === 'medios' ? 'show active' : ''}`}>
            <ImageGalleryManager images={images} setImages={setImages} />
          </div>

          <div className={`tab-pane fade ${activeTab === 'seo' ? 'show active' : ''}`}>
            <div className="mb-3">
              <label className="form-label" htmlFor="metaTitle">Meta título</label>
              <input
                id="metaTitle"
                type="text"
                className="form-control"
                placeholder="Título para SEO"
                {...register('metaTitle')}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="metaDescription">Meta descripción</label>
              <textarea
                id="metaDescription"
                className="form-control"
                rows="3"
                placeholder="Descripción para motores de búsqueda"
                {...register('metaDescription')}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button type="button" className="btn btn-secondary me-2" onClick={handleDraft}>
            Guardar borrador
          </button>
          <button type="button" className="btn btn-primary me-2" onClick={handlePublish}>
            Publicar
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default NewProductPage;

