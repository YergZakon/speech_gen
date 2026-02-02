import json
import anthropic
from django.conf import settings
from pathlib import Path

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS_ANALYSIS = 2000
MAX_TOKENS_SPEECH = 4000


def get_client():
    """Получение клиента Anthropic."""
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def load_examples():
    """Загрузка примеров речей."""
    try:
        examples_path = Path(settings.BASE_DIR) / 'speech_examples.json'
        with open(examples_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def extract_info(text: str) -> dict:
    """Извлечение информации из обвинительного акта."""
    client = get_client()

    prompt = f"""Проанализируй обвинительный акт и извлеки ключевую информацию.

ОБВИНИТЕЛЬНЫЙ АКТ:
{text}

Верни ТОЛЬКО валидный JSON (без markdown, без ```json) со следующими полями:
{{
    "fio": "ФИО подозреваемого",
    "date": "Дата преступления",
    "article": "Статья обвинения (например: ст. 188 ч. 3 п. 2 УК РК)",
    "previous_convictions": "Информация о судимостях или 'Не судим'",
    "circumstances": "Краткое описание обстоятельств дела (2-3 предложения)",
    "mitigating": "Смягчающие обстоятельства или 'Не установлены'",
    "aggravating": "Отягчающие обстоятельства или 'Не установлены'",
    "damage": "Сумма ущерба или 'Не указан'"
}}"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS_ANALYSIS,
        messages=[{"role": "user", "content": prompt}]
    )

    result_text = response.content[0].text.strip()
    if result_text.startswith("```"):
        lines = result_text.split("\n")
        result_text = "\n".join(lines[1:-1])

    return json.loads(result_text)


def generate_speech(data: dict) -> str:
    """Генерация обвинительной речи с учётом рассчитанного срока."""
    client = get_client()
    examples = load_examples()
    examples_text = "\n\n---\n\n".join([ex["content"] for ex in examples])

    # Извлекаем рассчитанный срок
    calculated_sentence = data.pop('calculated_sentence', None)
    calculation_params = data.pop('calculation_params', {})

    # Формируем информацию о расчёте
    calc_info = ""
    if calculated_sentence:
        stage_names = {'completed': 'Оконченное', 'attempt': 'Покушение', 'preparation': 'Приготовление'}
        stage_display = stage_names.get(calculation_params.get('stage'), 'Оконченное')
        mitigating_display = 'Да' if calculation_params.get('mitigating') else 'Нет'
        aggravating_display = 'Да' if calculation_params.get('aggravating') else 'Нет'
        minor_display = 'Да' if calculation_params.get('isMinor') else 'Нет'
        agreement_display = 'Да' if calculation_params.get('agreement') else 'Нет'

        calc_info = f"""

РАССЧИТАННЫЙ СРОК НАКАЗАНИЯ: {calculated_sentence}

Параметры расчёта по ст. 188 ч.3 УК РК:
- Смягчающие обстоятельства: {mitigating_display}
- Отягчающие обстоятельства: {aggravating_display}
- Несовершеннолетний: {minor_display}
- Стадия: {stage_display}
- УДР/Процессуальное соглашение: {agreement_display}

ВАЖНО: В заключительной части речи ОБЯЗАТЕЛЬНО укажи именно этот рассчитанный срок наказания: {calculated_sentence}"""

    prompt = f"""Сгенерируй обвинительную речь прокурора для судебного заседания в Казахстане.

ИЗВЛЕЧЕННАЯ ИНФОРМАЦИЯ ИЗ ОБВИНИТЕЛЬНОГО АКТА:
{json.dumps(data, ensure_ascii=False, indent=2)}
{calc_info}

ПРИМЕРЫ ОБВИНИТЕЛЬНЫХ РЕЧЕЙ (используй как образец стиля и структуры):
{examples_text}

ШАБЛОН ОБВИНИТЕЛЬНОЙ РЕЧИ (строго следуй этой структуре):

1. ВСТУПИТЕЛЬНОЕ СЛОВО:
   "Уважаемый суд! Сегодня мы заканчиваем рассмотрение уголовного дела по обвинению [ФИО] в совершении преступления, предусмотренного [статья УК]."

2. ОСНОВНАЯ ЧАСТЬ:
   - Изложение фабулы дела с датами, суммами, обстоятельствами
   - Перечисление доказательств вины
   - Юридическая квалификация деяния
   - Указание на смягчающие обстоятельства (ст. 53 УК РК) или их отсутствие
   - Указание на отягчающие обстоятельства (ст. 54 УК РК) или их отсутствие

3. ЗАКЛЮЧЕНИЕ:
   "На основании изложенного, прошу суд:
   1. Признать [ФИО] виновным в совершении преступления, предусмотренного [статья УК].
   2. Назначить [ФИО] наказание в виде лишения свободы сроком на [РАССЧИТАННЫЙ СРОК] с отбыванием в учреждении уголовно-исполнительной системы средней безопасности.
   [При наличии ущерба] 3. Взыскать с подсудимого в пользу потерпевшего сумму причиненного ущерба."

Используй формальный юридический язык Казахстана."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS_SPEECH,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text
