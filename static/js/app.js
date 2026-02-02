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
const calcSection = document.getElementById('calc-section');
const resultSection = document.getElementById('result-section');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const newBtn = document.getElementById('new-btn');
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');
const speechContent = document.getElementById('speech-content');

let extractedData = null;
let calculatedSentence = null;

// Навигация
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${section}`).classList.add('active');
    });
});

// ========== КАЛЬКУЛЯТОР НАКАЗАНИЯ ==========

function calculateSentence() {
    const mitigating = document.querySelector('input[name="mitigating"]:checked')?.value === 'yes';
    const aggravating = document.querySelector('input[name="aggravating"]:checked')?.value === 'yes';
    const isMinor = document.querySelector('input[name="minor"]:checked')?.value === 'yes';
    const stage = document.getElementById('stage-select')?.value || 'completed';
    const agreement = document.querySelector('input[name="agreement"]:checked')?.value === 'yes';

    // Базовый срок: 7 лет для взрослых, 6 лет для несовершеннолетних
    let baseYears = isMinor ? 6 : 7;
    let formula = `${baseYears} лет`;
    let result = baseYears;

    // Применение ст. 55 УК РК (смягчающие без отягчающих)
    if (mitigating && !aggravating) {
        result = result * 2 / 3;
        formula = `${baseYears} лет × 2/3`;
    }

    // Стадия преступления
    if (stage === 'attempt') {
        result = result * 3 / 4;
        formula += ` × 3/4 (покушение)`;
    } else if (stage === 'preparation') {
        result = result * 1 / 2;
        formula += ` × 1/2 (приготовление)`;
    }

    // УДР / Процессуальное соглашение
    if (agreement) {
        result = result / 2;
        formula += ` ÷ 2 (УДР/соглашение)`;
    }

    // Форматирование результата
    const years = Math.floor(result);
    const months = Math.round((result - years) * 12);

    let sentenceText = '';
    if (years > 0) {
        sentenceText += `${years} ${pluralize(years, 'год', 'года', 'лет')}`;
    }
    if (months > 0) {
        if (sentenceText) sentenceText += ' ';
        sentenceText += `${months} ${pluralize(months, 'месяц', 'месяца', 'месяцев')}`;
    }
    if (!sentenceText) sentenceText = 'менее 1 месяца';

    // Обновление UI
    const formulaEl = document.getElementById('calc-formula');
    const sentenceEl = document.getElementById('calc-sentence');

    if (formulaEl) formulaEl.innerHTML = `Формула: ${formula} = <strong>${sentenceText}</strong>`;
    if (sentenceEl) sentenceEl.textContent = sentenceText;

    // Сохраняем для передачи в генератор
    calculatedSentence = {
        sentence: sentenceText,
        formula: formula,
        params: { mitigating, aggravating, isMinor, stage, agreement }
    };

    return calculatedSentence;
}

function pluralize(n, one, few, many) {
    if (n % 10 === 1 && n % 100 !== 11) return one;
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few;
    return many;
}

// Слушатели изменений параметров калькулятора
function initCalcListeners() {
    const inputs = document.querySelectorAll('#calc-section input, #calc-section select');
    inputs.forEach(input => {
        input.addEventListener('change', calculateSentence);
    });
}

// ========== РЕНДЕРИНГ МОК ДАННЫХ ==========

function initMockData() {
    renderNormativeResolutions();
    renderVerdicts();
    renderPrivateRulings();
    renderAcquittals();
    renderReturns();
}

function renderNormativeResolutions() {
    const container = document.getElementById('normative-list');
    if (!container) return;
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
    if (!tbody) return;
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
    if (!container) return;
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
    if (!tbody) return;
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
    if (!tbody) return;
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

// ========== ЗАГРУЗКА ФАЙЛА ==========

if (uploadArea) {
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
}

if (fileInput) {
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) {
            handleFile(fileInput.files[0]);
        }
    });
}

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
            calcSection.classList.remove('hidden');

            // Автозаполнение параметров из извлечённых данных
            autoFillCalcParams(result.data);

            // Инициализация слушателей калькулятора
            initCalcListeners();

            // Первый расчёт
            calculateSentence();
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

function autoFillCalcParams(data) {
    // Автоматическое определение смягчающих/отягчающих из текста
    const mitigating = data.mitigating && data.mitigating.toLowerCase() !== 'не установлены' && data.mitigating !== '—';
    const aggravating = data.aggravating && data.aggravating.toLowerCase() !== 'не установлены' && data.aggravating !== '—';

    if (mitigating) {
        const el = document.getElementById('mitigating-yes');
        if (el) el.checked = true;
    }
    if (aggravating) {
        const el = document.getElementById('aggravating-yes');
        if (el) el.checked = true;
    }
}

// ========== ГЕНЕРАЦИЯ РЕЧИ ==========

if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
        if (!extractedData) return;

        // Получаем актуальный расчёт
        const sentenceData = calculateSentence();

        showLoader('Генерирую речь...');

        try {
            const dataToSend = {
                ...extractedData,
                calculated_sentence: sentenceData.sentence,
                calculation_params: sentenceData.params
            };

            const response = await fetch('/generate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(dataToSend)
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
}

// ========== КОПИРОВАНИЕ И СБРОС ==========

if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(speechContent.textContent);
            showToast('Скопировано!');
        } catch {
            showToast('Ошибка копирования');
        }
    });
}

if (newBtn) {
    newBtn.addEventListener('click', () => {
        fileInput.value = '';
        fileNameEl.classList.add('hidden');
        infoSection.classList.add('hidden');
        calcSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        extractedData = null;
        calculatedSentence = null;
        speechContent.textContent = '';

        // Сброс параметров калькулятора
        document.getElementById('mitigating-no').checked = true;
        document.getElementById('aggravating-no').checked = true;
        document.getElementById('minor-no').checked = true;
        document.getElementById('agreement-no').checked = true;
        document.getElementById('stage-select').value = 'completed';
    });
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

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

// ========== ИНИЦИАЛИЗАЦИЯ ==========

document.addEventListener('DOMContentLoaded', () => {
    initMockData();
});
