// Элементы
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const fileNameEl = document.getElementById('file-name');
const infoSection = document.getElementById('info-section');
const resultSection = document.getElementById('result-section');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const newBtn = document.getElementById('new-btn');
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');
const speechContent = document.getElementById('speech-content');

let extractedData = null;

// Drag & Drop
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) {
        handleFile(fileInput.files[0]);
    }
});

// Обработка файла
async function handleFile(file) {
    if (!file.name.endsWith('.txt')) {
        showToast('Поддерживается только формат .txt');
        return;
    }

    fileNameEl.textContent = `📄 ${file.name}`;
    fileNameEl.classList.remove('hidden');

    showLoader('Анализирую документ...');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/analyze/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            },
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            extractedData = result.data;
            displayInfo(result.data);
            infoSection.classList.remove('hidden');
        } else {
            showToast(result.error || 'Ошибка анализа');
        }
    } catch (error) {
        showToast('Ошибка соединения');
    }

    hideLoader();
}

// Отображение информации
function displayInfo(data) {
    document.getElementById('info-fio').textContent = data.fio || '—';
    document.getElementById('info-date').textContent = data.date || '—';
    document.getElementById('info-article').textContent = data.article || '—';
    document.getElementById('info-convictions').textContent = data.previous_convictions || '—';
    document.getElementById('info-damage').textContent = data.damage || '—';
    document.getElementById('info-mitigating').textContent = data.mitigating || '—';
    document.getElementById('info-aggravating').textContent = data.aggravating || '—';
    document.getElementById('info-circumstances').textContent = data.circumstances || '—';
}

// Генерация речи
generateBtn.addEventListener('click', async () => {
    if (!extractedData) return;

    showLoader('Генерирую речь...');

    try {
        const response = await fetch('/generate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(extractedData)
        });

        const result = await response.json();

        if (result.success) {
            speechContent.textContent = result.speech;
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            showToast(result.error || 'Ошибка генерации');
        }
    } catch (error) {
        showToast('Ошибка соединения');
    }

    hideLoader();
});

// Копирование
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(speechContent.textContent);
        showToast('Скопировано!');
    } catch {
        showToast('Ошибка копирования');
    }
});

// Новый документ
newBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileNameEl.classList.add('hidden');
    infoSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    extractedData = null;
    speechContent.textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Вспомогательные функции
function showLoader(text) {
    loaderText.textContent = text;
    loader.classList.remove('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}
