
let isAdmin = false;
let users = [];
function openADD(){
    document.getElementsByClassName("add-user")[0].style.display="block";
}
function closeADD(){
    document.getElementsByClassName("add-user")[0].style.display="none";
}

function addUser() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const username = document.getElementById('acc').value.trim();
  const password = document.getElementById('pass').value;

  // Patterns: dùng pattern toàn cục nếu đã khai báo, nếu không dùng mặc định
  const emailPattern = window.emailPattern || /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = window.phonePattern || /^0\d{9}$/; // 10 chữ số, bắt đầu 0
  const passPattern = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/; // >=6 ký tự, có chữ và số

  // 1. Kiểm tra bắt buộc
  if (!name || !email || !phone || !username || !password) {
    return alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
  }

  // 2. Kiểm tra độ dài / định dạng cơ bản
  if (name.length < 2) return alert('Tên phải có ít nhất 2 ký tự!');
  if (!emailPattern.test(email)) return alert('Email không hợp lệ!');
  if (!phonePattern.test(phone)) return alert('Số điện thoại không hợp lệ! (10 chữ số, bắt đầu bằng 0)');
  if (!passPattern.test(password)) return alert('Mật khẩu phải có ít nhất 6 ký tự và bao gồm chữ và số!');

  // 3. Lấy danh sách users hiện tại (tương thích với localStorage key 'users')
  const users = window.users || JSON.parse(localStorage.getItem('users') || '[]');

  // 4. Kiểm tra trùng lặp
  if (users.some(u => u.username === username)) return alert('Tên đăng nhập đã tồn tại!');
  if (users.some(u => u.email === email)) return alert('Email đã tồn tại!');
  if (users.some(u => u.phone === phone)) return alert('Số điện thoại đã tồn tại!');

  // 5. Tạo user mới và lưu
  const newUser = { name, email, phone, username, password, status: false };
  users.push(newUser);
  window.users = users;
  saveUsersToLocal(); // hàm của bạn lưu window.users vào localStorage
  if (typeof renderTable === 'function') renderTable(users);

  // 6. Xóa form và thông báo
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('acc').value = '';
  document.getElementById('pass').value = '';

  alert('Thêm người dùng thành công!');
  return true;
}
function searchUser() {
  const keyword = (document.getElementById('search').value || '').trim().toLowerCase();

  // Nếu ô tìm kiếm rỗng thì hiển thị toàn bộ users
  if (!keyword) {
    const all = (window.users && window.users.length) ? window.users : getUsers();
    return renderTable(all);
  }

  // Lấy danh sách users hiện tại
  const list = (window.users && window.users.length) ? window.users : getUsers();

  // Lọc an toàn theo nhiều trường
  const filtered = list.filter(user => {
    const name = (user.name || '').toLowerCase();
    const username = (user.username || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const phone = (user.phone || '').toLowerCase();

    return name.includes(keyword) ||
           username.includes(keyword) ||
           email.includes(keyword) ||
           phone.includes(keyword);
  });

  renderTable(filtered);
}

function deleteUser(index) {
    users.splice(index, 1);//bat dau xoa phan tu tu vi tri index so phan tu la 1
    saveUsersToLocal(); 
    renderTable(users);
}

function renderTable(data) {
  const tbody = document.querySelector('#userTable tbody');
  tbody.innerHTML = '';

  data.forEach((user, index) => {
  if (isAdmin) {
  tbody.innerHTML += `
    <tr>
      <td>${index + 1}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td>${user.username}</td>
      <td style="position:relative;">
        <span onclick="editPassword(${index}, this.nextElementSibling)"
              style="cursor:pointer;color:blue;position:absolute;top:50%;transform:translateY(-50%);"
              title="Chỉnh sửa mật khẩu">&#8635;</span>
        <span class="password-text" style="display:block;text-align:center;">${user.password}</span>
      </td>
      <td>
        <input type="checkbox" class="switch" ${user.status ? 'checked' : ''} 
               onchange="updateField(${index}, 'status', this.checked)">
      </td>
    </tr>
  `;
  document.querySelectorAll('.password-text').forEach((el) => {
    const icon = el.previousElementSibling;
    const width = el.offsetWidth;
    icon.style.right = `calc(50% + ${width / 2 -1}px)`; // căn theo giữa + độ dài mật khẩu
  });
}else {
      // Chế độ xem
      tbody.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
          <td>${user.username}</td>
          <td>${user.password}</td>
          <td>
            <input type="checkbox" class="switch" ${user.status ? 'checked' : ''} disabled>
          </td>
        </tr>
      `;
    }
  });
}
// function editPassword(index, span) {
//   const oldValue = span.textContent;
//   const input = document.createElement('input');
//   input.type = 'text';
//   input.value = oldValue;
//   input.style.width = "100px";
  
//   // Thay thế mật khẩu bằng ô nhập
//   span.replaceWith(input);
//   input.focus();

//   // 🔹 Tự động bôi đen toàn bộ khi focus
//   input.select();

//   // Khi rời ô nhập thì cập nhật lại mật khẩu
//   input.addEventListener('blur', () => {
//     const newValue = input.value.trim();
//     users[index].password = newValue;
//     const newSpan = document.createElement('span');
//     newSpan.textContent = newValue;
//     input.replaceWith(newSpan);
//     saveUsersToLocal(); 
//   });

//   // Nhấn Enter cũng lưu lại
//   input.addEventListener('keydown', (e) => {
//     if (e.key === 'Enter') {
//       input.blur();
//       saveUsersToLocal(); 
//     }
//   });
// }
let editingId = null;

function editPassword(identifier, span) {
  const list = window.users || getUsers();
  if (!Array.isArray(list)) return;

  // Tìm index theo id hoặc theo index cũ
  let idx = -1;
  if (typeof identifier === 'number') {
    idx = list.findIndex(u => u.id === identifier);
    if (idx === -1 && identifier >= 0 && identifier < list.length) idx = identifier;
  } else {
    idx = list.findIndex(u => String(u.id) === String(identifier));
  }
  if (idx === -1) return;

  // Ngăn sửa nhiều hàng cùng lúc
  if (editingId !== null && editingId !== list[idx].id) {
    alert('Đang có hàng khác đang sửa. Hoàn tất hoặc hủy trước khi sửa hàng này.');
    return;
  }
  editingId = list[idx].id;

  // Tìm span nếu không truyền đúng
  if (!span || !(span instanceof Element)) {
    const row = document.querySelector(`#userTable tbody tr[data-id="${list[idx].id}"]`);
    span = row ? row.querySelector('.password-text') : null;
    if (!span) { editingId = null; return; }
  }

  const oldValue = span.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldValue;
  input.className = 'edit-password-input';
  input.style.width = '120px';
  input.style.boxSizing = 'border-box';

  // Element hiển thị lỗi inline
  const errorEl = document.createElement('small');
  errorEl.style.color = 'red';
  errorEl.style.display = 'block';
  errorEl.style.marginTop = '4px';
  errorEl.textContent = '';

  // Thay span bằng input + error
  span.replaceWith(input);
  input.insertAdjacentElement('afterend', errorEl);
  input.focus();
  input.select();

  function finish(newValue) {
    list[idx].password = newValue;
    window.users = list;
    saveUsersToLocal();
    editingId = null;
    if (typeof renderTable === 'function') renderTable(window.users);
  }

  function cancel() {
    const newSpan = document.createElement('span');
    newSpan.className = 'password-text';
    newSpan.textContent = oldValue;
    input.nextSibling && input.nextSibling.remove(); // remove errorEl nếu còn
    input.replaceWith(newSpan);
    editingId = null;
  }

  // Blur: chỉ commit khi khác giá trị; nếu rỗng revert; nếu invalid show inline error
  input.addEventListener('blur', () => {
    const newValue = input.value.trim();

    // Nếu không thay đổi thì revert mà không validate
    if (newValue === oldValue) {
      cancel();
      return;
    }

    // Nếu rỗng thì revert
    if (newValue === '') {
      errorEl.textContent = 'Mật khẩu không được để trống.';
      input.focus();
      input.select();
      return;
    }

    // Validation: ví dụ tối thiểu 6 ký tự
    if (newValue.length < 6) {
      errorEl.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
      input.focus();
      input.select();
      return;
    }

    // Thành công
    errorEl.textContent = '';
    finish(newValue);
  });

  // Enter lưu, Escape hủy
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur(); // blur sẽ gọi commit logic ở trên
    } else if (e.key === 'Escape') {
      cancel();
    }
  });
}

