import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from . import services


def index(request):
    """Главная страница."""
    return render(request, 'index.html')


@require_http_methods(["POST"])
@csrf_protect
def analyze(request):
    """API: Анализ обвинительного акта."""
    try:
        file = request.FILES.get('file')
        if not file:
            return JsonResponse({'error': 'Файл не загружен'}, status=400)

        text = file.read().decode('utf-8')
        if not text.strip():
            return JsonResponse({'error': 'Файл пустой'}, status=400)

        extracted = services.extract_info(text)
        return JsonResponse({'success': True, 'data': extracted})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Ошибка анализа документа'}, status=500)
    except Exception as e:
        return JsonResponse({'error': 'Ошибка сервиса'}, status=500)


@require_http_methods(["POST"])
@csrf_protect
def generate(request):
    """API: Генерация обвинительной речи."""
    try:
        data = json.loads(request.body)
        if not data:
            return JsonResponse({'error': 'Нет данных'}, status=400)

        speech = services.generate_speech(data)
        return JsonResponse({'success': True, 'speech': speech})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Неверный формат данных'}, status=400)
    except Exception as e:
        return JsonResponse({'error': 'Ошибка генерации'}, status=500)
