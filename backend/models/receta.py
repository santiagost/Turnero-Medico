from typing import Optional


class RecetaBase:
    def __init__(self,
                 id_consulta: int,
                 medicamento: str,
                 fecha_emision: str):
        self.id_consulta = id_consulta
        self.medicamento = medicamento
        self.fecha_emision = fecha_emision


class RecetaCreate(RecetaBase):
    def __init__(self,
                 id_consulta: int,
                 medicamento: str,
                 fecha_emision: str,
                 dosis: Optional[str] = None,
                 instrucciones: Optional[str] = None):
        super().__init__(id_consulta, medicamento, fecha_emision)
        self.dosis = dosis
        self.instrucciones = instrucciones


class RecetaUpdate:
    def __init__(self,
                 medicamento: Optional[str] = None,
                 dosis: Optional[str] = None,
                 instrucciones: Optional[str] = None):
        self.medicamento = medicamento
        self.dosis = dosis
        self.instrucciones = instrucciones


class RecetaResponse(RecetaBase):
    def __init__(self,
                 id_receta: int,
                 id_consulta: int,
                 medicamento: str,
                 fecha_emision: str,
                 dosis: Optional[str] = None,
                 instrucciones: Optional[str] = None,
                 consulta = None):  # ConsultaResponse 
        super().__init__(id_consulta, medicamento, fecha_emision)
        self.id_receta = id_receta
        self.dosis = dosis
        self.instrucciones = instrucciones
        self.consulta = consulta
        self.consulta = consulta