function toggleStatus(index, value) {
  users[index].status = value;
  console.log(`User ${users[index].name} status: ${value}`);
}

function saveUser(index) {
  users[index].isEditing = false;
  saveUsersToLocal();
  renderTable(users);
}

function updateField(identifier, field, value) {
  // Lấy danh sách hiện tại
  const list = Array.isArray(window.users) && window.users.length ? window.users : getUsers();

  // Tìm index thực theo id hoặc index
  let idx = -1;
  if (typeof identifier === 'number') {
    // ưu tiên tìm theo id
    idx = list.findIndex(u => u.id === identifier);
    // nếu không có id trùng, coi identifier là index mảng (tương thích cũ)
    if (idx === -1 && identifier >= 0 && identifier < list.length) idx = identifier;
  } else if (typeof identifier === 'string') {
    idx = list.findIndex(u => String(u.id) === identifier);
  } else {
    console.warn('updateField: invalid identifier', identifier);
    return false;
  }

  if (idx === -1) {
    console.warn('updateField: user not found', identifier);
    return false;
  }

  

  // Áp dụng giá trị (chuyển boolean cho status)
  list[idx][field] = (field === 'status') ? !!value : value;

  // Lưu và render
  window.users = list;
  saveUsersToLocal();
  if (typeof renderTable === 'function') renderTable(window.users);

  return true;
}


function edit(){
  const f=document.getElementById('mode').value;
  if (f=="edit") isAdmin=true;
  else isAdmin=false;
  loadUsers();
}


// Key dùng chung trong localStorage
const STORAGE_KEY = 'accounts'; 

// Load users từ localStorage, gán vào window.users, render và trả về mảng
function loadUsers() {
  const data = localStorage.getItem(STORAGE_KEY);
  let users;
  if (data) {
    try {
      users = JSON.parse(data);
      if (!Array.isArray(users)) users = [];
    } catch (err) {
      console.error('Invalid JSON in localStorage for', STORAGE_KEY, err);
      users = [];
    }
  } else {
    users = []; 
  }
  window.users = users;
  if (typeof renderTable === 'function') renderTable(users);
  return users;
}

// Lưu window.users vào localStorage (an toàn với JSON)
function saveUsersToLocal() {
  const usersToSave = Array.isArray(window.users) ? window.users : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usersToSave));
}

// Helper: lấy users trực tiếp (không phụ thuộc window.users)
function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
