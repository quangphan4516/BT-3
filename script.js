// Biến toàn cục để lưu trạng thái
let allProducts = [];       // Dữ liệu gốc từ API
let filteredProducts = [];  // Dữ liệu sau khi tìm kiếm/sắp xếp
let currentPage = 1;        // Trang hiện tại
let itemsPerPage = 5;       // Số dòng mỗi trang (mặc định 5)

// Hàm khởi chạy ban đầu (Hàm getall như yêu cầu)
async function getAllProducts() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        const data = await response.json();
        
        // Lưu dữ liệu vào biến toàn cục
        allProducts = data;
        filteredProducts = [...allProducts]; // Ban đầu lọc = gốc

        // Render lần đầu
        renderTable();
        renderPagination();
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        document.getElementById('tableBody').innerHTML = '<tr><td colspan="5">Lỗi kết nối API</td></tr>';
    }
}

// Hàm hiển thị bảng (Core Logic)
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    // 1. Tính toán phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredProducts.slice(startIndex, endIndex);

    // 2. Render từng dòng
    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Không tìm thấy sản phẩm</td></tr>';
        return;
    }

    pageData.forEach(product => {
        // Xử lý hiển thị toàn bộ hình ảnh
        let imagesHtml = '<div class="img-container">';
        if (product.images && Array.isArray(product.images)) {
            product.images.forEach(imgUrl => {
                // Xử lý lỗi ảnh sạch một chút (API này thỉnh thoảng trả về chuỗi JSON stringify)
                let cleanUrl = imgUrl.replace(/["\[\]]/g, ''); 
                imagesHtml += `<img src="${cleanUrl}" class="product-img" alt="img" onerror="this.style.display='none'">`;
            });
        }
        imagesHtml += '</div>';

        const row = `
            <tr>
                <td>${product.id}</td>
                <td>${imagesHtml}</td>
                <td>${product.title}</td>
                <td>$${product.price}</td>
                <td>${product.description.substring(0, 50)}...</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    // Cập nhật lại thông tin phân trang
    renderPagination();
}

// Xử lý tìm kiếm (OnChange / OnInput)
function handleSearch() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    
    // Lọc dữ liệu từ mảng gốc
    filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(keyword)
    );

    currentPage = 1; // Reset về trang 1 khi tìm kiếm
    renderTable();
}

// Xử lý thay đổi số lượng hiển thị (5, 10, 20)
function handlePageSizeChange() {
    const select = document.getElementById('pageSize');
    itemsPerPage = parseInt(select.value);
    currentPage = 1; // Reset về trang 1
    renderTable();
}

// Xử lý Sắp xếp (Giá, Tên)
function handleSort(criteria, direction) {
    filteredProducts.sort((a, b) => {
        if (criteria === 'price') {
            return direction === 'asc' ? a.price - b.price : b.price - a.price;
        } else if (criteria === 'title') {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            if (titleA < titleB) return direction === 'asc' ? -1 : 1;
            if (titleA > titleB) return direction === 'asc' ? 1 : -1;
            return 0;
        }
    });
    renderTable();
}

// Xử lý hiển thị nút phân trang
function renderPagination() {
    const paginationDiv = document.getElementById('paginationControls');
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    let html = '';

    // Nút Previous
    html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Trước</button>`;
    
    // Hiển thị số trang (Đơn giản hóa: Trang hiện tại / Tổng số)
    html += `<span style="margin: 0 10px;">Trang ${currentPage} / ${totalPages > 0 ? totalPages : 1}</span>`;

    // Nút Next
    html += `<button onclick="changePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>Sau</button>`;

    paginationDiv.innerHTML = html;
}

// Hàm chuyển trang
function changePage(newPage) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTable();
    }
}

// Gọi hàm chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', getAllProducts);