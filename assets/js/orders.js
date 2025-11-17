// ../assets/js/orders.js
(function () {
  const STORAGE_KEY = 'ordersHistory';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatCurrency(v) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v || 0));
  }

  function getRawOrders() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.error('Lỗi đọc ordersHistory', e);
      return [];
    }
  }

  function normalizeStoredOrder(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const id = raw.id || raw.orderId || raw.code || '';
    const customerName = raw.customerName || (raw.customer && raw.customer.name) || raw.customer || '';
    const customerPhone = raw.customerPhone || (raw.customer && raw.customer.phone) || '';
    const shippingAddress = raw.shippingAddress || raw.address || '';
    const paymentMethod = raw.paymentMethod || (raw.payment && raw.payment.methodText) || '';
    const status = raw.status || raw.orderStatus || 'đã giao';
    const itemsRaw = raw.items || raw.products || raw.lines || [];
    const items = Array.isArray(itemsRaw) ? itemsRaw.map(it => ({
      id: it.id || it.productId || '',
      name: it.name || it.product || it.title || '',
      price: Number(it.price ?? it.unitPrice ?? 0),
      quantity: Number(it.quantity ?? it.qty ?? 0),
      image: it.image || ''
    })) : [];
    const totalAmount = Number(raw.totalAmount ?? raw.total ?? 0);
    const createdAt = raw.createdAt || raw.orderDate || '';
    return { rawOriginal: raw, id, customerName, customerPhone, shippingAddress, paymentMethod, status, items, totalAmount, createdAt };
  }

  function calculateOrderTotal(order) {
  return (order.items || []).reduce((sum, it) => {
    const price = Number(it.price) || 0;
    const qty = Number(it.quantity) || 0;
    return sum + price * qty;
  }, 0);
}
  // Render danh sách đơn vào #ordersContainer
  function renderOrdersManagement() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) {
      console.warn('ordersContainer không tồn tại trong DOM');
      return;
    }

    const raw = getRawOrders();
    const orders = raw.map(normalizeStoredOrder).filter(Boolean);

    if (!orders.length) {
      ordersContainer.innerHTML = '<div class="small" style="text-align:center; padding:20px">Không có đơn hàng.</div>';
      return;
    }

    ordersContainer.innerHTML = orders.map((o, idx) => `
      <div class="order-card" data-index="${idx}">
        <div class="order-header">
          <div>
            <strong>Đơn: ${escapeHtml(o.id)}</strong>
            <div class="order-meta">Khách: ${escapeHtml(o.customerName)} · SĐT: ${escapeHtml(o.customerPhone)}</div>
            <div class="order-meta">Địa chỉ: ${escapeHtml(o.shippingAddress)}</div>
            <div class="order-meta">Thanh toán: ${escapeHtml(o.paymentMethod)} · Trạng thái: ${escapeHtml(o.status)}</div>
          </div>
          <div>
            <button class="btn edit" data-index="${idx}">Sửa</button>
            <button class="btn delete" data-index="${idx}">Xóa</button>
          </div>
        </div>
        <div>
          <table class="items">
            <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Giá</th><th>Thành tiền</th></tr></thead>
            <tbody>
              ${o.items.map(it => `<tr>
                <td>${escapeHtml(it.name)}</td>
                <td>${escapeHtml(String(it.quantity))}</td>
                <td>${it.price ? formatCurrency(it.price) : '-'}</td>
                <td>${it.price ? formatCurrency(it.price * it.quantity) : '-'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top:8px; text-align:right; font-weight:600">Tổng: ${formatCurrency( o.totalAmount = calculateOrderTotal(o))}</div>
      </div>
    `).join('');

    // Gắn sự kiện nút Sửa và Xóa
    ordersContainer.querySelectorAll('.btn.edit').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(Number(btn.dataset.index)));
    });
    ordersContainer.querySelectorAll('.btn.delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        if (confirm(`Xác nhận xóa đơn ${orders[idx].id} ?`)) {
          deleteOrderFromHistory(idx);
          renderOrdersManagement();
        }
      });
    });
  }

  // Modal edit: lấy DOM bên trong khi cần (vì HTML được chèn động)
  function openEditModal(index) {
    const raw = getRawOrders();
    const normalized = raw.map(normalizeStoredOrder).filter(Boolean);
    if (!normalized[index]) return;
    const order = normalized[index];

    const overlay = document.getElementById('overlay');
    const editForm = document.getElementById('editForm');
    const editIdInput = document.getElementById('editId');
    const editCustomerInput = document.getElementById('editCustomer');
    const editStatusSelect = document.getElementById('editStatus');
    const editItemsTableBody = document.querySelector('#editItemsTable tbody');
    const deleteBtn = document.getElementById('deleteBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (!overlay || !editForm || !editIdInput) {
      console.warn('Modal edit chưa có trong DOM');
      return;
    }

    // Điền dữ liệu
    editIdInput.value = order.id || '';
    editCustomerInput.value = order.customerName || '';
    editStatusSelect.value = order.status || '';
    editItemsTableBody.innerHTML = order.items.map((it, i) => `
      <tr>
        <td>${escapeHtml(it.name)}</td>
        <td><input type="number" min="0" value="${escapeHtml(String(it.quantity))}" data-index="${i}" class="qty-input" style="width:100px;padding:6px;border-radius:6px;border:1px solid #d7dbe6" /></td>
        <td><button type="button" class="btn delete-item" data-index="${i}">Xóa</button></td>
      </tr>
    `).join('');

    // show modal
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');

    // gắn event xóa item
    editItemsTableBody.querySelectorAll('.btn.delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const rawArr = getRawOrders();
        rawArr[index].items.splice(idx, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rawArr));
        // refresh modal nội dung
        openEditModal(index);
      });
    });

    // submit form xử lý lưu
    function onSubmit(e) {
      e.preventDefault();
      const newId = editIdInput.value.trim();
      if (!newId) { alert('Mã đơn không được để trống'); return; }
      const rawArr = getRawOrders();
      // cập nhật id và status
      rawArr[index].id = newId;
      rawArr[index].status = editStatusSelect.value;
      // cập nhật số lượng
      const qtyInputs = editItemsTableBody.querySelectorAll('.qty-input');
      qtyInputs.forEach(inp => {
        const idx = Number(inp.dataset.index);
        let q = parseInt(inp.value, 10);
        if (isNaN(q) || q < 0) q = 0;
        if (rawArr[index].items[idx]) rawArr[index].items[idx].quantity = q;
      });
      // loại bỏ quantity 0
      rawArr[index].items = rawArr[index].items.filter(it => Number(it.quantity) > 0);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawArr));
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      editForm.removeEventListener('submit', onSubmit);
      renderOrdersManagement();
    }

    editForm.addEventListener('submit', onSubmit);

    // delete whole order
    deleteBtn && deleteBtn.addEventListener('click', () => {
      if (confirm(`Xác nhận xóa toàn bộ đơn ${order.id} ?`)) {
        deleteOrderFromHistory(index);
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
        renderOrdersManagement();
      }
    });

    // cancel
    cancelBtn && cancelBtn.addEventListener('click', () => {
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
    });

    // click ngoài đóng modal
    overlay.addEventListener('click', function handler(e) {
      if (e.target === overlay) {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.removeEventListener('click', handler);
      }
    });
  }

  function deleteOrderFromHistory(index) {
    try {
      const arr = getRawOrders();
      arr.splice(index, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      return true;
    } catch (e) {
      console.error('Lỗi xóa order', e);
      return false;
    }
  }

  // Hàm init được gọi sau khi innerHTML đã chèn xong
  function initOrdersPage() {
    renderOrdersManagement();
  }

  // Xuất hàm ra window để admin.js có thể gọi
  window.renderOrdersManagement = renderOrdersManagement;
  window.initOrdersPage = initOrdersPage;
})();

window.saveOrderToHistory = function(orderData) {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!orderData.id) orderData.id = 'ORD' + Date.now();
    if (!orderData.status) orderData.status = 'Đã giao'; // gán mặc định
    list.push(orderData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    renderOrdersManagement();
    return orderData.id;
  } catch (err) {
    console.error('Lỗi saveOrderToHistory:', err);
    return null;
  }
};