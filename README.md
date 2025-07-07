# Gaming News Aggregator

Простое веб-приложение на Flask, которое собирает игровые новости по RSS, а также отображает текущие скидки и бесплатные раздачи игр.

## Установка и запуск

1. Cклонируйте репозиторий или загрузите исходники.
2. Создайте виртуальное окружение (рекомендовано):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```
4. Запустите приложение:
   ```bash
   python app.py
   ```
5. Откройте браузер и перейдите по адресу `http://localhost:5000`.

## Структура проекта

- `app.py` — основной файл Flask-приложения.
- `templates/` — HTML-шаблоны Jinja2.
- `static/css/style.css` — простые стили.
- `requirements.txt` — список Python-зависимостей.

## Источники данных

- RSS-ленты игровых порталов: IGN, GameSpot, Polygon.
- API скидок и бесплатных игр: [CheapShark](https://www.cheapshark.com/).

## Лицензия

Проект предоставляется «как есть» без каких-либо гарантий.

## Работа с современным React-фронтендом (Vite + MUI)

1. Перейдите в каталог `frontend`:
   ```bash
   cd frontend
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Запустите режим разработки (по умолчанию порт 5173):
   ```bash
   npm run dev
   ```
   Запросы к API (`/api/*`) будут проксироваться к backend, если Vite и Flask запущены параллельно.
4. Сборка production-бандла и копирование его в `static/react/` (Flask будет раздавать содержимое):
   ```bash
   npm run build
   ```
   После успешной сборки перезапустите Flask-сервер и откройте `http://localhost:5173`. 