import { useState } from "react";
import PropTypes from "prop-types";
import Brand from "./Brand";
import "./AuthLayout.css";
export function PasswordInput({ id, value, onChange, label, autoComplete = "current-password" }) {
 const [visible, setVisible] = useState(false);
 return <label className="club-form-label" htmlFor={id}>{label}<div className="club-password"><input id={id} required type={visible ? "text" : "password"} value={value} onChange={onChange} autoComplete={autoComplete} /><button type="button" aria-label={`${visible ? "Ẩn" : "Hiện"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible((current) => !current)}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{visible && <path d="m3 3 18 18" />}</svg></button></div></label>;
}
PasswordInput.propTypes = { id: PropTypes.string.isRequired, value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired, label: PropTypes.string.isRequired, autoComplete: PropTypes.string };
export default function AuthLayout({ onNavigate, title, subtitle, children, variant = "login" }) {
 return <main className={`club-auth club-auth-centered club-auth-${variant}`}>
   <div className="club-auth-stadium-copy club-auth-stadium-copy-left" aria-hidden="true">DREAMS<br />MAKE<br />BETTER<br />PLAYERS</div>
   <div className="club-auth-stadium-copy club-auth-stadium-copy-right" aria-hidden="true">DREAMS<br />MAKE<br />BETTER<br />PLAYERS</div>
   <section className="club-auth-panel" aria-labelledby="auth-heading"><div className="club-auth-form">
     <Brand onNavigate={onNavigate} accent />
     <h1 id="auth-heading">{title}</h1><p className="club-auth-subtitle">{subtitle}</p>{children}
     <a className="club-auth-back" href="/" onClick={(event) => { event.preventDefault(); onNavigate("home"); }}>← Về trang chủ</a>
   </div></section>
 </main>;
}
AuthLayout.propTypes = { onNavigate: PropTypes.func.isRequired, title: PropTypes.string.isRequired, subtitle: PropTypes.string, children: PropTypes.node, variant: PropTypes.oneOf(["login", "register"]) };
