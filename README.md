## 📋 Requisitos
- Python 3.11 o 3.12
- Node.js (para el frontend)
- Ejecutar comandos en bash

**Ir a la carpeta raiz del proyecto**

---

## ⚙️ Backend (Python)

**Crear y activar entorno virtual** (ejecutar estos 2 comandos)

    python3 -m venv venv

    source venv/bin/activate (en linux)
    
    source venv/Scripts/activate (en windows)

**Instalar dependencias**

    python -m pip install -r ./backend/requirements.txt

**Ejecutar tests**

    python -m pytest -v

**Levantar servidor de desarrollo**

    python -m uvicorn app.api:app --reload --host 127.0.0.1 --port 8000

**Desactivar entorno virtual en terminal**

    deactivate

---

## 🖥️ Frontend (React)

**Ir a la carpeta del frontend** (desde la raíz)

    cd frontend

**Instalar dependencias**

    npm i

**Levantar servidor de desarrollo**

    npm run dev
