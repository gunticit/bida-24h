"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Box, Typography, IconButton, Badge, Snackbar, Alert, Chip,
  Slide, Fab, Drawer, Divider, Button, Skeleton,
} from "@mui/material";
import {
  Add as AddIcon, Remove as RemoveIcon, ShoppingCart as CartIcon,
  Restaurant as FoodIcon, LocalBar as DrinkIcon, SmokingRooms as SmokeIcon,
  Close as CloseIcon, Send as SendIcon, CheckCircle as DoneIcon,
  HourglassEmpty as PendingIcon, Loop as PreparingIcon,
  TableRestaurant as TableIcon, Refresh as RefreshIcon,
  AccessTime as TimerIcon, AttachMoney as MoneyIcon,
} from "@mui/icons-material";

const API_BASE_URL = typeof window !== "undefined" && process.env.NODE_ENV === "production"
  ? (process.env.NEXT_PUBLIC_API_URL || "https://api.24hbilliardscoffee.com/api")
  : "http://localhost:8001/api";

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

const categoryMeta: Record<string, { icon: React.ReactNode; label: string; gradient: string }> = {
  food:    { icon: <FoodIcon fontSize="small" />,  label: "Đồ ăn",    gradient: "linear-gradient(135deg, #ff6b35, #f7931e)" },
  drink:   { icon: <DrinkIcon fontSize="small" />,  label: "Đồ uống",   gradient: "linear-gradient(135deg, #00b4d8, #0077b6)" },
  tobacco: { icon: <SmokeIcon fontSize="small" />,  label: "Thuốc lá",  gradient: "linear-gradient(135deg, #8d6e63, #5d4037)" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: "Chờ xác nhận", color: "#ff9800", bg: "rgba(255,152,0,.12)", icon: <PendingIcon sx={{ fontSize: 14 }} /> },
  preparing: { label: "Đang làm",     color: "#2196f3", bg: "rgba(33,150,243,.12)", icon: <PreparingIcon sx={{ fontSize: 14 }} /> },
  done:      { label: "Đã giao",      color: "#4caf50", bg: "rgba(76,175,80,.12)",  icon: <DoneIcon sx={{ fontSize: 14 }} /> },
};

interface Menu { id: number; name: string; price: number; category: string; }
interface CartItem extends Menu { qty: number; }

