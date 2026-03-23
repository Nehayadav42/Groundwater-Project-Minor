
        let sources = [];
        let chatMessages = [];

        function handleUpload() {
            // Create modal for upload options
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: #2d2d30;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                border: 1px solid #3c4043;
            `;
            
            modalContent.innerHTML = `
                <h3 style="margin-bottom: 20px; color: #e8eaed;">Choose Upload Type</h3>
                <p style="color: #9aa0a6; margin-bottom: 30px;">Select the type of content you want to upload:</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
                    <button class="upload-option-btn" onclick="uploadFile('audio')">
                        <span style="font-size: 24px; margin-bottom: 8px; display: block;">🎵</span>
                        Audio Files
                        <small style="display: block; color: #9aa0a6; margin-top: 4px;">MP3, WAV, M4A</small>
                    </button>
                    
                    <button class="upload-option-btn" onclick="uploadFile('video')">
                        <span style="font-size: 24px; margin-bottom: 8px; display: block;">🎥</span>
                        Video Files
                        <small style="display: block; color: #9aa0a6; margin-top: 4px;">MP4, AVI, MOV</small>
                    </button>
                    
                    <button class="upload-option-btn" onclick="uploadFile('document')">
                        <span style="font-size: 24px; margin-bottom: 8px; display: block;">📄</span>
                        Documents
                        <small style="display: block; color: #9aa0a6; margin-top: 4px;">PDF, DOCX, TXT</small>
                    </button>
                    
                    <button class="upload-option-btn" onclick="uploadText()">
                        <span style="font-size: 24px; margin-bottom: 8px; display: block;">✏️</span>
                        Text Input
                        <small style="display: block; color: #9aa0a6; margin-top: 4px;">Direct text entry</small>
                    </button>
                </div>
                
                <button onclick="closeModal()" style="background: #3c4043; color: #e8eaed; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                    Cancel
                </button>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Add styles for upload option buttons
            const style = document.createElement('style');
            style.textContent = `
                .upload-option-btn {
                    background: #1a1a1a;
                    color: #e8eaed;
                    border: 1px solid #3c4043;
                    border-radius: 8px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                }
                .upload-option-btn:hover {
                    border-color: #4285f4;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                }
            `;
            document.head.appendChild(style);
            
            window.closeModal = function() {
                document.body.removeChild(modal);
            };
            
            window.uploadFile = function(type) {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                
                switch(type) {
                    case 'audio':
                        input.accept = '.mp3,.wav,.m4a,.aac,.ogg';
                        break;
                    case 'video':
                        input.accept = '.mp4,.avi,.mov,.mkv,.webm';
                        break;
                    case 'document':
                        input.accept = '.pdf,.docx,.txt,.doc';
                        break;
                }
                
                input.onchange = function(event) {
                    const files = event.target.files;
                    for (let file of files) {
                        sources.push({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            content: null,
                            uploadType: type
                        });
                    }
                    updateUI();
                    showNotification(`Added ${files.length} ${type} file(s)`);
                    closeModal();
                };
                
                input.click();
            };
            
            window.uploadText = function() {
                closeModal();
                showTextInputModal();
            };
        }

        function updateUI() {
            const sourceCount = document.querySelector('.source-count span');
            const chatInput = document.querySelector('.chat-input');
            const chatContent = document.querySelector('.chat-content');
            
            sourceCount.textContent = `${sources.length} sources`;
            
            if (sources.length > 0) {
                chatInput.disabled = false;
                chatInput.placeholder = "Ask in Hindi (हिन्दी) or English...";
                chatContent.innerHTML = '<div style="padding: 20px; text-align: center; color: #9aa0a6;">Start chatting about your sources in Hindi or English</div>';
                updateSourcesList();
            }
        }

        function updateSourcesList() {
            const sidebarContent = document.querySelector('.sidebar-content');
            
            if (sources.length > 0) {
                sidebarContent.innerHTML = sources.map((source, index) => {
                    const typeIcon = getTypeIcon(source.uploadType || getFileType(source.name));
                    return `
                        <div style="background: #1a1a1a; border: 1px solid #3c4043; border-radius: 8px; padding: 12px; margin-bottom: 8px; text-align: left;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <span style="font-size: 16px;">${typeIcon}</span>
                                <div style="font-weight: 500; font-size: 14px; flex: 1;">${source.name}</div>
                                <button onclick="removeSource(${index})" style="background: none; border: none; color: #ea4335; cursor: pointer; padding: 4px;">×</button>
                            </div>
                            <div style="color: #9aa0a6; font-size: 12px; margin-left: 24px;">
                                ${formatFileSize(source.size)} • ${source.uploadType || getFileType(source.name)}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        function getTypeIcon(type) {
            const icons = {
                'audio': '🎵',
                'video': '🎥', 
                'document': '📄',
                'text': '✏️',
                'pdf': '📕',
                'default': '📄'
            };
            return icons[type] || icons.default;
        }

        function getFileType(filename) {
            const ext = filename.split('.').pop().toLowerCase();
            const types = {
                'mp3': 'audio', 'wav': 'audio', 'm4a': 'audio', 'aac': 'audio',
                'mp4': 'video', 'avi': 'video', 'mov': 'video', 'mkv': 'video',
                'pdf': 'pdf',
                'txt': 'text', 'doc': 'document', 'docx': 'document'
            };
            return types[ext] || 'document';
        }

        function removeSource(index) {
            sources.splice(index, 1);
            updateUI();
            if (sources.length === 0) {
                resetToEmptyState();
            }
        }

        function resetToEmptyState() {
            const sidebarContent = document.querySelector('.sidebar-content');
            const chatInput = document.querySelector('.chat-input');
            const chatContent = document.querySelector('.chat-content');
            
            sidebarContent.innerHTML = `
                <div class="empty-state-icon">📄</div>
                <div class="empty-state-title">Saved sources will appear here</div>
                <div class="empty-state-desc">
                    Click Add source above to add PDFs, websites, text, videos or audio files. Or import a file directly from Google Drive.
                </div>
            `;
            
            chatInput.disabled = true;
            chatInput.placeholder = "Upload a source to get started";
            chatContent.innerHTML = `
                <div class="chat-empty-title">Add a source to get started</div>
                <button class="upload-btn" onclick="handleUpload()">Upload a source</button>
            `;
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function createAudioOverview() {
            if (sources.length === 0) {
                showNotification('Please add sources first');
                return;
            }
            showNotification('Creating Audio Overview... This may take a few minutes');
            setTimeout(() => {
                showNotification('Audio Overview created successfully!');
            }, 3000);
        }

        function selectFeature(feature) {
            if (sources.length === 0) {
                showNotification('Please add sources first');
                return;
            }
            
            const features = {
                audio: 'Audio Overview',
                video: 'Video Overview', 
                mindmap: 'Mind Map',
                reports: 'Report'
            };
            
            showNotification(`Creating ${features[feature]}...`);
        }

        function addNote() {
            const note = prompt('Enter your note:');
            if (note) {
                showNotification('Note added successfully');
            }
        }

        function showTextInputModal() {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: #2d2d30;
                border-radius: 12px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                border: 1px solid #3c4043;
            `;
            
            modalContent.innerHTML = `
                <h3 style="margin-bottom: 20px; color: #e8eaed;">Add Text Content</h3>
                <p style="color: #9aa0a6; margin-bottom: 20px;">Enter your text content in Hindi (हिन्दी) or English:</p>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; color: #e8eaed;">Title:</label>
                    <input type="text" id="textTitle" placeholder="Enter title..." style="
                        width: 100%;
                        background: #1a1a1a;
                        border: 1px solid #3c4043;
                        border-radius: 6px;
                        padding: 12px;
                        color: #e8eaed;
                        font-size: 14px;
                        margin-bottom: 15px;
                    ">
                    
                    <label style="display: block; margin-bottom: 10px; color: #e8eaed;">Content:</label>
                    <textarea id="textContent" placeholder="Enter your content in Hindi or English..." style="
                        width: 100%;
                        height: 200px;
                        background: #1a1a1a;
                        border: 1px solid #3c4043;
                        border-radius: 6px;
                        padding: 12px;
                        color: #e8eaed;
                        font-size: 14px;
                        font-family: inherit;
                        resize: vertical;
                    "></textarea>
                    
                    <div style="margin-top: 10px; color: #9aa0a6; font-size: 12px;">
                        Supports: English and हिन्दी text
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="closeTextModal()" style="
                        background: #3c4043;
                        color: #e8eaed;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">Cancel</button>
                    
                    <button onclick="saveTextContent()" style="
                        background: #4285f4;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">Add Content</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            window.closeTextModal = function() {
                document.body.removeChild(modal);
            };
            
            window.saveTextContent = function() {
                const title = document.getElementById('textTitle').value.trim();
                const content = document.getElementById('textContent').value.trim();
                
                if (!title || !content) {
                    showNotification('Please enter both title and content');
                    return;
                }
                
                // Basic validation for Hindi/English content
                const hindiRegex = /[\u0900-\u097F]/;
                const englishRegex = /[a-zA-Z]/;
                
                if (!hindiRegex.test(content) && !englishRegex.test(content)) {
                    showNotification('Please enter content in Hindi or English only');
                    return;
                }
                
                sources.push({
                    name: title + '.txt',
                    type: 'text/plain',
                    size: new Blob([content]).size,
                    content: content,
                    uploadType: 'text'
                });
                
                updateUI();
                showNotification('Text content added successfully');
                closeTextModal();
            };
        }
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: #2d2d30;
                color: #e8eaed;
                padding: 12px 20px;
                border-radius: 8px;
                border: 1px solid #4285f4;
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Handle chat input with language validation
        document.querySelector('.chat-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !this.disabled && this.value.trim()) {
                const message = this.value.trim();
                
                // Validate if message contains only Hindi or English
                const hindiRegex = /[\u0900-\u097F]/;
                const englishRegex = /[a-zA-Z]/;
                const allowedCharsRegex = /^[\u0900-\u097F\sa-zA-Z0-9.,?!'"()\-–—।]+$/;
                
                if (!allowedCharsRegex.test(message)) {
                    showNotification('Please use only Hindi (हिन्दी) or English text');
                    return;
                }
                
                this.value = '';
                
                // Add message to chat
                const chatContent = document.querySelector('.chat-content');
                if (chatContent.querySelector('.chat-empty-title')) {
                    chatContent.innerHTML = '';
                    chatContent.style.display = 'block';
                    chatContent.style.padding = '20px';
                    chatContent.style.minHeight = '400px';
                }
                
                chatContent.innerHTML += `
                    <div style="margin: 10px 0; display: flex; justify-content: flex-end;">
                        <div style="background: #4285f4; color: white; padding: 12px 16px; border-radius: 18px; border-bottom-right-radius: 4px; max-width: 70%; word-wrap: break-word;">
                            ${message}
                        </div>
                    </div>
                    <div style="margin: 10px 0; display: flex; justify-content: flex-start;">
                        <div style="background: #2d2d30; color: #e8eaed; padding: 12px 16px; border-radius: 18px; border-bottom-left-radius: 4px; max-width: 70%;">
                            <div class="loading">Analyzing your sources...</div>
                        </div>
                    </div>
                `;
                chatContent.scrollTop = chatContent.scrollHeight;
                
                setTimeout(() => {
                    const loadingMsg = chatContent.querySelector('.loading');
                    if (loadingMsg) {
                        const responses = [
                            `आपके ${sources.length} स्रोतों के आधार पर, यहाँ जानकारी है...`,
                            `Based on your ${sources.length} source(s), here's what I found...`,
                            `मैंने आपके डेटा का विश्लेषण किया है। यह एक नमूना उत्तर है।`,
                            `I've analyzed your content. This is a simulated response with multilingual support.`
                        ];
                        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                        loadingMsg.textContent = randomResponse;
                        loadingMsg.classList.remove('loading');
                    }
                }, 2000);
            }
        });

        // Send button functionality
        document.querySelector('.send-btn').addEventListener('click', function() {
            const input = document.querySelector('.chat-input');
            if (!input.disabled && input.value.trim()) {
                input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));
            }
        });
