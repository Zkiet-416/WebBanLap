// history.js - Quản lý lịch sử mua hàng (ĐÃ SỬA ĐỒNG BỘ)

// ========== HÀM HIỂN THỊ TRANG LỊCH SỬ ==========
window.showHistoryPage = function() {
    const cartDetail = document.getElementById('cartDetail');
    const productDetail = document.getElementById('productDetail');
    const suggestions = document.getElementById('suggestions');
    const accessories = document.getElementById('accessories');
    const slider = document.querySelector('.slider');
    const historyPage = document.getElementById('historyPage');
    
    // Ẩn các trang khác
    if (cartDetail) cartDetail.style.display = 'none';
    if (productDetail) productDetail.style.display = 'none';
    if (suggestions) suggestions.style.display = 'none';
    if (accessories) accessories.style.display = 'none';
    if (slider) slider.style.display = 'none';
    
    // Hiển thị trang history
    if (historyPage) historyPage.style.display = 'block';
    
    // Load dữ liệu
    loadOrderHistory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 history.js đang tải...');
    loadOrderHistory();
    
    // Gắn sự kiện filter
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', filterOrders);
    }
});

// Hàm tải lịch sử đơn hàng
function loadOrderHistory() {
    const orders = getOrderHistory();
    console.log('📦 Lịch sử đơn hàng:', orders);
    renderOrders(orders);
}

// Lấy lịch sử đơn hàng từ localStorage
function getOrderHistory() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            console.log('❌ Chưa đăng nhập');
            return [];
        }
        
        const user = JSON.parse(currentUser);
        const orderHistory = localStorage.getItem(`orderHistory_${user.email}`);
        
        if (orderHistory) {
            const orders = JSON.parse(orderHistory);
            console.log(`📊 Tìm thấy ${orders.length} đơn hàng trong lịch sử`);
            return orders;
        } else {
            console.log('📝 Chưa có lịch sử đơn hàng');
            return [];
        }
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
        return [];
    }
}

