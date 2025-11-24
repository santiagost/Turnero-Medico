
import smtplib
import time
from email.message import EmailMessage
import ssl


# esto deberia estar en un config o variable de entorno
SENDER_EMAIL = "turnerovitalis@gmail.com" # Mail del remitente
SENDER_PASSWORD = "tfos ucsg apjj srvu" # App password de Gmail


class EmailSender:
    
    def send_email(destinatario: str, asunto: str, cuerpo: str) -> bool:
        """
        Envía un correo electrónico simple.
        
        Parámetros:
        - destinatario: El email del paciente (ej: 'cliente@gmail.com')
        - asunto: El título del mail (ej: 'Recordatorio de Turno')
        - cuerpo: El texto del mensaje.
        
        Retorna:
        - True si se envió correctamente.
        - False si hubo un error.
        """
        
        # 1. Crear el objeto del mensaje
        msg = EmailMessage()
        msg.set_content(cuerpo) # Contenido del mail
        msg['Subject'] = asunto
        msg['From'] = SENDER_EMAIL
        msg['To'] = destinatario

        # 2. Conectar con el servidor de Gmail
        # Usamos SSL para seguridad
        context = ssl._create_unverified_context()  # Evita errores de certificado (no recomendado para prod)

        try:
            print(f"📧 Intentando enviar correo a {destinatario}...")
            
            # Conexión al servidor SMTP de Gmail (puerto 465)
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
                # Login
                server.login(SENDER_EMAIL, SENDER_PASSWORD)
                # Enviar
                server.send_message(msg)
            
            print("Correo enviado exitosamente.")
            return True

        except Exception as e:
            print(f"Error enviando el correo: {e}")
            return False
        

if __name__ == "__main__":
    # Esto solo se ejecuta si corres este archivo directamente
    # python backend/utils/email_sender.py
    
    print("Prueba de envío de email...")
    exito = EmailSender.send_email(
        destinatario="facu.witt@gmail.com", # <--- Pon tu mail personal aquí para probar
        asunto="VITALIS - Prueba del email_sender Turnero Médico",
        cuerpo="Hola! Si estás leyendo esto, el sistema de notificaciones funciona."
    )