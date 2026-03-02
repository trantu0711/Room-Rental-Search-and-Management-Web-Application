// Lấy danh sách các ngôi sao
const stars = document.querySelectorAll('.star');
const ratingValue = document.getElementById('rating-value');

stars.forEach((star, index) => {
  star.addEventListener('click', () => {
    // 1. Lấy giá trị của sao vừa click
    const value = star.getAttribute('data-value');
    
    // 2. Gán giá trị vào input ẩn (để gửi xuống database)
    ratingValue.value = value;

    // 3. Tô màu các ngôi sao
    stars.forEach((s, i) => {
      if (i < value) {
        s.classList.add('selected'); // Tô vàng
      } else {
        s.classList.remove('selected'); // Trả về màu xám
      }
    });
    
    console.log("Người dùng đã chọn: " + value + " sao");
  });
});

function submitReview() {
    const starCount = ratingValue.value;
    if(starCount == 0) {
        alert("Vui lòng chọn số sao!");
        return;
    }
    // Tại đây bạn sẽ viết code gửi dữ liệu lên Server (AJAX hoặc Form submit)
    alert("Đã gửi đánh giá " + starCount + " sao!");
}