// Render danh sách đơn hàng
function renderOrders(orders) {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-receipt"></i>
                <h3>Chưa có đơn hàng nào</h3>
                <p>Bạn chưa có đơn hàng nào trong lịch sử</p>
                <button class="btn-shopping" onclick="resetToHomePage()">
                    <i class="fas fa-shopping-cart"></i>
                    Mua sắm ngay
                </button>
            </div>
        `;
        return;
    }

    // Sắp xếp đơn hàng mới nhất lên đầu
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    container.innerHTML = orders.map(order => createOrderHTML(order)).join('');
}

// 🎯 TẠO HTML CHO MỘT ĐƠN HÀNG VỚI XỬ LÝ THỜI GIAN ĐÚNG CÁCH
function createOrderHTML(order) {
    // 🎯 XỬ LÝ THỜI GIAN AN TOÀN - SỬA LỖI HIỂN THỊ THỜI GIAN
    let orderDate, orderTime;
    
    try {
        // Thử parse từ ISO string (định dạng từ checkout.js)
        const dateObj = new Date(order.orderDate);
        
        // Kiểm tra xem date có hợp lệ không
        if (isNaN(dateObj.getTime())) {
            // Nếu không hợp lệ, thử parse từ các định dạng khác
            const fallbackDate = new Date(order.orderDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'));
            if (!isNaN(fallbackDate.getTime())) {
                orderDate = fallbackDate.toLocaleDateString('vi-VN');
                orderTime = fallbackDate.toLocaleTimeString('vi-VN');
            } else {
                // Fallback cuối cùng
                orderDate = 'Không xác định';
                orderTime = 'Không xác định';
            }
        } else {
            // Date hợp lệ, format bình thường
            orderDate = dateObj.toLocaleDateString('vi-VN');
            orderTime = dateObj.toLocaleTimeString('vi-VN');
        }
    } catch (e) {
        console.error('Lỗi xử lý thời gian đơn hàng:', e, order.orderDate);
        orderDate = 'Không xác định';
        orderTime = 'Không xác định';
    }
    
    return `
        <div class="order-card" data-order-id="${order.orderId}" data-status="${order.status}">
            <!-- THÊM NÚT XÓA Ở GÓC TRÊN PHẢI -->
            <button class="btn-delete-order" onclick="deleteOrderSync('${order.orderId}')" title="Xóa đơn hàng">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="order-header">
                <div class="order-info">
                    <h3>Đơn hàng #${order.orderId}</h3>
                    <div class="order-meta">
                        <span><i class="far fa-calendar"></i> ${orderDate}</span>
                        <span><i class="far fa-clock"></i> ${orderTime}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${order.shippingAddress || 'Không có địa chỉ'}</span>
                    </div>
                </div>
                <div class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </div>
            </div>
            
            <div class="order-items">
                ${order.items ? order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image || '../assets/images/default-product.jpg'}" alt="${item.name}" class="item-image" 
                             onerror="this.src='../assets/images/default-product.jpg'">
                        <div class="item-details">
                            <div class="item-name">${item.name || 'Sản phẩm không tên'}</div>
                            <div class="item-price">${formatCurrency(item.price || 0)}</div>
                        </div>
                        <div class="item-quantity">Số lượng: ${item.quantity || 0}</div>
                    </div>
                `).join('') : '<p>Không có sản phẩm</p>'}
            </div>
            
            <div class="order-footer">
                <div class="order-total">
                    Tổng cộng: ${formatCurrency(order.totalAmount || 0)}
                </div>
                <div class="order-actions">
                    ${order.status === 'completed' ? `
                        <button class="btn-action btn-reorder" onclick="continueShopping('${order.orderId}')">
                            <i class="fas fa-cart-plus"></i> Mua tiếp ngay
                        </button>
                        <button class="btn-action btn-cancel" onclick="cancelOrder('${order.orderId}')">
                            <i class="fas fa-times"></i> Hủy đơn hàng
                        </button>
                    ` : ''}
                    ${order.status === 'cancelled' ? `
                        <button class="btn-action btn-reorder" onclick="continueShopping('${order.orderId}')">
                            <i class="fas fa-cart-plus"></i> Mua tiếp ngay
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// 🎯 HÀM XÓA ĐƠN HÀNG ĐỒNG BỘ - ĐÃ SỬA
function deleteOrderSync(orderId) {
    console.log('🗑️ Xóa đơn hàng đồng bộ:', orderId);
    
    if (confirm('Bạn có chắc muốn xóa vĩnh viễn đơn hàng này?')) {
        let deletedCount = 0;
        
        // 1. Xóa trong lịch sử cá nhân (history.js)
        const orders = getOrderHistory();
        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        
        if (orderIndex > -1) {
            orders.splice(orderIndex, 1);
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                const user = JSON.parse(currentUser);
                const orderHistoryKey = `orderHistory_${user.email}`;
                localStorage.setItem(orderHistoryKey, JSON.stringify(orders));
                deletedCount++;
                console.log('✅ Đã xóa khỏi user history');
            }
        }
        
        // 2. Xóa trong hệ thống quản lý (orders-management.js)
        const allOrders = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
        const allOrdersIndex = allOrders.findIndex(o => 
            o.orderId === orderId || o.id === orderId
        );
        
        if (allOrdersIndex > -1) {
            allOrders.splice(allOrdersIndex, 1);
            localStorage.setItem('ordersHistory', JSON.stringify(allOrders));
            deletedCount++;
            console.log('✅ Đã xóa khỏi ordersHistory');
        }
        
        // 3. Cập nhật giao diện
        loadOrderHistory();
        if (typeof window.renderOrdersManagement === 'function') {
            setTimeout(() => {
                window.renderOrdersManagement();
            }, 100);
        }
        
        if (deletedCount > 0) {
            alert('✅ Đã xóa đơn hàng thành công!');
        } else {
            alert('❌ Không tìm thấy đơn hàng để xóa!');
        }
    }
}

// Thay thế hàm deleteOrder cũ
function deleteOrder(orderId) {
    deleteOrderSync(orderId);
}

