import { useEffect } from 'react';

/**
 * Un hook para detectar clics fuera de un elemento referenciado (ref).
 * @param {React.RefObject} ref - La referencia al elemento (ej. el div del menú).
 * @param {Function} handler - La función a llamar cuando se hace clic afuera.
 */
export const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // Si el clic es dentro del elemento referenciado, no hacer nada
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      // Si el clic es afuera, llamar al handler (ej. setIsOpen(false))
      handler(event);
    };

    // Añadir los event listeners
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Función de limpieza: remover los listeners
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Volver a ejecutar solo si la ref o el handler cambian
};
