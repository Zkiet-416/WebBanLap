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
    
    // 🎯 ĐỒNG BỘ ID - Ưu tiên theo thứ tự
    const id = raw.id || raw.orderId || '';
    
    // 🎯 ĐỒNG BỘ ĐỊA CHỈ - Ưu tiên theo thứ tự
    const shippingAddress = raw.shippingAddress || raw.address || '';
    
    // Các trường khác giữ nguyên
    const customerName = raw.customerName || (raw.customer && raw.customer.name) || '';
    const customerPhone = raw.customerPhone || (raw.customer && raw.customer.phone) || '';
    const paymentMethod = raw.paymentMethod || (raw.payment && raw.payment.methodText) || '';
    const status = raw.status || 'Mới đặt';
    const itemsRaw = raw.items || [];
    const items = Array.isArray(itemsRaw) ? itemsRaw.map(it => ({
      id: it.id || '',
      name: it.name || '',
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 0),
      image: it.image || ''
    })) : [];
    const totalAmount = Number(raw.totalAmount || raw.total || 0);
    const createdAt = raw.createdAt || raw.orderDate || '';
    
    return { 
        rawOriginal: raw, 
        id, 
        customerName, 
        customerPhone, 
        shippingAddress,
        paymentMethod, 
        status, 
        items, 
        totalAmount, 
        createdAt 
    };
  }

  function calculateOrderTotal(order) {
    return (order.items || []).reduce((sum, it) => {
      const price = Number(it.price) || 0;
      const qty = Number(it.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }

  // 🎯 HÀM ĐỒNG BỘ VỚI USER HISTORY
  function syncOrderToUserHistory(updatedOrder) {
    try {
        const orderId = updatedOrder.id || updatedOrder.orderId;
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        users.forEach(user => {
            const orderHistoryKey = `orderHistory_${user.email}`;
            const userOrders = JSON.parse(localStorage.getItem(orderHistoryKey) || '[]');
            const orderIndex = userOrders.findIndex(order => order.orderId === orderId);
            
            if (orderIndex > -1) {
                // 🎯 ĐỒNG BỘ TOÀN BỘ THÔNG TIN
                userOrders[orderIndex] = {
                    ...userOrders[orderIndex],
                    
                    // 🚨 ĐỒNG BỘ SẢN PHẨM (SỐ LƯỢNG VÀ GIÁ)
                    items: updatedOrder.items.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image || ''
                    })),
                    
                    // 🚨 ĐỒNG BỘ TỔNG TIỀN
                    totalAmount: updatedOrder.totalAmount || updatedOrder.total,
                    
                    // 🚨 ĐỒNG BỘ TRẠNG THÁI
                    status: updatedOrder.status,
                    
                    // 🚨 ĐỒNG BỘ ĐỊA CHỈ (nếu có thay đổi)
                    shippingAddress: updatedOrder.shippingAddress || updatedOrder.address
                };
                
                localStorage.setItem(orderHistoryKey, JSON.stringify(userOrders));
                console.log(`✅ Đã đồng bộ đơn ${orderId} cho ${user.email}`);
            }
        });
        
        // Cập nhật giao diện history
        if (typeof window.loadOrderHistory === 'function') {
            setTimeout(() => {
                window.loadOrderHistory();
            }, 100);
        }
        
        return true;
    } catch (error) {
        console.error('Lỗi đồng bộ với user history:', error);
        return false;
    }
  }
  
  // 🎯 HÀM CẬP NHẬT ID TRONG USER HISTORY
  function updateOrderIdInUserHistory(oldOrderId, newOrderId) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        let updated = false;
        
        users.forEach(user => {
            const orderHistoryKey = `orderHistory_${user.email}`;
            const userOrders = JSON.parse(localStorage.getItem(orderHistoryKey) || '[]');
            const orderIndex = userOrders.findIndex(order => order.orderId === oldOrderId);
            
            if (orderIndex > -1) {
                userOrders[orderIndex].orderId = newOrderId;
                localStorage.setItem(orderHistoryKey, JSON.stringify(userOrders));
                console.log(`✅ Đã cập nhật ID đơn từ ${oldOrderId} -> ${newOrderId} cho ${user.email}`);
                updated = true;
            }
        });
        
        // Cập nhật giao diện history
        if (typeof window.loadOrderHistory === 'function') {
            setTimeout(() => {
                window.loadOrderHistory();
            }, 100);
        }
        
        return updated;
    } catch (error) {
        console.error('Lỗi cập nhật ID trong user history:', error);
        return false;
    }
  }

  // 🎯 HÀM XÓA TỪ USER HISTORY
  function deleteOrderFromUserHistory(orderId) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        let deletedCount = 0;
        
        users.forEach(user => {
            const orderHistoryKey = `orderHistory_${user.email}`;
            const userOrders = JSON.parse(localStorage.getItem(orderHistoryKey) || '[]');
            const updatedOrders = userOrders.filter(order => order.orderId !== orderId);
            
            if (updatedOrders.length !== userOrders.length) {
                localStorage.setItem(orderHistoryKey, JSON.stringify(updatedOrders));
                console.log(`✅ Đã xóa đơn ${orderId} khỏi lịch sử của ${user.email}`);
                deletedCount++;
            }
        });
        
        // Cập nhật giao diện history nếu đang mở
        if (typeof window.loadOrderHistory === 'function') {
            setTimeout(() => {
                window.loadOrderHistory();
            }, 100);
        }
        
        return deletedCount > 0;
    } catch (error) {
        console.error('Lỗi xóa khỏi user history:', error);
        return false;
    }
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
        <div style="margin-top:8px; text-align:right; font-weight:600">Tổng: ${formatCurrency(calculateOrderTotal(o))}</div>
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

    // 🎯 GẮN EVENT XÓA ITEM VỚI ĐỒNG BỘ
    editItemsTableBody.querySelectorAll('.btn.delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const rawArr = getRawOrders();
        
        // Lưu orderId để đồng bộ
        const orderId = rawArr[index].id || rawArr[index].orderId;
        
        rawArr[index].items.splice(idx, 1);
        
        // Tính lại tổng tiền sau khi xóa item
        const newTotal = rawArr[index].items.reduce((sum, it) => {
          const price = Number(it.price) || 0;
          const qty = Number(it.quantity) || 0;
          return sum + (price * qty);
        }, 0);
        rawArr[index].totalAmount = newTotal;
        rawArr[index].total = newTotal;
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rawArr));
        
        // 🎯 ĐỒNG BỘ THAY ĐỔI SANG USER HISTORY
        syncOrderToUserHistory(rawArr[index]);
        
        // refresh modal nội dung
        openEditModal(index);
      });
    });

    // 🎯 SUBMIT FORM XỬ LÝ LƯU VỚI ĐỒNG BỘ
    function onSubmit(e) {
      e.preventDefault();
      const newId = editIdInput.value.trim();
      if (!newId) { alert('Mã đơn không được để trống'); return; }
      const rawArr = getRawOrders();
      
      const oldOrder = rawArr[index];
      const oldOrderId = oldOrder.id || oldOrder.orderId;
      
      // cập nhật id và status
      rawArr[index].id = newId;
      rawArr[index].orderId = newId;
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
      
      // Tính lại tổng tiền
      const newTotal = rawArr[index].items.reduce((sum, it) => {
        const price = Number(it.price) || 0;
        const qty = Number(it.quantity) || 0;
        return sum + (price * qty);
      }, 0);
      rawArr[index].totalAmount = newTotal;
      rawArr[index].total = newTotal;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawArr));
      
      // 🎯 ĐỒNG BỘ VỚI USER HISTORY
      if (oldOrderId !== newId) {
        updateOrderIdInUserHistory(oldOrderId, newId);
      }
      
      // 🎯 ĐỒNG BỘ TOÀN BỘ THÔNG TIN (SỐ LƯỢNG, GIÁ, TRẠNG THÁI)
      syncOrderToUserHistory(rawArr[index]);
      
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
        const orderToDelete = arr[index];
        
        if (!orderToDelete) return false;
        
        const orderId = orderToDelete.id || orderToDelete.orderId;
        console.log('🗑️ Xóa đơn hàng từ quản lý:', orderId);
        
        if (confirm(`Xác nhận xóa toàn bộ đơn ${orderId} ?`)) {
            // 1. Xóa khỏi ordersHistory
            arr.splice(index, 1);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
            
            // 2. Xóa khỏi lịch sử cá nhân của user
            deleteOrderFromUserHistory(orderId);
            
            // 3. Cập nhật giao diện
            renderOrdersManagement();
            
            return true;
        }
        return false;
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
  
  // 🎯 XUẤT CÁC HÀM ĐỒNG BỘ ĐỂ SỬ DỤNG TỪ BÊN NGOÀI
  window.syncOrderToUserHistory = syncOrderToUserHistory;
  window.deleteOrderFromUserHistory = deleteOrderFromUserHistory;
})();