// Hàm mua tiếp ngay
function continueShopping(orderId) {
    console.log('🛒 Mua tiếp ngay đơn hàng:', orderId);
    const orders = getOrderHistory();
    const order = orders.find(o => o.orderId === orderId);
    
    if (order && order.items) {
        let addedCount = 0;
        
        // Thêm tất cả sản phẩm vào giỏ hàng
        order.items.forEach(item => {
            if (typeof window.addToCart === 'function' && item.id) {
                // Thêm từng sản phẩm với số lượng
                for (let i = 0; i < (item.quantity || 1); i++) {
                    window.addToCart(item.id);
                    addedCount++;
                }
            }
        });
        
        if (addedCount > 0) {
            alert(`✅ Đã thêm ${addedCount} sản phẩm vào giỏ hàng!`);
        } else {
            alert('❌ Không thể thêm sản phẩm vào giỏ hàng!');
        }
        
        // Chuyển đến trang giỏ hàng
        if (typeof window.showCartDetail === 'function') {
            window.showCartDetail();
        }
    } else {
        alert('❌ Không tìm thấy đơn hàng hoặc sản phẩm!');
    }
}

// 🎯 HÀM CẬP NHẬT TRẠNG THÁI ĐỒNG BỘ - ĐÃ SỬA
function updateOrderStatusSync(orderId, newStatus) {
    console.log(`🔄 Cập nhật trạng thái đơn ${orderId} -> ${newStatus}`);
    
    let updated = false;
    
    // 1. Cập nhật trong lịch sử cá nhân
    const orders = getOrderHistory();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex > -1) {
        orders[orderIndex].status = newStatus;
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            const orderHistoryKey = `orderHistory_${user.email}`;
            localStorage.setItem(orderHistoryKey, JSON.stringify(orders));
            updated = true;
            console.log('✅ Đã cập nhật trong user history');
        }
    }
    
    // 2. Cập nhật trong hệ thống quản lý
    const allOrders = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
    const allOrdersIndex = allOrders.findIndex(o => 
        o.orderId === orderId || o.id === orderId
    );
    
    if (allOrdersIndex > -1) {
        allOrders[allOrdersIndex].status = newStatus;
        localStorage.setItem('ordersHistory', JSON.stringify(allOrders));
        updated = true;
        console.log('✅ Đã cập nhật trong ordersHistory');
    }
    
    // 3. Cập nhật giao diện
    if (updated) {
        loadOrderHistory();
        if (typeof window.renderOrdersManagement === 'function') {
            setTimeout(() => {
                window.renderOrdersManagement();
            }, 100);
        }
    }
    
    return updated;
}

// Hàm hủy đơn hàng
function cancelOrder(orderId) {
    console.log('❌ Hủy đơn hàng:', orderId);
    
    if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
        if (updateOrderStatusSync(orderId, 'cancelled')) {
            alert('✅ Đã hủy đơn hàng thành công!');
        } else {
            alert('❌ Không tìm thấy đơn hàng để hủy!');
        }
    }
}

// Lọc đơn hàng
function filterOrders() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (!statusFilter || !dateFilter) return;
    
    const statusValue = statusFilter.value;
    const dateValue = dateFilter.value;
    const allOrders = getOrderHistory();
    
    let filteredOrders = allOrders;
    
    // Lọc theo trạng thái
    if (statusValue !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusValue);
    }
    
    // Lọc theo thời gian
    if (dateValue !== 'all') {
        const now = new Date();
        let startDate;
        
        switch(dateValue) {
            case '7days':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case '30days':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case '3months':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case '6months':
                startDate = new Date(now.setMonth(now.getMonth() - 6));
                break;
            default:
                startDate = new Date(0); // Từ ngày đầu tiên
        }
        
        filteredOrders = filteredOrders.filter(order => {
            try {
                const orderDate = new Date(order.orderDate);
                return orderDate >= startDate;
            } catch (e) {
                return false; // Bỏ qua đơn hàng có thời gian không hợp lệ
            }
        });
    }
    
    renderOrders(filteredOrders);
}

