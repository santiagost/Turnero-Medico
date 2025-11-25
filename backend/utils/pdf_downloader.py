
from fpdf import FPDF
from datetime import datetime

class PDFReport(FPDF):
    def header(self):
        # Título
        self.set_font('Helvetica', 'B', 16)
        self.cell(0, 10, 'Reporte de Rendimiento Médico', align='C')
        self.ln(20) # Salto de línea

    def footer(self):
        # Pie de página con número
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Página {self.page_no()}', align='C')

def generar_pdf_rendimiento(datos: list, fecha_desde: str, fecha_hasta: str, info_extra: str = None) -> bytes:
    """
    Recibe la lista de diccionarios (igual que el JSON) y devuelve los bytes del PDF.
    """
    pdf = PDFReport()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # --- INFO DEL REPORTE ---
    pdf.set_font("Helvetica", size=10)
    pdf.cell(0, 10, f"Generado el: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True)
    pdf.cell(0, 10, f"Período: {fecha_desde} al {fecha_hasta}", ln=True)
    pdf.ln(5)

    if info_extra:
        pdf.set_font("Helvetica", 'B', 11) # Negrita y un poco más grande
        pdf.cell(0, 10, f"Profesional: {info_extra}", ln=True)
    
    pdf.ln(5)

    # --- ENCABEZADOS DE LA TABLA ---
    # Definimos anchos de columnas: Fecha, Hora, Paciente, O.Social, Estado
    anchos = [25, 20, 60, 40, 30] 
    headers = ["Fecha", "Hora", "Paciente", "Obra Social", "Estado"]
    
    pdf.set_font("Helvetica", 'B', 10)
    pdf.set_fill_color(200, 220, 255) # Color azulito de fondo
    
    for i, header in enumerate(headers):
        # cell(ancho, alto, texto, borde, salto_linea, alineacion, llenar_fondo)
        pdf.cell(anchos[i], 10, header, border=1, align='C', fill=True)
    
    pdf.ln() # Salto de línea después del encabezado

    # --- CUERPO DE LA TABLA ---
    pdf.set_font("Helvetica", size=9)
    
    for fila in datos:
        try:
            # 1. NO HACEMOS SPLIT. El SQL ya devuelve DATE y TIME limpios.
            fecha = str(fila['fecha'])
            hora = str(fila['hora'])
            
            # Codificación para tildes (Latin-1)
            paciente = str(fila['paciente']).encode('latin-1', 'replace').decode('latin-1')
            os_val = str(fila['obra_social']).encode('latin-1', 'replace').decode('latin-1')
            estado = str(fila['estado']).encode('latin-1', 'replace').decode('latin-1')

        except Exception as e:
            # print(f"Error fila: {e}") # Descomentar para debug
            
            # 2. DEFINIMOS VALORES POR DEFECTO PARA TODO SI FALLA
            fecha = str(fila.get('fecha', '-'))
            hora = str(fila.get('hora', '-'))
            paciente = str(fila.get('paciente', '-'))
            os_val = str(fila.get('obra_social', '-'))
            estado = str(fila.get('estado', '-'))

        # Dibujamos las celdas
        pdf.cell(anchos[0], 10, fecha, border=1, align='C')
        pdf.cell(anchos[1], 10, hora, border=1, align='C')
        pdf.cell(anchos[2], 10, paciente, border=1, align='L')
        pdf.cell(anchos[3], 10, os_val, border=1, align='L') 
        pdf.cell(anchos[4], 10, estado, border=1, align='C')
        
        pdf.ln() 

    return pdf.output()