// ====== CẤU HÌNH API ======
// LƯU Ý BẢO MẬT: Nhúng trực tiếp API Key vào mã client-side theo yêu cầu để người dùng ngoài không cần nhập API riêng.
// API Key này được cung cấp bởi tác giả riêng cho mục đích test/bài tập.
const API_KEY = 'AIzaSyCScgWBzk7R8Vm3PpuYJ712uBqcWVNvtXI'; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
// ==========================

const productForm = document.getElementById('productForm');
const generateBtn = document.getElementById('generateBtn');
const btnLoader = document.getElementById('btnLoader');
const btnText = document.querySelector('.btn-text');
const errorMsg = document.getElementById('errorMsg');

const resultBox = document.getElementById('resultBox');
const htmlOutputBox = document.getElementById('htmlOutputBox');
const copyBtn = document.getElementById('copyBtn');
const viewHtmlBtn = document.getElementById('viewHtmlBtn');
const outputSection = document.getElementById('outputSection');

let currentMarkdownResult = '';
let isHtmlView = false;

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Thu thập dữ liệu
    const productName = document.getElementById('productName').value.trim();
    const productFeatures = document.getElementById('productFeatures').value.trim();
    const productBenefits = document.getElementById('productBenefits').value.trim();
    const targetSEO = document.getElementById('targetSEO').value.trim();

    // Reset UI
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
    
    if(!productName || !productFeatures || !productBenefits || !targetSEO) {
        showError("Vui lòng điền đầy đủ các thông tin bắt buộc!");
        return;
    }

    if(!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError("Lỗi: Chưa cấu hình API Key trong hệ thống.");
        return;
    }

    // Xử lý Loading state
    setLoading(true);

    try {
        const result = await generateProductDescription(productName, productFeatures, productBenefits, targetSEO);
        displayResult(result);
        
        // Cuộn xuống phần kết quả trên mobile
        if(window.innerWidth <= 968) {
            outputSection.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        showError("Có lỗi xảy ra khi kết nối tới AI: " + error.message);
    } finally {
        setLoading(false);
    }
});

async function generateProductDescription(name, features, benefits, seo) {
    const prompt = `
        Bạn là một chuyên gia Marketing E-commerce và Copywriter sản phẩm chuyên nghiệp. Hãy viết mô tả sản phẩm hấp dẫn để tăng tỷ lệ chuyển đổi.

        Thông tin sản phẩm:
        - Tên sản phẩm: ${name}
        - Các tính năng chính: ${features}
        - Lợi ích cho khách hàng: ${benefits}
        - Từ khóa SEO cần tối ưu mục tiêu: ${seo}

        Yêu cầu Output (sử dụng định dạng Markdown):
        1. Phiên bản Dài (Chi tiết): Nêu rõ Tiêu đề hấp dẫn, đoạn mở đầu thu hút, danh sách gạch đầu dòng các tính năng nổi bật (kết hợp giải thích tính năng đem lại lợi ích gì), và đoạn kết thúc thúc đẩy hành động (Call to action). Tích hợp các từ khóa SEO tự nhiên.
        2. Phiên bản Ngắn gọn (Mô tả ngắn): Một đoạn văn khoảng 3-4 câu chắt lọc những tinh túy và bán điểm (selling points) mạnh nhất của sản phẩm.
        3. Phân tích tiềm năng mua hàng: Chấm điểm độ tiềm năng mua hàng (Thang điểm 1-10) kèm theo lý do ngắn gọn (1-2 đoạn) phân tích dựa trên tính năng hiện tại, lợi ích và đối tượng khách hàng phù hợp nhằm báo cáo cho quản lý bán hàng.
    `;

    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || \`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error("Dữ liệu trả về từ AI không đúng định dạng mong đợi.");
    }
}

function displayResult(markdownText) {
    currentMarkdownResult = markdownText;
    
    // Parse Markdown to HTML bằng thư viện marked.js
    const htmlContent = marked.parse(markdownText);
    
    resultBox.innerHTML = htmlContent;
    resultBox.classList.remove('empty');
    
    // Tối ưu mã HTML hiện thụ cho người xem
    htmlOutputBox.value = htmlContent.trim();

    // Enable buttons
    copyBtn.disabled = false;
    viewHtmlBtn.disabled = false;
    
    // Reset view to visual mode
    if(isHtmlView) {
        toggleViewMode();
    }
}

function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    if(isLoading) {
        btnText.textContent = 'Đang phân tích và xử lý...';
        btnLoader.style.display = 'block';
    } else {
        btnText.textContent = '✨ Tạo Mô Tả bằng AI';
        btnLoader.style.display = 'none';
    }
}

function showError(msg) {
    errorMsg.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> \${msg}\`;
    errorMsg.style.display = 'flex';
}

function toggleViewMode() {
    isHtmlView = !isHtmlView;
    if(isHtmlView) {
        resultBox.style.display = 'none';
        htmlOutputBox.style.display = 'block';
        viewHtmlBtn.textContent = 'Xem Bản Trực Quan';
    } else {
        resultBox.style.display = 'block';
        htmlOutputBox.style.display = 'none';
        viewHtmlBtn.textContent = 'Xem HTML Code';
    }
}

viewHtmlBtn.addEventListener('click', toggleViewMode);

copyBtn.addEventListener('click', () => {
    let textToCopy = isHtmlView ? htmlOutputBox.value : currentMarkdownResult;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Đã Copy\`;
        copyBtn.style.backgroundColor = '#10b981';
        copyBtn.style.color = 'white';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.backgroundColor = '';
            copyBtn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Lỗi khi copy: ', err);
        alert('Trình duyệt không hỗ trợ việc copy tự động hoặc có lỗi xảy ra.');
    });
});
