// Мок данные
const mockData = {
    normative_resolutions: [
        { id: 1, number: "№ 4", date: "2023-06-29", title: "О судебной практике по делам о хищениях", category: "Хищения", summary: "Разъяснения по квалификации краж, грабежей, разбоев. Критерии разграничения форм хищения." },
        { id: 2, number: "№ 7", date: "2023-11-15", title: "О практике назначения уголовных наказаний", category: "Наказание", summary: "Принципы индивидуализации наказания, учет смягчающих и отягчающих обстоятельств." },
        { id: 3, number: "№ 2", date: "2024-03-20", title: "О судебной практике по делам о мошенничестве", category: "Мошенничество", summary: "Квалификация мошенничества, отграничение от смежных составов, особенности доказывания." },
        { id: 4, number: "№ 5", date: "2024-05-10", title: "О применении законодательства о необходимой обороне", category: "Необходимая оборона", summary: "Пределы необходимой обороны, критерии правомерности, превышение пределов." }
    ],
    verdicts: [
        { case_number: "1-245/2024", date: "2024-08-15", court: "СМУС г. Шымкент", defendant: "Касымов А.Б.", article: "ст. 188 ч. 3 п. 2", sentence: "4 года л/с" },
        { case_number: "1-189/2024", date: "2024-07-22", court: "Районный суд № 2", defendant: "Сериков Н.М.", article: "ст. 190 ч. 2", sentence: "3 года условно" },
        { case_number: "1-312/2024", date: "2024-09-03", court: "МРС Сарыаркинского р-на", defendant: "Омаров Т.К.", article: "ст. 106 ч. 1", sentence: "8 лет л/с" }
    ],
    private_rulings: [
        { number: "ЧП-45/2024", date: "2024-06-18", court: "Городской суд г. Алматы", addressee: "Начальник ДП г. Алматы", issue: "Нарушения при производстве следственных действий", recommendation: "Провести проверку и принять меры" },
        { number: "ЧП-78/2024", date: "2024-08-25", court: "Областной суд Туркестанской области", addressee: "Прокурор области", issue: "Недостаточный надзор за соблюдением законности", recommendation: "Усилить прокурорский надзор" }
    ],
    acquittals: [
        { case_number: "1-156/2024", date: "2024-05-12", court: "Районный суд Бостандыкского р-на", defendant: "Ахметов К.С.", article: "ст. 188 ч. 1", reason: "Не доказана причастность", action: "Апелляционный протест", actionClass: "protest" },
        { case_number: "1-234/2024", date: "2024-07-30", court: "Спец. суд г. Астана", defendant: "Жумабаев Б.Н.", article: "ст. 189 ч. 2", reason: "Отсутствие состава", action: "Согласие", actionClass: "agree" }
    ],
    case_returns: [
        { case_number: "1-89/2024", date: "2024-04-10", court: "МРС № 1 г. Караганды", article: "ст. 191 ч. 3", reason: "Нарушения УПК", defects: "Не указаны время и место преступления" },
        { case_number: "1-167/2024", date: "2024-06-28", court: "Районный суд Медеуского р-на", article: "ст. 188 ч. 2", reason: "Неполнота расследования", defects: "Не допрошены свидетели, нет экспертизы" },
        { case_number: "1-201/2024", date: "2024-08-05", court: "Городской суд г. Шымкент", article: "ст. 192 ч. 1", reason: "Нарушение права на защиту", defects: "Не предоставлен переводчик" }
    ]
};

// Элементы генератора
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

// Навигация
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;

        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Показываем нужную секцию
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${section}`).classList.add('active');
    });
});

// Инициализация мок данных
function initMockData() {
    renderNormativeResolutions();
    renderVerdicts();
    renderPrivateRulings();
    renderAcquittals();
    renderReturns();
}

function renderNormativeResolutions() {
    const container = document.getElementById('normative-list');
    container.innerHTML = mockData.normative_resolutions.map(item => `
        <div class="document-card">
            <div class="doc-header">
                <span class="doc-number">${item.number}</span>
                <span class="doc-date">${formatDate(item.date)}</span>
            </div>
            <div class="doc-title">${item.title}</div>
            <span class="doc-category">${item.category}</span>
            <p class="doc-summary">${item.summary}</p>
        </div>
    `).join('');
}

function renderVerdicts() {
    const tbody = document.querySelector('#verdicts-table tbody');
    tbody.innerHTML = mockData.verdicts.map(item => `
        <tr>
            <td>${item.case_number}</td>
            <td>${formatDate(item.date)}</td>
            <td>${item.court}</td>
            <td>${item.defendant}</td>
            <td>${item.article}</td>
            <td><strong>${item.sentence}</strong></td>
        </tr>
    `).join('');
}

function renderPrivateRulings() {
    const container = document.getElementById('private-list');
    container.innerHTML = mockData.private_rulings.map(item => `
        <div class="document-card">
            <div class="doc-header">
                <span class="doc-number">${item.number}</span>
                <span class="doc-date">${formatDate(item.date)}</span>
            </div>
            <div class="doc-title">${item.court}</div>
            <p class="doc-summary"><strong>Адресат:</strong> ${item.addressee}</p>
            <p class="doc-summary"><strong>Нарушение:</strong> ${item.issue}</p>
            <p class="doc-summary"><strong>Рекомендация:</strong> ${item.recommendation}</p>
        </div>
    `).join('');
}

function renderAcquittals() {
    const tbody = document.querySelector('#acquittals-table tbody');
    tbody.innerHTML = mockData.acquittals.map(item => `
        <tr>
            <td>${item.case_number}</td>
            <td>${formatDate(item.date)}</td>
            <td>${item.court}</td>
            <td>${item.defendant}</td>
            <td>${item.article}</td>
            <td>${item.reason}</td>
            <td><span class="status-tag ${item.actionClass}">${item.action}</span></td>
        </tr>
    `).join('');
}

function renderReturns() {
    const tbody = document.querySelector('#returns-table tbody');
    tbody.innerHTML = mockData.case_returns.map(item => `
        <tr>
            <td>${item.case_number}</td>
            <td>${formatDate(item.date)}</td>
            <td>${item.court}</td>
            <td>${item.article}</td>
            <td>${item.reason}</td>
            <td>${item.defects}</td>
        </tr>
    `).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

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
            headers: { 'X-CSRFToken': csrfToken },
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

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initMockData);
