var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
class TDRecognition {
    constructor(keywords, onStart, onEnd, onError, onListened) {
        
        this.recognition = new SpeechRecognition();
        window.recognition = this.recognition;
        
        this.recognition.lang = 'vi-VN';
        this.recognition.interimResults = true;
        this.recognition.continuous = true;

        this.keywords = keywords.map(kw => kw.toLowerCase()); // Danh sách từ khóa
        this.isListeningForContent = false; // Trạng thái ghi âm nội dung câu hỏi
        this.silenceTimer = null; // Biến đếm thời gian im lặng
        this.isRecognitionActive = false; // Trạng thái hoạt động của recognition

        // Sự kiện tùy chỉnh
        this.onStart = onStart;
        this.onEnd = onEnd;
        this.onError = onError;
        this.onListened = onListened;

        // Gắn sự kiện cho recognition
        this.recognition.onstart = this.handleStart.bind(this);
        this.recognition.onresult = this.handleResult.bind(this);
        this.recognition.onerror = this.handleError.bind(this);
        this.recognition.onend = this.handleEnd.bind(this);

        // default 
        this.detectKeyword = "";
    }

    handleStart() {
        if (this.onStart) this.onStart();
        console.log("Recognition started...");
        this.isRecognitionActive = true;
    }

    handleResult(event) {
        if (!this.isRecognitionActive) return;

        var transcript = event.results[0][0].transcript.trim().toLowerCase();
        this.transcript = transcript;
        clearTimeout(this.silenceTimer);
        // Kiểm tra nếu có từ khóa trong nội dung đã nhận diện
        if (this.keywords.some(keyword => transcript.includes(keyword)) && !this.isListeningForContent) {
            console.log("Detected keyword. Starting to listen for content...");
            this.isListeningForContent = true;
            this.detectKeyword = this.keywords.find(keyword => transcript.includes(keyword));
            this.recognition.stop();
            recognition;
            return;
        }
        // Ghi âm nội dung nếu đã nhận diện từ khóa
        else if (this.isListeningForContent) {
            console.log("Recognized: " + transcript);
            // Đặt lại timer khi có tiếng nói
            clearTimeout(this.silenceTimer);
            this.silenceTimer = setTimeout(() => {
                console.log("No speech for 3 seconds. Finalizing content...");
                if (this.onListened) this.onListened(this.transcript.trim(), this.detectKeyword);
                this.isListeningForContent = false; // Quay về trạng thái chờ từ khóa
                this.recognition.stop();
            }, 3000); // 5 giây im lặng
        }
    }

    handleError(event) {
        if (this.onError) this.onError(event.error);
        console.log("Recognition error: " + event.error);
        this.isListeningForContent = false;
        this.isRecognitionActive = false;
    }

    handleEnd() {
        if (this.onEnd) this.onEnd();
        clearTimeout(this.silenceTimer);
        console.log("Recognition ended...");
        this.isRecognitionActive = false;
    }

    start() {
        this.recognition.start();
    }

    stop() {
        this.recognition.stop();
    }
}



// Khởi tạo lớp với danh sách từ khóa và các sự kiện
const recognition = new TDRecognition(
    ["cho tôi hỏi", "xin chào"],
    () => console.log("OnStart: Nhận diện bắt đầu."),
    () => console.log("OnEnd: Nhận diện kết thúc."),
    (error) => console.log("OnError: Lỗi nhận diện - " + error),
    (capturedText, keyword) => alert(`OnListened: Nội dung "${capturedText}" được nhận diện với từ khóa "${keyword}"`)
);

setInterval(function() {
    if (!recognition.isRecognitionActive) {
        console.log("Nhận diện không hoạt động, khởi động lại...");
        recognition.start();
    }
}, 1000); // Kiểm tra mỗi 1 giây
