import { router } from 'expo-router';
import { Aviso, Botao, Cabecalho, Tela, Titulo } from '../componentes/Interface';
export default function Conta() { return <Tela><Cabecalho voltar /><Titulo>Seu espaço no bairro.</Titulo><Aviso>Você pode explorar serviços e salvar favoritos sem uma conta. O acesso para anunciantes estará disponível quando o serviço de publicação for configurado.</Aviso><Botao titulo="Privacidade e uso" secundario aoPressionar={() => router.push('/privacidade')} /></Tela>; }
