


window.getLastAudioButton = function(){
    const buttons = document.querySelectorAll('button.rounded-lg.text-token-text-secondary[aria-label="Read aloud"][data-testid="voice-play-turn-action-button"]');
    return buttons[buttons.length - 1];
}

window.getLastAudioButtonIsPlaying = function(){
    const buttons = document.querySelectorAll('button.rounded-lg.text-token-text-secondary[aria-label="Stop"][data-testid="voice-play-turn-action-button"]');
    return buttons[buttons.length - 1];
}
//vc-record-button
//const buttons = document.querySelectorAll('button[id="vc-record-button"]');
window.GPTCancel = function(){
    try{
        getLastAudioButtonIsPlaying().click();
    }catch(ex){}
    
    try{
        const buttons = document.querySelectorAll('button[aria-label="Stop streaming"][data-testid="stop-button"');
        buttons[buttons.length - 1].click();
    }catch(ex){}
    
    try{
        clearInterval(window.timer);
        window.timer = null;
    }catch(ex){}
    
}

window.GPTTyping = function(message){
    const richTextArea = document.querySelector('div[contenteditable]');

    if (richTextArea) {
        // Tìm thẻ <p> bên trong rich-textarea
        const paragraph = richTextArea.querySelector('p');

        if (paragraph) {
            // Thay đổi nội dung của thẻ <p>
            paragraph.textContent = message; // Hoặc sử dụng innerHTML nếu bạn muốn thêm HTML
        }
    }
}

window.GPTSendMessage = function(message){

    const richTextArea = document.querySelector('div[contenteditable]');

    if (richTextArea) {
        // Tìm thẻ <p> bên trong rich-textarea
        const paragraph = richTextArea.querySelector('p');

        if (paragraph) {
            // Thay đổi nội dung của thẻ <p>
            paragraph.textContent = message; // Hoặc sử dụng innerHTML nếu bạn muốn thêm HTML
            console.log('Paragraph content updated to:', paragraph.textContent);
        }
    }

    

    // Đặt một khoảng thời gian chờ 1 giây (1000 ms)
    setTimeout(() => {
        // Giả sử bạn đã tìm thấy tất cả các button
        const buttons = document.querySelectorAll('button[aria-label="Send prompt"][data-testid="send-button"');

    
        const lastSendButton = buttons[buttons.length - 1]; // Lấy button cuối cùng
        console.log('Last button found:', lastSendButton);
        lastSendButton.click(); // Gọi sự kiện click trên button cuối cùng

        //lấy button cuối cùng
        const lastButton = getLastAudioButton();
        //tạo timer để check xem có sinh ra button mới nào không nếu có thì dừng timer lại vào lấy lastButton
        try{
            clearInterval(window.timer);
            window.timer = null;
        }catch(ex){}
        window.timer = setInterval(() => {
            const newLastButton = getLastAudioButton();
            if (newLastButton !== lastButton) {
                console.log("đã thấy");
                newLastButton.click();
                clearInterval(window.timer);
                window.timer = null;
                return;
            }
            console.log("khong thấy");
        }, 1000);
    }, 1000); // Thực hiện sau 1 giây
}

function playBeep() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Tạo AudioContext
    const oscillator = audioContext.createOscillator(); // Tạo bộ dao động
    
    oscillator.type = 'sine'; // Loại sóng âm (sine, square, sawtooth, triangle)
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Đặt tần số âm thanh (440Hz là âm A)
    
    oscillator.connect(audioContext.destination); // Kết nối bộ dao động với đầu ra âm thanh
    oscillator.start(); // Bắt đầu phát âm thanh
    oscillator.stop(audioContext.currentTime + 0.3); // Phát trong 0.5 giây (nửa giây)
}

// Gọi hàm playBeep để phát âm thanh

//sendMessage("Bạn có thể làm gì cho tôi");


function removeTextBeforeKeyword(text) {
    // Tìm vị trí cuối cùng của cụm từ "cho tôi hỏi"
    const keyword = "cho tôi hỏi";
    const index = text.lastIndexOf(keyword);

    // Kiểm tra nếu cụm từ có tồn tại trong chuỗi
    if (index !== -1) {
        // Cắt chuỗi từ sau vị trí "cho tôi hỏi" cuối cùng
        return text.substring(index + keyword.length).trim();
    }
    
    // Nếu không tìm thấy cụm từ, trả về chuỗi gốc
    return text;
}

