import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  
  const message = inject(NzMessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Ocurrió un error inesperado';

      if (error.status === 0) {
        errorMsg = 'No hay conexión con el servidor (Backend apagado)';
      } else {
        switch (error.status) {
          case 400: errorMsg = 'Datos incorrectos'; break;
          case 404: errorMsg = 'No se encontró la configuración o los datos'; break;
          case 500: errorMsg = 'Error interno en el servidor'; break;
          default: errorMsg = `Error: ${error.message}`;
        }
      }

      
      message.error(errorMsg);
      
     
      return throwError(() => error);
    })
  );
};