window.saveOrderToHistory = function(orderData) {
  const STORAGE_KEY = 'ordersHistory';
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // 🎯 ĐỒNG BỘ ID - QUAN TRỌNG
    const finalOrder = {
      // Đảm bảo có cả id và orderId
      id: orderData.id || orderData.orderId,
      orderId: orderData.orderId || orderData.id,
      
      // 🎯 ĐỒNG BỘ ĐỊA CHỈ - QUAN TRỌNG
      shippingAddress: orderData.shippingAddress || orderData.address,
      address: orderData.address || orderData.shippingAddress,
      
      // Các trường khác giữ nguyên
      customerName: orderData.customerName || (orderData.customer && orderData.customer.name),
      customerPhone: orderData.customerPhone || (orderData.customer && orderData.customer.phone),
      paymentMethod: orderData.paymentMethod || (orderData.payment && orderData.payment.methodText),
      items: orderData.items,
      totalAmount: orderData.totalAmount || orderData.total,
      total: orderData.total || orderData.totalAmount,
      createdAt: orderData.createdAt || orderData.orderDate,
      orderDate: orderData.orderDate || orderData.createdAt,
      status: orderData.status || 'Mới đặt'
    };
    
    list.push(finalOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    
    if (typeof window.renderOrdersManagement === 'function') {
      window.renderOrdersManagement();
    }
    
    return finalOrder.id;
  } catch (err) {
    console.error('Lỗi saveOrderToHistory:', err);
    return null;
  }
};