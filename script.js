document.addEventListener('DOMContentLoaded', () => {
    // --- Lấy các phần tử DOM ---
    const textToTypeElement = document.getElementById('current-text');
    const textInput = document.getElementById('text-input');
    const timeDisplay = document.getElementById('time');
    const errorsDisplay = document.getElementById('errors');
    const wpmDisplay = document.getElementById('wpm');
    const restartButton = document.getElementById('restart-button');

    // Tạo và thêm khu vực lịch sử kết quả vào DOM
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'results-history';
    resultsContainer.innerHTML = '<h2>Lịch sử kết quả</h2><ul id="results-list"></ul>';
    document.querySelector('.container').appendChild(resultsContainer);
    const resultsList = document.getElementById('results-list'); // Đảm bảo lấy lại biến này

    // --- Dữ liệu văn bản luyện tập ---
    const texts = [
        "khi một ý niệm không sinh, tức là tâm không vội vàng phản ứng, không vội gắn nhãn đúng sai, hơn thua thì một không gian trống mở ra giữa ta và hoàn cảnh. trong không gian đó, ta không còn là người phản ứng theo bản năng, mà trở thành người lựa chọn. vạn duyên tịch diệt không có nghĩa là mọi thứ biến mất, mà là những ràng buộc, kỳ vọng, tổn thương bám theo các sự kiện ấy không còn ảnh hưởng đến ta nữa. hãy thử tưởng tượng: một lời phê bình gay gắt từ đồng nghiệp, nếu được tiếp nhận bởi một tâm đang đủ đầy cái tôi, sẽ ngay lập tức sinh ra tổn thương, tự vệ hay thậm chí phản công. nhưng nếu tại khoảnh khắc đó, ta nhận ra một ý niệm đang sắp sinh ý niệm tôi bị xúc phạm chẳng hạn và để nó tan đi như mây mỏng, thì lời phê bình kia chỉ là âm thanh trôi qua. ý niệm không sinh, dây chuyền phản ứng chấm dứt. đó không phải là sự trốn tránh, mà là sự tự do sâu thẳm.ứng dụng điều này trong cuộc sống không đòi hỏi phải thiền định hàng giờ hay đọc kinh sách, mà nằm ở khả năng dừng lại, nhận biết, và lựa chọn. mỗi lần ta không để cảm xúc bốc đồng chi phối, mỗi lần ta không đánh đồng bản thân với một suy nghĩ hay phản ứng nào đó, là mỗi lần ta đang thực hành một ý niệm không sinh. như thế, cuộc sống dần nhẹ đi, không phải vì bớt việc, mà vì bớt trói buộc bên trong.",
        "Cuộc sống là một cuộc phiêu lưu, và mỗi ngày là một trang mới. Hãy luôn học hỏi, bởi vì cuộc sống không ngừng dạy cho chúng ta những điều mới mẻ. Sự kiên nhẫn là chìa khóa của mọi thành công. Đừng bao giờ từ bỏ ước mơ của bạn, hãy theo đuổi chúng đến cùng. Mỗi nỗ lực nhỏ đều dẫn đến một kết quả lớn.",
        "Công nghệ thông tin đang thay đổi thế giới của chúng ta một cách nhanh chóng. Lập trình là nghệ thuật giải quyết vấn đề bằng mã. Hãy sống trọn vẹn từng khoảnh khắc và trân trọng những gì bạn có. Thử thách giúp chúng ta trở nên mạnh mẽ hơn. Bình minh luôn mang theo hy vọng mới cho mỗi ngày.",
        "Sự thay đổi là hằng số duy nhất trong vũ trụ. Đón nhận nó với tinh thần cởi mở sẽ giúp chúng ta phát triển. Khám phá những điều mới, vượt qua giới hạn của bản thân và không ngừng tiến về phía trước.",
        "Hạnh phúc không phải là đích đến, mà là hành trình. Hãy tận hưởng từng bước đi, từng khoảnh khắc nhỏ bé trong cuộc sống."
    ];

    // --- Các biến trạng thái của trò chơi ---
    let timer = null;          // Biến để lưu trữ ID của setInterval cho timer
    let startTime = 0;         // Thời điểm bắt đầu gõ (timestamp)
    let errors = 0;            // Số lỗi hiện tại
    let typedCharacters = 0;   // Tổng số ký tự đã gõ (bao gồm cả khoảng trắng)
    let isTypingStarted = false; // Cờ hiệu để biết đã bắt đầu gõ hay chưa

    // --- Hàm tiện ích ---
    function getRandomText() {
        return texts[Math.floor(Math.random() * texts.length)];
    }

    // --- Hàm tải và hiển thị văn bản mới ---
    function loadNewText() {
        textInput.value = ''; // Xóa nội dung ô nhập liệu
        const text = getRandomText();
        textToTypeElement.innerHTML = ''; // Xóa nội dung cũ của văn bản hiển thị

        // Chia văn bản thành từng ký tự và tạo thẻ span cho mỗi ký tự
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            if (index === 0) {
                span.classList.add('current'); // Đánh dấu ký tự đầu tiên là ký tự hiện tại
            }
            textToTypeElement.appendChild(span);
        });

        // Reset các chỉ số thống kê
        errors = 0;
        typedCharacters = 0;
        timeDisplay.textContent = '0';
        errorsDisplay.textContent = '0';
        wpmDisplay.textContent = '0';

        // Dừng và reset timer nếu đang chạy
        if (timer) clearInterval(timer);
        isTypingStarted = false;

        textInput.disabled = false; // Đảm bảo ô nhập liệu không bị vô hiệu hóa
        textInput.focus(); // Đặt focus vào ô nhập liệu để người dùng có thể bắt đầu gõ ngay
    }

    // --- Hàm bắt đầu đếm thời gian ---
    function startTimer() {
        startTime = new Date().getTime(); // Lấy thời gian hiện tại
        timer = setInterval(() => {
            const currentTime = new Date().getTime();
            const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
            timeDisplay.textContent = elapsedSeconds;
            updateWPM(); // Cập nhật WPM mỗi giây
        }, 1000); // Cập nhật mỗi 1 giây (1000ms)
    }

    // --- Hàm cập nhật WPM (Words Per Minute) ---
    function updateWPM() {
        const elapsedSeconds = parseInt(timeDisplay.textContent);
        if (elapsedSeconds > 0) {
            // WPM = (Số ký tự đã gõ / 5) / (Thời gian / 60)
            // Giả định trung bình 1 từ có 5 ký tự (bao gồm khoảng trắng)
            const wordsTyped = typedCharacters / 5;
            const minutes = elapsedSeconds / 60;
            const wpm = Math.round(wordsTyped / minutes);
            wpmDisplay.textContent = wpm;
        } else {
            wpmDisplay.textContent = '0';
        }
    }

    // --- Hàm lưu kết quả vào Local Storage ---
    function saveResult(time, errors, wpm, textTyped) {
        let results = JSON.parse(localStorage.getItem('typingResults')) || []; // Lấy kết quả cũ hoặc tạo mảng rỗng
        const date = new Date().toLocaleString('vi-VN'); // Lấy thời gian hiện tại định dạng Việt Nam

        const newResult = {
            date: date,
            time: time,
            errors: errors,
            wpm: wpm,
            text: textTyped // Lưu cả đoạn văn bản đã gõ để có thể xem lại sau
        };
        results.push(newResult); // Thêm kết quả mới vào mảng

        // Giới hạn số lượng kết quả lưu trữ (ví dụ: 10 kết quả gần nhất)
        if (results.length > 10) {
            results = results.slice(results.length - 10);
        }
        localStorage.setItem('typingResults', JSON.stringify(results)); // Lưu lại vào Local Storage
        displayResultsHistory(); // Cập nhật hiển thị lịch sử sau khi lưu
    }

    // --- Hàm hiển thị lịch sử kết quả từ Local Storage ---
    function displayResultsHistory() {
        resultsList.innerHTML = ''; // Xóa lịch sử cũ trên giao diện
        let results = JSON.parse(localStorage.getItem('typingResults')) || []; // Lấy dữ liệu từ Local Storage

        if (results.length === 0) {
            resultsList.innerHTML = '<li>Chưa có kết quả nào được lưu.</li>';
            return;
        }

        // Duyệt qua từng kết quả và tạo mục danh sách để hiển thị
        results.forEach((result, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div>
                    <strong>${index + 1}. ${result.date}</strong><br>
                    Thời gian: ${result.time}s, Lỗi: ${result.errors}, Tốc độ: ${result.wpm} WPM
                </div>
                <span class="delete-result" data-result-index="${index}">&times;</span>
            `;
            // Thêm data-result-index để biết mục nào sẽ bị xóa khi click
            resultsList.appendChild(listItem);
        });
    }

    // --- Xử lý sự kiện click để xóa kết quả ---
    // Sử dụng Event Delegation: Gắn lắng nghe sự kiện vào thẻ cha (resultsList)
    // để xử lý các click trên các thẻ con được tạo động.
    resultsList.addEventListener('click', (event) => {
        // Kiểm tra xem phần tử được click có phải là nút xóa không
        if (event.target.classList.contains('delete-result')) {
            const indexToDelete = parseInt(event.target.dataset.resultIndex); // Lấy index từ data-attribute

            // Hỏi xác nhận trước khi xóa
            if (confirm("Bạn có chắc chắn muốn xóa kết quả này không?")) {
                let currentResults = JSON.parse(localStorage.getItem('typingResults')) || [];

                // Kiểm tra index hợp lệ trước khi xóa
                if (indexToDelete >= 0 && indexToDelete < currentResults.length) {
                    currentResults.splice(indexToDelete, 1); // Xóa phần tử tại index đó
                    localStorage.setItem('typingResults', JSON.stringify(currentResults)); // Lưu lại vào Local Storage
                    displayResultsHistory(); // Cập nhật lại hiển thị lịch sử
                }
            }
        }
    });

    // --- Xử lý sự kiện khi người dùng gõ phím ---
    textInput.addEventListener('input', (e) => {
        // Bắt đầu timer khi người dùng gõ ký tự đầu tiên
        if (!isTypingStarted) {
            startTimer();
            isTypingStarted = true;
        }

        const typedText = textInput.value;
        const originalTextSpans = textToTypeElement.querySelectorAll('span');
        const originalText = textToTypeElement.textContent;

        errors = 0; // Reset lỗi cho mỗi lần cập nhật
        typedCharacters = typedText.length; // Cập nhật số ký tự đã gõ

        // Duyệt qua từng ký tự trong văn bản gốc để so sánh
        originalTextSpans.forEach((span, index) => {
            const charTyped = typedText[index];
            const charOriginal = originalText[index];

            // Xóa tất cả các class trạng thái cũ (correct, incorrect, current)
            span.classList.remove('correct', 'incorrect', 'current');

            if (index < typedText.length) { // Nếu ký tự đã được gõ
                if (charTyped === charOriginal) {
                    span.classList.add('correct'); // Gán class đúng nếu khớp
                } else {
                    span.classList.add('incorrect'); // Gán class sai nếu không khớp
                    errors++; // Tăng số lỗi
                }
            }
        });

        // Highlight ký tự tiếp theo cần gõ
        // Chỉ thêm class 'current' nếu chưa gõ hết văn bản
        if (typedText.length < originalText.length) {
            originalTextSpans[typedText.length].classList.add('current');
        }

        // Cập nhật hiển thị số lỗi và WPM
        errorsDisplay.textContent = errors;
        updateWPM();

        // Kiểm tra nếu người dùng đã gõ xong toàn bộ văn bản
        if (typedText.length === originalText.length) {
            clearInterval(timer); // Dừng timer

            // Loại bỏ highlight khỏi ký tự cuối cùng khi hoàn thành
            if (originalTextSpans[originalText.length - 1]) {
                originalTextSpans[originalText.length - 1].classList.remove('current');
            }

            // Hiển thị thông báo và lưu kết quả
            if (errors === 0) {
                alert(`Hoàn thành! Thời gian: ${timeDisplay.textContent}s, Lỗi: ${errors}. Tốc độ: ${wpmDisplay.textContent} WPM`);
                // Lưu kết quả vào Local Storage nếu không có lỗi
                saveResult(
                    parseInt(timeDisplay.textContent),
                    errors,
                    parseInt(wpmDisplay.textContent),
                    originalText
                );
            } else {
                alert(`Hoàn thành nhưng có lỗi! Thời gian: ${timeDisplay.textContent}s, Lỗi: ${errors}. Tốc độ: ${wpmDisplay.textContent} WPM. Hãy thử lại để đạt kết quả tốt hơn!`);
            }
            textInput.disabled = true; // Vô hiệu hóa ô nhập liệu sau khi hoàn thành
        }
    });

    // --- Xử lý nút "Thử lại" ---
    restartButton.addEventListener('click', () => {
        textInput.disabled = false; // Kích hoạt lại ô nhập liệu
        loadNewText(); // Tải văn bản mới và reset trò chơi
    });

    // --- Khởi tạo trang khi tải xong ---
    loadNewText(); // Tải văn bản đầu tiên khi trang được tải
    displayResultsHistory(); // Hiển thị lịch sử kết quả đã lưu
});