import { useEffect, useRef, useState } from "react";
import { sanApi } from "../api/sanApi";
import { answerPitchQuestion } from "../utils/pitchAssistant";
import "./PitchChatbot.css";

const greeting = { role: "assistant", text: "Chào bạn! Mình là trợ lý Sân Bóng Pro ⚽. Bạn muốn tìm sân, xem giá hay cần hướng dẫn đặt sân? Mình tư vấn tự động từ dữ liệu website, không tự đặt hoặc thanh toán." };
const suggestions = ["Sân hot", "Giá sân", "Sân 5 dưới 400k", "Cách đặt sân"];

export default function PitchChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([greeting]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const input = useRef(null);
  const history = useRef(null);
  const toggle = useRef(null);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { if (open && history.current) history.current.scrollTop = history.current.scrollHeight; }, [messages, busy, open]);

  const send = async (value) => {
    const question = value.trim().slice(0, 300);
    if (!question || running.current) return;
    running.current = true;
    setBusy(true); setDraft("");
    setMessages(previous => [...previous.slice(-29), { role: "user", text: question }]);
    try {
      let response;
      try { response = answerPitchQuestion(question, null); }
      catch {
        // Fetch only public inventory, only when needed. Never send the conversation to a provider.
        const fields = await sanApi.danhSachSan();
        response = answerPitchQuestion(question, fields);
      }
      setMessages(previous => [...previous, { role: "assistant", ...response }]);
    } catch {
      setMessages(previous => [...previous, { role: "assistant", text: "Chưa lấy được dữ liệu sân. Backend Free có thể đang khởi động; đợi một lát rồi hỏi lại nhé. Mình chưa có dữ liệu để báo giá lúc này.", links: [{ href: "/tim-san", label: "Mở danh sách sân" }] }]);
    } finally { running.current = false; setBusy(false); }
  };
  const close = () => { setOpen(false); toggle.current?.focus(); };
  return <aside className="pitch-chat" aria-label="Trợ lý tư vấn sân bóng">
    {open && <section id="pitch-chat-panel" className="pitch-chat-panel" role="region" aria-labelledby="pitch-chat-title"
      onKeyDown={event => { if (event.key === "Escape") close(); }}>
      <header className="pitch-chat-header"><div><h2 id="pitch-chat-title">⚽ Trợ lý Sân Bóng Pro</h2><p>Tư vấn sân & giá từ hệ thống</p></div>
        <button type="button" onClick={close} aria-label="Đóng chatbot">✕</button></header>
      <div ref={history} className="pitch-chat-history" role="log" aria-live="polite" aria-relevant="additions text">
        {messages.map((message, index) => <div key={index} className={`pitch-chat-message ${message.role}`}>
          <span className="pitch-chat-speaker">{message.role === "user" ? "Bạn" : "Trợ lý"}</span><p>{message.text}</p>
          {message.fields?.map(field => <a className="pitch-chat-card" key={field.id} href={`/san/${field.id}`}>
            <strong>{field.name}</strong><span>{[field.type, field.cluster].filter(Boolean).join(" · ")}</span>
            <b>{field.price == null ? "Chưa có giá" : `Từ ${new Intl.NumberFormat("vi-VN").format(field.price)}đ / khung`}</b><span>Xem lịch & đặt sân →</span>
          </a>)}
          {message.links?.map(link => <a className="pitch-chat-link" key={link.href} href={link.href}>{link.label} →</a>)}
        </div>)}
        {busy && <p role="status" className="pitch-chat-loading">Đang kiểm tra dữ liệu sân…</p>}
      </div>
      <div className="pitch-chat-suggestions">{suggestions.map(text => <button key={text} type="button" disabled={busy} onClick={() => send(text)}>{text}</button>)}</div>
      <form className="pitch-chat-form" onSubmit={event => { event.preventDefault(); send(draft); }}>
        <label className="sr-only" htmlFor="pitch-chat-input">Câu hỏi tư vấn sân</label>
        <input ref={input} id="pitch-chat-input" maxLength={300} autoComplete="off" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Hỏi về sân, giá, cách đặt…" />
        <button type="submit" disabled={busy || !draft.trim()} aria-label="Gửi câu hỏi">➤</button>
      </form><p className="pitch-chat-note">Không gửi mật khẩu, OTP hoặc thông tin thanh toán.</p>
    </section>}
    <button ref={toggle} className="pitch-chat-ball" type="button" onClick={() => open ? close() : setOpen(true)}
      aria-label={open ? "Đóng trợ lý sân bóng" : "Mở trợ lý sân bóng"} aria-expanded={open} aria-controls="pitch-chat-panel">
      <span aria-hidden="true">⚽</span><span className="pitch-chat-badge" aria-hidden="true">Chat</span>
    </button>
  </aside>;
}
