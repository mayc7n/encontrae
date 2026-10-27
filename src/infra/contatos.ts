import { Linking } from 'react-native';
import { validarLinkExterno } from '../dominio/regras';

export async function abrirSite(link: string): Promise<void> {
  if (!validarLinkExterno(link)) throw new Error('Este endereço não é permitido.');
  try { await Linking.openURL(link); }
  catch { throw new Error('Não foi possível abrir o endereço. Confira sua conexão e tente novamente.'); }
}
export async function ligar(telefone: string): Promise<void> {
  if (!/^[1-9]\d{9,10}$/.test(telefone)) throw new Error('Telefone indisponível. Consulte a fonte oficial.');
  try { await Linking.openURL(`tel:+55${telefone}`); }
  catch { throw new Error('Não foi possível abrir o telefone neste aparelho.'); }
}