// Hàm chuyển đổi trạng thái sang tiếng Việt
function getStatusText(status) {
    const statusMap = {
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy',
        'Mới đặt': 'Mới đặt',
        'Đang xử lý': 'Đang xử lý'
    };
    return statusMap[status] || status;
}

// Định dạng tiền
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}

// 🎯 HÀM ĐỒNG BỘ DỮ LIỆU TỪ ORDERS-MANAGEMENT - MỚI THÊM
function syncDataFromOrdersManagement() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        const user = JSON.parse(currentUser);
        const userHistoryKey = `orderHistory_${user.email}`;
        const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
        
        let userOrders = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
        let updated = false;
        
        // Đồng bộ từ ordersHistory sang user history
        ordersHistory.forEach(managementOrder => {
            const orderId = managementOrder.orderId || managementOrder.id;
            const existingUserOrder = userOrders.find(userOrder => userOrder.orderId === orderId);
            
            if (existingUserOrder) {
                // Cập nhật thông tin từ hệ thống quản lý
                existingUserOrder.status = managementOrder.status || existingUserOrder.status;
                existingUserOrder.items = managementOrder.items || existingUserOrder.items;
                existingUserOrder.totalAmount = managementOrder.totalAmount || managementOrder.total || existingUserOrder.totalAmount;
                existingUserOrder.shippingAddress = managementOrder.shippingAddress || managementOrder.address || existingUserOrder.shippingAddress;
                updated = true;
            } else if (managementOrder.customerName || managementOrder.customer) {
                // Thêm đơn hàng mới từ hệ thống quản lý
                const newUserOrder = {
                    orderId: orderId,
                    orderDate: managementOrder.orderDate || managementOrder.createdAt || new Date().toISOString(),
                    items: managementOrder.items || [],
                    totalAmount: managementOrder.totalAmount || managementOrder.total || 0,
                    shippingAddress: managementOrder.shippingAddress || managementOrder.address || '',
                    paymentMethod: managementOrder.paymentMethod || (managementOrder.payment && managementOrder.payment.methodText) || '',
                    status: managementOrder.status || 'completed'
                };
                userOrders.unshift(newUserOrder);
                updated = true;
            }
        });
        
        if (updated) {
            // Sắp xếp lại theo thời gian
            userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            localStorage.setItem(userHistoryKey, JSON.stringify(userOrders));
            console.log('✅ Đã đồng bộ dữ liệu từ orders-management');
            loadOrderHistory(); // Reload để hiển thị
        }
        
    } catch (error) {
        console.error('❌ Lỗi đồng bộ dữ liệu:', error);
    }
}

// 🎯 HÀM KIỂM TRA VÀ SỬA LỖI DỮ LIỆU - MỚI THÊM
function validateAndFixOrderData() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;
        
        const user = JSON.parse(currentUser);
        const userHistoryKey = `orderHistory_${user.email}`;
        let userOrders = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
        let fixed = false;
        
        // Sửa lỗi dữ liệu
        userOrders = userOrders.filter(order => {
            // Loại bỏ đơn hàng không có orderId
            if (!order.orderId) {
                fixed = true;
                return false;
            }
            
            // Đảm bảo có items array
            if (!order.items || !Array.isArray(order.items)) {
                order.items = [];
                fixed = true;
            }
            
            // Đảm bảo có totalAmount
            if (!order.totalAmount && order.totalAmount !== 0) {
                order.totalAmount = order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
                fixed = true;
            }
            
            return true;
        });
        
        if (fixed) {
            localStorage.setItem(userHistoryKey, JSON.stringify(userOrders));
            console.log('✅ Đã sửa lỗi dữ liệu đơn hàng');
            loadOrderHistory();
        }
        
    } catch (error) {
        console.error('❌ Lỗi kiểm tra dữ liệu:', error);
    }
}

// Tự động đồng bộ khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        validateAndFixOrderData();
        syncDataFromOrdersManagement();
    }, 1000);
});

// Export hàm để sử dụng từ file khác
window.loadOrderHistory = loadOrderHistory;
window.getOrderHistory = getOrderHistory;
window.syncDataFromOrdersManagement = syncDataFromOrdersManagement;