import PropTypes from "prop-types";

// Button
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-sm",
  };

  const variants = {
    primary: "bg-[#DA1A32] text-white shadow-sm shadow-none hover:bg-[#B51228]",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:text-red-700 hover:bg-red-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-emerald-200 bg-emerald-50 text-red-700 hover:bg-emerald-100",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Badge
export function Badge({
  variant = "neutral",
  children,
  className = "",
}) {
  const variants = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-gray-100 text-gray-600",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Status badge
export function StatusBadge({ status }) {
  const map = {
    confirmed: {
      label: "Đã xác nhận",
      variant: "success",
    },
    pending: {
      label: "Chờ xác nhận",
      variant: "warning",
    },
    cancelled: {
      label: "Đã hủy",
      variant: "error",
    },
    completed: {
      label: "Hoàn thành",
      variant: "info",
    },
    held: {
      label: "Giữ chỗ tạm",
      variant: "purple",
    },
    active: {
      label: "Hoạt động",
      variant: "success",
    },
    locked: {
      label: "Bị khóa",
      variant: "error",
    },
    hidden: {
      label: "Ẩn",
      variant: "neutral",
    },
    open: {
      label: "Trống",
      variant: "success",
    },
    booked: {
      label: "Đã đặt",
      variant: "error",
    },
  };

  const cfg =
    map[status] || {
      label: status,
      variant: "neutral",
    };

  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

// Input
export function Input({
  label,
  icon,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          className={`h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10 ${
            icon ? "pl-10" : ""
          } ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

// Select
export function Select({
  label,
  options,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <select
        className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ImageUploadField({
  label,
  value,
  onChange,
  onClear,
  loading = false,
  helperText = "PNG, JPG, WEBP tối đa 10MB",
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      {value ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
          <div className="flex h-[clamp(150px,26vh,230px)] items-center justify-center bg-slate-100">
            <img src={value} alt="Preview ảnh sân" className="h-full w-full object-contain" />
          </div>
          <div className="flex items-center justify-between gap-3 p-3">
            <span className="truncate text-xs font-medium text-gray-600">Ảnh đã chọn</span>
            <div className="flex items-center gap-2">
            <label className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700">
              {loading ? "Đang tải..." : "Thay ảnh"}
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={loading} onChange={onChange} className="hidden" />
            </label>
            <button
              type="button"
              disabled={loading}
              onClick={onClear}
              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600"
            >
              Xóa ảnh
            </button>
            </div>
          </div>
        </div>
      ) : (
        <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-green-400 hover:bg-green-50">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm group-hover:shadow-md">
            🖼️
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Kéo ảnh vào đây hoặc chọn ảnh</p>
            <p className="mt-1 text-xs text-gray-500">{helperText}</p>
          </div>
          <span className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white shadow-sm">
            {loading ? "Đang tải..." : "Chọn ảnh"}
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={loading} onChange={onChange} className="hidden" />
        </label>
      )}
    </div>
  );
}

// Card
export function Card({
  children,
  className = "",
  onClick,
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Stat card
export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "bg-green-50 text-green-600",
}) {
  return (
    <Card className="p-5 flex items-center gap-4">
      {icon && (
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${accent}`}
        >
          {icon}
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>

        <p
          className="text-2xl font-bold text-gray-900 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </p>

        {sub && (
          <p className="text-xs text-gray-500 mt-0.5">
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}

// Field card
export function FieldCard({ field, onClick }) {
  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-44 bg-green-100 overflow-hidden">
        <img
          src={field.image}
          alt={field.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3">
          <span className="bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Sân {field.type} người
          </span>
        </div>

        {field.status === "hidden" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold">
              Tạm ẩn
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3
              className="font-bold text-gray-900"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                letterSpacing: "0.02em",
              }}
            >
              {field.name}
            </h3>

            <p className="text-sm text-gray-500 mt-0.5">
              📍 {field.zone}
            </p>
          </div>

          <div className="text-right">
            <p className="text-green-600 font-bold text-sm">
              {(field.price / 1000).toFixed(0)}k/giờ
            </p>

            <p className="text-xs text-gray-400">
              ⭐ {field.rating} ({field.reviews})
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {field.description}
        </p>
      </div>
    </Card>
  );
}

// Table
export function Table({
  headers,
  children,
  className = "",
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {children}
        </tbody>
      </table>
    </div>
  );
}

// Table row
export function Tr({ children, onClick }) {
  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// Table cell
export function Td({
  children,
  className = "",
}) {
  return (
    <td className={`py-3 px-4 text-gray-700 ${className}`}>
      {children}
    </td>
  );
}

// Pagination
export function Pagination({
  page,
  total,
  perPage = 10,
  onChange,
}) {
  const pages = Math.ceil(total / perPage);

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <p className="text-gray-500">
        Hiển thị{" "}
        {Math.min((page - 1) * perPage + 1, total)}
        –
        {Math.min(page * perPage, total)}
        {" / "}
        {total}
      </p>

      <div className="flex gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
        >
          ‹
        </button>

        {Array.from(
          { length: Math.min(pages, 5) },
          (_, i) => i + 1
        ).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 rounded-lg border ${
              p === page
                ? "bg-red-700 text-white border-green-600"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  );
}

// Modal
export function Modal({
  open,
  onClose,
  title,
  children,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3
            className="font-bold text-gray-900"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
            }}
          >
            {title}
          </h3>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// Section header
export function SectionHeader({
  title,
  subtitle,
  action,
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1
          className="text-3xl font-bold text-gray-900"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="text-gray-500 mt-1 text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
Button.propTypes = { variant: PropTypes.string, size: PropTypes.string, className: PropTypes.string, children: PropTypes.node };
Badge.propTypes = { variant: PropTypes.string, children: PropTypes.node, className: PropTypes.string };
StatusBadge.propTypes = { status: PropTypes.string };
Input.propTypes = { label: PropTypes.node, icon: PropTypes.node, className: PropTypes.string };
Select.propTypes = { label: PropTypes.node, options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), label: PropTypes.node })).isRequired, className: PropTypes.string };
ImageUploadField.propTypes = { label: PropTypes.node, value: PropTypes.string, onChange: PropTypes.func.isRequired, onClear: PropTypes.func, loading: PropTypes.bool, helperText: PropTypes.string };
Card.propTypes = { children: PropTypes.node, className: PropTypes.string, onClick: PropTypes.func };
StatCard.propTypes = { label: PropTypes.node, value: PropTypes.node, sub: PropTypes.node, icon: PropTypes.node, accent: PropTypes.string };
FieldCard.propTypes = { field: PropTypes.shape({ image: PropTypes.string, name: PropTypes.string, type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), status: PropTypes.string, zone: PropTypes.string, price: PropTypes.number, rating: PropTypes.number, reviews: PropTypes.number, description: PropTypes.string }).isRequired, onClick: PropTypes.func };
Table.propTypes = { headers: PropTypes.arrayOf(PropTypes.string).isRequired, children: PropTypes.node, className: PropTypes.string };
Tr.propTypes = { children: PropTypes.node, onClick: PropTypes.func };
Td.propTypes = { children: PropTypes.node, className: PropTypes.string };
Pagination.propTypes = { page: PropTypes.number.isRequired, total: PropTypes.number.isRequired, perPage: PropTypes.number, onChange: PropTypes.func.isRequired };
Modal.propTypes = { open: PropTypes.bool, onClose: PropTypes.func.isRequired, title: PropTypes.node, children: PropTypes.node };
SectionHeader.propTypes = { title: PropTypes.node, subtitle: PropTypes.node, action: PropTypes.node };
