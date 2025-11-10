**Crear y activar entorno virtual** 
    cd ./backend

    python3 -m venv venv

    source venv/bin/activate (en linux)
    
    source venv/Scripts/activate (en windows)

**Instalar dependencias**

    python -m pip install -r ./requirements.txt


**Levantar servidor de desarrollo**

    python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000

**Desactivar entorno virtual en terminal**

    deactivate

---
