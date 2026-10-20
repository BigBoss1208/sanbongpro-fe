import PropTypes from "prop-types";
import { BASE_URL as API_BASE_URL } from "../api/http";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Deprecated standalone screen retained for existing consumers.

export default function QuanLySan({ token }) {
  const [danhSachSan, setDanhSachSan] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const taiDanhSach = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/san`);
      setDanhSachSan(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    taiDanhSach();
  }, [taiDanhSach]);

  const anHienSan = async (san) => {
    const trangThaiMoi = san.trangThai === 'HOAT_DONG' ? 'DA_AN' : 'HOAT_DONG';
    if (!window.confirm(`Xác nhận đổi trạng thái sân "${san.tenSan}" thành ${trangThaiMoi}?`)) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/san/${san.id}/trang-thai?trangThai=${trangThaiMoi}`,
        null,
        authHeader
      );
      taiDanhSach();
    } catch (err) {
      alert('Không thể cập nhật trạng thái sân (kiểm tra quyền Admin).');
    }
  };

  return (
    <div>
      <h3>Quản lý sân</h3>
      {loading && <p>Đang tải...</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Tên sân</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Loại</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Trạng thái</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {danhSachSan.map((san) => (
            <tr key={san.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{san.tenSan}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{san.loaiSan}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{san.trangThai}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                <button onClick={() => anHienSan(san)}>
                  {san.trangThai === 'HOAT_DONG' ? 'Ẩn sân' : 'Hiện sân'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
QuanLySan.propTypes = { token: PropTypes.string };
