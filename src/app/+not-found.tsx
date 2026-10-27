import { router } from 'expo-router';
import { Botao, Tela, Vazio } from '../componentes/Interface';
export default function NaoEncontrado() { return <Tela><Vazio titulo="Este caminho não existe" descricao="Volte ao início para encontrar serviços e oportunidades." /><Botao titulo="Ir para o início" aoPressionar={() => router.replace('/')} /></Tela>; }
