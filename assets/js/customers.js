
let isAdmin = false;
let users = [];
function openADD(){
    document.getElementsByClassName("add-user")[0].style.display="block";
}
function closeADD(){
    document.getElementsByClassName("add-user")[0].style.display="none";
}
function addUser() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const username=document.getElementById('acc').value;
    const password=document.getElementById('pass').value;
    if (name && email && phone && username && password) {
    users.push({ name, email, phone, username, password, status: false }); //them doi tuong vao mang
    saveUsersToLocal(); 
    renderTable(users);//cap nhat bang hien thi( tu dinh nghia)
    document.getElementById('name').value = '';//xoa thong tin tai o nhap lieu
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('acc').value = '';
    document.getElementById('pass').value = '';
    }
}

function searchUser() {
  const keyword = document.getElementById('search').value.toLowerCase();//lay noi dung nguoi nhap vao o tim kiem doi thanh chu thuong de tim kiem khong phan biet hoa thuong
  const filtered = users.filter(user => //loc mang users theo cac dieu kien
    user.name.toLowerCase().includes(keyword) || //kiem tra tu khoa co nam trong ten
    user.email.toLowerCase().includes(keyword) ||//email
    user.phone.toLowerCase().includes(keyword)
  );

  renderTable(filtered);//hien thi lai voi danh sach da loc
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
function editPassword(index, span) {
  const oldValue = span.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldValue;
  input.style.width = "100px";
  
  // Thay thế mật khẩu bằng ô nhập
  span.replaceWith(input);
  input.focus();

  // 🔹 Tự động bôi đen toàn bộ khi focus
  input.select();

  // Khi rời ô nhập thì cập nhật lại mật khẩu
  input.addEventListener('blur', () => {
    const newValue = input.value.trim();
    users[index].password = newValue;
    const newSpan = document.createElement('span');
    newSpan.textContent = newValue;
    input.replaceWith(newSpan);
    saveUsersToLocal(); 
  });

  // Nhấn Enter cũng lưu lại
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur();
      saveUsersToLocal(); 
    }
  });
}


function toggleStatus(index, value) {
  users[index].status = value;
  console.log(`User ${users[index].name} status: ${value}`);
}

function saveUser(index) {
  users[index].isEditing = false;
  renderTable(users);
}

function updateField(index, field, value) { //Cập nhật giá trị của thuộc tính (field) trong đối tượng người dùng tại vị trí index.
  users[index][field] = value;
  saveUsersToLocal(); 
}

function edit(){
  const f=document.getElementById('mode').value;
  if (f=="edit") isAdmin=true;
  else isAdmin=false;
  renderTable(users);
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
