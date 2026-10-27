import { useEffect, useState } from 'react';

export function useAgora() {
  const [agora, definirAgora] = useState(() => Date.now());
  useEffect(() => {
    const temporizador = setInterval(() => definirAgora(Date.now()), 60000);
    return () => clearInterval(temporizador);
  }, []);
  return agora;
}
