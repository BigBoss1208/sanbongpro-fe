import PropTypes from "prop-types";
import { useEffect, useState } from 'react'

const EMPTY = { name: '', description: '', price: '', quantity: '', image: null }

export default function ProductForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name ?? '',
        description: editing.description ?? '',
        price: editing.price ?? '',
        quantity: editing.quantity ?? '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [editing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] ?? null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      image: form.image,
    })
    if (!editing) setForm(EMPTY)
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>{editing ? `Edit product #${editing.id}` : 'Add new product'}</h2>

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Laptop"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Short description"
        />
      </div>

      <div className="field">
        <label htmlFor="image">Product image</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required={!editing}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {editing ? 'Update' : 'Create'}
        </button>
        {editing && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

ProductForm.propTypes = { editing: PropTypes.shape({ id: PropTypes.number, name: PropTypes.string, description: PropTypes.string, price: PropTypes.number, quantity: PropTypes.number }), onSubmit: PropTypes.func.isRequired, onCancel: PropTypes.func.isRequired };