export default function QROrderingPage() {
  const { token } = useParams() as { token: string };
  const [table, setTable] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" as any });
  const [activeTab, setActiveTab] = useState("all");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [now, setNow] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        fetch(`${API_BASE_URL}/public/tables/${token}`),
        fetch(`${API_BASE_URL}/public/menus`),
      ]);
      if (!tRes.ok) { const d = await tRes.json().catch(() => ({})); throw new Error(d.message || "Mã QR không hợp lệ"); }
      const td = await tRes.json();
      setTable(td.table); setSession(td.session);
      if (mRes.ok) setMenus(await mRes.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);
  // Auto-refresh orders every 20s
  useEffect(() => { if (!session) return; const id = setInterval(fetchData, 20000); return () => clearInterval(id); }, [session, fetchData]);
  // Tick every second for live timer
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  const addToCart = (m: Menu) => setCart(p => { const e = p.find(i => i.id === m.id); return e ? p.map(i => i.id === m.id ? { ...i, qty: i.qty + 1 } : i) : [...p, { ...m, qty: 1 }]; });
  const removeFromCart = (id: number) => setCart(p => { const e = p.find(i => i.id === id); return e && e.qty > 1 ? p.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i) : p.filter(i => i.id !== id); });
  const getCartQty = (id: number) => cart.find(i => i.id === id)?.qty || 0;
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const categories = useMemo(() => {
    const cats = [...new Set(menus.map(m => m.category))];
    return cats;
  }, [menus]);

  const filteredMenus = useMemo(() => activeTab === "all" ? menus : menus.filter(m => m.category === activeTab), [menus, activeTab]);

  const handleOrder = async () => {
    if (!cart.length) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${API_BASE_URL}/public/tables/${token}/orders`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.map(i => ({ menu_id: i.id, quantity: i.qty })) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setCart([]); setCartOpen(false); setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 3000);
      fetchData();
    } catch (e: any) { setToast({ open: true, msg: e.message, sev: "error" }); }
    finally { setSubmitting(false); }
  };

  // --- LOADING ---
  if (loading) return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", p: 2 }}>
      <Box sx={{ pt: 6, px: 1 }}>
        <Skeleton variant="rounded" width={160} height={32} sx={{ bgcolor: "rgba(255,255,255,.08)", mb: 1 }} />
        <Skeleton variant="rounded" width={100} height={20} sx={{ bgcolor: "rgba(255,255,255,.06)", mb: 4 }} />
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ bgcolor: "rgba(255,255,255,.06)", mb: 2, borderRadius: 3 }} />)}
      </Box>
    </Box>
  );

  // --- ERROR ---
  if (error) return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Box sx={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(244,67,54,.15)", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
        <CloseIcon sx={{ fontSize: 40, color: "#ef5350" }} />
      </Box>
      <Typography variant="h6" sx={{ color: "#fff", mb: 1, textAlign: "center" }}>Không thể truy cập</Typography>
      <Typography sx={{ color: "rgba(255,255,255,.6)", textAlign: "center", mb: 3, fontSize: 14 }}>{error}</Typography>
      <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { setError(""); setLoading(true); fetchData(); }}
        sx={{ color: "#fff", borderColor: "rgba(255,255,255,.3)", borderRadius: 3, "&:hover": { borderColor: "#fff" } }}>
        Thử lại
      </Button>
    </Box>
  );

  // --- NO SESSION ---
  if (!session) return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Box sx={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,152,0,.15)", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
        <TableIcon sx={{ fontSize: 40, color: "#ffb74d" }} />
      </Box>
      <Typography variant="h6" sx={{ color: "#fff", mb: 1, textAlign: "center" }}>{table?.name || "Bàn"}</Typography>
      <Typography sx={{ color: "rgba(255,255,255,.6)", textAlign: "center", fontSize: 14 }}>Bàn chưa được mở. Vui lòng liên hệ nhân viên để bắt đầu giờ chơi trước khi gọi món.</Typography>
    </Box>
  );

  const orders = session?.orders || [];

  // === Billing calculations ===
  const startTime = session?.start_time ? new Date(session.start_time) : null;
  const hourPrice = session?.hour_price || 0;
  const elapsedMs = startTime ? now.getTime() - startTime.getTime() : 0;
  const elapsedHours = Math.max(0, elapsedMs / (1000 * 60 * 60));
  const elapsedH = Math.floor(elapsedHours);
  const elapsedM = Math.floor((elapsedHours - elapsedH) * 60);
  const elapsedS = Math.floor(((elapsedHours - elapsedH) * 60 - elapsedM) * 60);
  const liveTableCost = Math.round(elapsedHours * hourPrice);
  const foodCost = (orders as any[]).filter((o: any) => o.status === 'preparing' || o.status === 'done').reduce((s: number, o: any) => s + parseFloat(o.total_price || 0), 0);
  const liveTotal = liveTableCost + foodCost;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", pb: 12 }}>
      {/* ===== HEADER ===== */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(20px)", background: "rgba(15,12,41,.75)", borderBottom: "1px solid rgba(255,255,255,.06)", px: 2.5, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: -.3 }}>{table?.name}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,.45)", fontSize: 12 }}>24h Billiards & Coffee</Typography>
        </Box>
        <IconButton onClick={() => setCartOpen(true)} sx={{ background: totalItems > 0 ? "linear-gradient(135deg, #f7931e, #ff6b35)" : "rgba(255,255,255,.08)", width: 44, height: 44, "&:hover": { transform: "scale(1.05)" }, transition: "all .2s" }}>
          <Badge badgeContent={totalItems} sx={{ "& .MuiBadge-badge": { background: "#ef5350", color: "#fff", fontWeight: 700, fontSize: 11 } }}>
            <CartIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Badge>
        </IconButton>
      </Box>

      <Box sx={{ px: 2.5, pt: 2.5 }}>
        {/* ===== LIVE BILLING CARD ===== */}
        <Box sx={{ mb: 3, background: "rgba(255,255,255,.04)", borderRadius: 3, border: "1px solid rgba(255,255,255,.08)", overflow: "hidden" }}>
          {/* Timer row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, pt: 2, pb: 1.5 }}>
            <TimerIcon sx={{ color: "#f7931e", fontSize: 20 }} />
            <Typography sx={{ color: "#fff", fontFamily: "monospace", fontSize: 28, fontWeight: 800, letterSpacing: 2 }}>
              {pad(elapsedH)}:{pad(elapsedM)}:{pad(elapsedS)}
            </Typography>
          </Box>
          <Typography sx={{ color: "rgba(255,255,255,.35)", fontSize: 11, textAlign: "center", mb: 1.5 }}>
            Bắt đầu: {startTime ? startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'} · Giá: {fmt(hourPrice)}/giờ
          </Typography>
          <Divider sx={{ borderColor: "rgba(255,255,255,.06)" }} />
          {/* Cost breakdown */}
          <Box sx={{ px: 2.5, py: 1.5, display: "flex", flexDirection: "column", gap: .8 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>⏱ Tiền giờ chơi</Typography>
              <Typography sx={{ color: "rgba(255,255,255,.8)", fontSize: 13, fontWeight: 600 }}>{fmt(liveTableCost)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>🍜 Tiền đồ ăn/uống</Typography>
              <Typography sx={{ color: "rgba(255,255,255,.8)", fontSize: 13, fontWeight: 600 }}>{fmt(foodCost)}</Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: "rgba(255,255,255,.06)" }} />
          {/* Total */}
          <Box sx={{ px: 2.5, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(247,147,30,.06)" }}>
            <Typography sx={{ color: "rgba(255,255,255,.7)", fontSize: 14, fontWeight: 600 }}>Tạm tính</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg, #f7931e, #ff6b35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{fmt(liveTotal)}</Typography>
          </Box>
        </Box>
        {/* ===== ORDERED ITEMS ===== */}
        {orders.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, mb: 1.5 }}>Món đã gọi</Typography>
            <Box sx={{ background: "rgba(255,255,255,.04)", borderRadius: 3, border: "1px solid rgba(255,255,255,.06)", overflow: "hidden" }}>
              {orders.map((o: any, idx: number) => {
                const st = statusConfig[o.status] || statusConfig.pending;
                return (
                  <Box key={o.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: idx < orders.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography sx={{ color: "rgba(255,255,255,.4)", fontSize: 12, fontWeight: 600 }}>x{o.quantity}</Typography>
                      </Box>
                      <Typography sx={{ color: "rgba(255,255,255,.85)", fontSize: 14, fontWeight: 500 }}>{o.menu?.name}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: .5, background: st.bg, borderRadius: 2, px: 1, py: .3 }}>
                      {st.icon}
                      <Typography sx={{ color: st.color, fontSize: 11, fontWeight: 600 }}>{st.label}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ===== CATEGORY TABS ===== */}
        <Box sx={{ display: "flex", gap: 1, mb: 2.5, overflowX: "auto", pb: .5, "&::-webkit-scrollbar": { display: "none" } }}>
          <Chip label="Tất cả" onClick={() => setActiveTab("all")}
            sx={{ background: activeTab === "all" ? "linear-gradient(135deg, #f7931e, #ff6b35)" : "rgba(255,255,255,.06)", color: activeTab === "all" ? "#fff" : "rgba(255,255,255,.5)", fontWeight: 600, fontSize: 13, border: "none", height: 34, "&:hover": { background: activeTab === "all" ? undefined : "rgba(255,255,255,.1)" } }} />
          {categories.map(cat => {
            const meta = categoryMeta[cat] || categoryMeta.food;
            return (
              <Chip key={cat} icon={<Box sx={{ color: activeTab === cat ? "#fff" : "rgba(255,255,255,.4)" }}>{meta.icon}</Box>} label={meta.label}
                onClick={() => setActiveTab(cat)}
                sx={{ background: activeTab === cat ? meta.gradient : "rgba(255,255,255,.06)", color: activeTab === cat ? "#fff" : "rgba(255,255,255,.5)", fontWeight: 600, fontSize: 13, border: "none", height: 34, "& .MuiChip-icon": { ml: .5 }, "&:hover": { background: activeTab === cat ? undefined : "rgba(255,255,255,.1)" } }} />
            );
          })}
        </Box>

        {/* ===== MENU LIST ===== */}
        <Typography sx={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, mb: 1.5 }}>Thực đơn ({filteredMenus.length})</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filteredMenus.map(menu => {
            const q = getCartQty(menu.id);
            const meta = categoryMeta[menu.category] || categoryMeta.food;
            return (
              <Box key={menu.id} sx={{ background: q > 0 ? "rgba(247,147,30,.06)" : "rgba(255,255,255,.04)", borderRadius: 3, border: q > 0 ? "1px solid rgba(247,147,30,.25)" : "1px solid rgba(255,255,255,.06)", p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all .2s", "&:active": { transform: "scale(.98)" } }}>
                <Box sx={{ flex: 1, minWidth: 0, mr: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: .5 }}>
                    <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{menu.name}</Typography>

                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, background: meta.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{fmt(menu.price)}</Typography>
                    <Box sx={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,.15)" }} />
                    <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{meta.label}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: .5, flexShrink: 0 }}>
                  {q > 0 && (
                    <>
                      <IconButton onClick={() => removeFromCart(menu.id)} sx={{ width: 32, height: 32, background: "rgba(255,255,255,.08)", "&:hover": { background: "rgba(255,255,255,.15)" } }}>
                        <RemoveIcon sx={{ fontSize: 16, color: "#fff" }} />
                      </IconButton>
                      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 15, minWidth: 24, textAlign: "center" }}>{q}</Typography>
                    </>
                  )}
                  <IconButton onClick={() => addToCart(menu)}
                    sx={{ width: 32, height: 32, background: q > 0 ? "linear-gradient(135deg, #f7931e, #ff6b35)" : "rgba(255,255,255,.08)", "&:hover": { background: q > 0 ? undefined : "rgba(255,255,255,.15)" }, "&.Mui-disabled": { opacity: .3 } }}>
                    <AddIcon sx={{ fontSize: 16, color: "#fff" }} />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ===== FLOATING CART BAR ===== */}
      <Slide direction="up" in={totalItems > 0} mountOnEnter unmountOnExit>
        <Box onClick={() => setCartOpen(true)} sx={{ position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 20, background: "linear-gradient(135deg, #f7931e, #ff6b35)", borderRadius: 4, px: 2.5, py: 1.8, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", boxShadow: "0 8px 32px rgba(247,147,30,.4)", "&:active": { transform: "scale(.98)" }, transition: "transform .15s" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CartIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Xem giỏ hàng</Typography>
              <Typography sx={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>{totalItems} món</Typography>
            </Box>
          </Box>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{fmt(totalPrice)}</Typography>
        </Box>
      </Slide>

      {/* ===== CART DRAWER ===== */}
      <Drawer anchor="bottom" open={cartOpen} onClose={() => setCartOpen(false)} PaperProps={{ sx: { background: "linear-gradient(180deg, #1a1640 0%, #0f0c29 100%)", borderRadius: "24px 24px 0 0", maxHeight: "85vh", border: "1px solid rgba(255,255,255,.06)", borderBottom: "none" } }}>
        <Box sx={{ px: 3, pt: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Giỏ hàng</Typography>
          <IconButton onClick={() => setCartOpen(false)} sx={{ color: "rgba(255,255,255,.5)" }}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,.06)" }} />
        <Box sx={{ px: 3, py: 2, overflowY: "auto", flex: 1 }}>
          {cart.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CartIcon sx={{ fontSize: 48, color: "rgba(255,255,255,.15)", mb: 2 }} />
              <Typography sx={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>Giỏ hàng trống</Typography>
            </Box>
          ) : cart.map(item => (
            <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{item.name}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg, #f7931e, #ff6b35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{fmt(item.price * item.qty)}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: .5 }}>
                <IconButton onClick={() => removeFromCart(item.id)} sx={{ width: 30, height: 30, background: "rgba(255,255,255,.08)" }}><RemoveIcon sx={{ fontSize: 14, color: "#fff" }} /></IconButton>
                <Typography sx={{ color: "#fff", fontWeight: 700, minWidth: 24, textAlign: "center", fontSize: 14 }}>{item.qty}</Typography>
                <IconButton onClick={() => addToCart(item)} sx={{ width: 30, height: 30, background: "rgba(255,255,255,.08)" }}><AddIcon sx={{ fontSize: 14, color: "#fff" }} /></IconButton>
              </Box>
            </Box>
          ))}
        </Box>
        {cart.length > 0 && (
          <Box sx={{ px: 3, pb: 3, pt: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ color: "rgba(255,255,255,.5)", fontSize: 14 }}>Tổng cộng</Typography>
              <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{fmt(totalPrice)}</Typography>
            </Box>
            <Button fullWidth variant="contained" startIcon={<SendIcon />} onClick={handleOrder} disabled={submitting}
              sx={{ background: "linear-gradient(135deg, #f7931e, #ff6b35)", borderRadius: 3, py: 1.5, fontWeight: 700, fontSize: 15, textTransform: "none", boxShadow: "0 8px 24px rgba(247,147,30,.35)", "&:hover": { boxShadow: "0 12px 32px rgba(247,147,30,.5)" }, "&.Mui-disabled": { background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.3)" } }}>
              {submitting ? "Đang gửi..." : "Gửi order"}
            </Button>
          </Box>
        )}
      </Drawer>

      {/* ===== SUCCESS OVERLAY ===== */}
      {orderSuccess && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.7)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeIn .3s ease" }}
          onClick={() => setOrderSuccess(false)}>
          <Box sx={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #4caf50, #2e7d32)", display: "flex", alignItems: "center", justifyContent: "center", mb: 3, animation: "scaleIn .4s ease" }}>
            <DoneIcon sx={{ fontSize: 40, color: "#fff" }} />
          </Box>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 20, mb: 1 }}>Đặt món thành công!</Typography>
          <Typography sx={{ color: "rgba(255,255,255,.6)", fontSize: 14 }}>Vui lòng chờ nhân viên xác nhận nhé</Typography>
        </Box>
      )}

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={toast.sev} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 3 }}>{toast.msg}</Alert>
      </Snackbar>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
      `}</style>
    </Box>
  );
}
