# Сайт аналитики счетов

**Публичный адрес:** https://akuazuk.github.io/mrs-scheta/

Данные из Google Таблиц (счета Google, Meta, Яндекс, TikTok).

## Локальный просмотр

```bash
cd docs && python3 -m http.server 8080
```

Откройте http://localhost:8080

## Обновление данных

```bash
.venv/bin/python -c "
from invoice_analysis import load_all_invoices, build_analysis
import json; from pathlib import Path
# ... regenerate data.json
"
.venv/bin/python invoice_analysis.py  # полный отчёт + PDF
```

## GitHub Pages (sudnik2010)

Включите Pages в настройках репозитория: Settings → Pages → Source: `gh-pages` branch или GitHub Actions.
