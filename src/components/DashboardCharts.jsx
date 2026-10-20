import PropTypes from "prop-types";
export function RevenueLineChart({ rows }) {
 const maximum = Math.max(...rows.map((row) => Number(row.giaTri || 0)),1);
 const points = rows.map((row,index) => [42 + index * 508 / Math.max(rows.length-1,1), 178 - Number(row.giaTri || 0)/maximum*135]);
 const line = points.map((point,index) => `${index ? "L" : "M"}${point.join(",")}`).join(" ");
 const area = points.length ? `${line} L550,178 L42,178 Z` : "";
 return <div className="dashboard-chart"><svg viewBox="0 0 580 215" role="img" aria-label="Biểu đồ doanh thu theo ngày trong tuần"><defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#DA1A32" stopOpacity=".2" /><stop offset="100%" stopColor="#DA1A32" stopOpacity="0" /></linearGradient></defs>{[0,1,2,3].map((tick) => <g key={tick}><line x1="42" x2="550" y1={178-tick*45} y2={178-tick*45} stroke="#e5e7eb" strokeDasharray="3 4" /><text x="35" y={181-tick*45} textAnchor="end" fill="#64748b" fontSize="9">{(maximum*tick/3/1000).toLocaleString("vi-VN",{maximumFractionDigits:0})}k</text></g>)}<path d={area} fill="url(#revenue-fill)" /><path d={line} fill="none" stroke="#DA1A32" strokeWidth="2.5" strokeLinejoin="round" />{points.map(([x,y],index) => <g key={rows[index].ngay}><circle cx={x} cy={y} r="3" fill="#DA1A32"><title>{`${rows[index].ngay}: ${Number(rows[index].giaTri || 0).toLocaleString("vi-VN")} đ`}</title></circle><text x={x} y="202" textAnchor="middle" fill="#64748b" fontSize="10">{rows[index].ngay}</text></g>)}</svg><div className="sr-only">{rows.map((row) => <p key={row.ngay}>{row.ngay}: {Number(row.giaTri || 0).toLocaleString("vi-VN")} đồng</p>)}</div>{!rows.some((row) => Number(row.giaTri)>0) && <p className="dashboard-chart-empty">Chưa có doanh thu đã thanh toán trong tuần.</p>}</div>;
}
RevenueLineChart.propTypes = { rows: PropTypes.array.isRequired };
export function FieldTypeChart({ fields }) {
 const counts = fields.reduce((result,field) => { const type=field.loaiSan || "Chưa phân loại"; result[type]=(result[type]||0)+1; return result; },{});
 const colors=["#DA1A32","#159A55","#3B82F6","#F59E0B","#64748B"];
 let start = 0;
 const segments=Object.entries(counts).map(([name,count],index) => { const size=count/fields.length*100; const segment={name,count,size,start,color:colors[index%colors.length]}; start+=size; return segment; });
 if (!fields.length) return <p className="dashboard-chart-empty">Chưa có dữ liệu loại sân.</p>;
 return <div className="dashboard-donut"><svg viewBox="0 0 120 120" role="img" aria-label={`Phân bố loại sân, tổng ${fields.length} sân`}><circle cx="60" cy="60" r="44" fill="none" stroke="#e5e7eb" strokeWidth="19" />{segments.map((segment) => <circle key={segment.name} cx="60" cy="60" r="44" fill="none" stroke={segment.color} strokeWidth="19" pathLength="100" strokeDasharray={`${segment.size} ${100-segment.size}`} strokeDashoffset={-segment.start} transform="rotate(-90 60 60)"><title>{`${segment.name}: ${segment.count} sân`}</title></circle>)}<text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="800" fill="#0b0f14">{fields.length}</text><text x="60" y="76" textAnchor="middle" fontSize="9" fill="#64748b">SÂN BÓNG</text></svg><ul>{segments.map((segment) => <li key={segment.name}><i style={{background:segment.color}} />{segment.name}<strong>{segment.count} ({Math.round(segment.size)}%)</strong></li>)}</ul></div>;
}
FieldTypeChart.propTypes = { fields: PropTypes.array.isRequired };
