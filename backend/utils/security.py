import bcrypt

def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(
        plain_password.encode('utf-8'), 
        bcrypt.gensalt()
    ).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def validar_contraseña(password: str) -> bool:
    """Valida que la contraseña cumpla con los requisitos mínimos"""
    if len(password) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres.")
    if not any(c.isupper() for c in password):
        raise ValueError("La contraseña debe contener al menos una letra mayúscula.")
    if not any(c.islower() for c in password):
        raise ValueError("La contraseña debe contener al menos una letra minúscula.")
    if not any(c.isdigit() for c in password):
        raise ValueError("La contraseña debe contener al menos un número.")
    return True