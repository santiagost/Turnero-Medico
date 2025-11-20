**Crear y activar entorno virtual** 
    cd ./backend

    python3 -m venv venv

    source venv/bin/activate (en linux)
    
    source venv/Scripts/activate (en windows)

**Instalar dependencias**

    python -m pip install -r ./requirements.txt


**Inicializar y poblar la base de datos**

    python database/db_init.py

    python database/db_poblate.py

**Levantar servidor de desarrollo**

    python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000

**Desactivar entorno virtual en terminal**

    deactivate

---