window.TDLog = function(message){
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iosHandler){
        window.webkit.messageHandlers.iosHandler.postMessage(message);
    }else{
        console.log(message);
    }
}
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
class TDRecognition {
    constructor(keywords, onStart, onTalking, onDetectedKeyword, onEnd, onError, onListened) {
        
        this.recognition = new SpeechRecognition();
        window.recognition = this.recognition;

        this.sectionID = 0;
        //this.recognition.lang = 'vi-VN';
        this.recognition.interimResults = true;
        this.recognition.continuous = true;

        this.keywords = keywords.map(kw => kw.toLowerCase()); // Danh sách từ khóa
        this.isListeningForContent = false; // Trạng thái ghi âm nội dung câu hỏi
        this.silenceTimer = null; // Biến đếm thời gian im lặng
        this.isRecognitionActive = false; // Trạng thái hoạt động của recognition

        // Sự kiện tùy chỉnh
        this.onStart = onStart;
        this.onTalking = onTalking;
        this.onEnd = onEnd;
        this.onError = onError;
        this.onListened = onListened;
        this.onDetectedKeyword = onDetectedKeyword;

        // Gắn sự kiện cho recognition
        this.recognition.onstart = this.handleStart.bind(this);
        this.recognition.onresult = this.handleResult.bind(this);
        this.recognition.onerror = this.handleError.bind(this);
        this.recognition.onend = this.handleEnd.bind(this);

        // default 
        this.detectKeyword = "";
    }

    handleStart() {
        this.sectionID += 1;
        this.DetectedKeyWordSectionId = this.sectionID;
        if (this.onStart) this.onStart();
        console.log("Recognition started...");
        this.isRecognitionActive = true;
    }

    handleResult(event) {
        if (!this.isRecognitionActive) return;
        if (!this.DetectedKeyWordSectionId == this.sectionID) return;

        var transcript = event.results[0][0].transcript.trim().toLowerCase();
        this.transcript = transcript;
        clearTimeout(this.silenceTimer);
        // Kiểm tra nếu có từ khóa trong nội dung đã nhận diện
        if (this.keywords.some(keyword => transcript.includes(keyword)) && !this.isListeningForContent) {
            TDLog("Detected keyword. Starting to listen for content...");
            this.isListeningForContent = true;
            this.detectKeyword = this.keywords.find(keyword => transcript.includes(keyword));
            if (this.onDetectedKeyword) this.onDetectedKeyword(this.detectKeyword);
            //this.recognition.stop();
            //this.DetectedKeyWordSectionId = -1;
            return;
        }
        // Ghi âm nội dung nếu đã nhận diện từ khóa
        else if (this.isListeningForContent) {
            var finalTranscript = removeTextBeforeKeyword(transcript);
            this.transcript = finalTranscript;
            TDLog("Recognized: " + finalTranscript);
            if (this.onTalking) this.onTalking(finalTranscript);
            // Đặt lại timer khi có tiếng nói
            clearTimeout(this.silenceTimer);
            this.silenceTimer = setTimeout(() => {
                this.DetectedKeyWordSectionId = -1;
                TDLog("No speech for 2 seconds. Finalizing content...");
                if (this.onListened) this.onListened(this.transcript.trim(), this.detectKeyword);
                this.isListeningForContent = false; // Quay về trạng thái chờ từ khóa
                this.recognition.stop();
            }, 3000); // 5 giây im lặng
        }
    }

    handleError(event) {
        if (this.onError) this.onError(event.error);
        TDLog("Recognition error: " + event.error);
        this.isListeningForContent = false;
        this.isRecognitionActive = false;
    }

    handleEnd() {
        if (this.onEnd) this.onEnd();
        clearTimeout(this.silenceTimer);
        TDLog("Recognition ended...");
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
    ["cho tôi hỏi"],
    function(){},
    function(message) {GPTTyping(message)},
    function(keyword) {GPTCancel(); playBeep();TDLog("turnOffSystemSound");},
    () => TDLog("OnEnd: Nhận diện kết thúc."),
    function(error){TDLog("OnError: Lỗi nhận diện - " + error); TDLog("turnOnSystemSound");},
    function(capturedText, keyword){GPTSendMessage(capturedText); TDLog("turnOnSystemSound");}
);

setInterval(function() {
    if (!recognition.isRecognitionActive) {
        console.log("Nhận diện không hoạt động, khởi động lại...");
        recognition.start();
    }
}, 500); // Kiểm tra mỗi 1 giây
