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
    """Генерация обвинительной речи."""
    client = get_client()
    examples = load_examples()
    examples_text = "\n\n---\n\n".join([ex["content"] for ex in examples])

    prompt = f"""Сгенерируй обвинительную речь прокурора для судебного заседания в Казахстане.

ИЗВЛЕЧЕННАЯ ИНФОРМАЦИЯ ИЗ ОБВИНИТЕЛЬНОГО АКТА:
{json.dumps(data, ensure_ascii=False, indent=2)}

ПРИМЕРЫ ОБВИНИТЕЛЬНЫХ РЕЧЕЙ (используй как образец стиля и структуры):
{examples_text}

ТРЕБОВАНИЯ К РЕЧИ:
1. Вступление: обращение к суду, ФИО подсудимого, статья обвинения
2. Изложение фактов: даты, суммы, обстоятельства преступления
3. Анализ доказательств: перечисление доказательств вины
4. Юридическая квалификация: правовая оценка деяния
5. Обоснование наказания: учет смягчающих/отягчающих обстоятельств
6. Заключение: конкретный запрос о сроке наказания и возмещении ущерба

Используй формальный юридический язык. Укажи конкретный срок наказания на основе санкции статьи УК РК."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS_SPEECH,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text
