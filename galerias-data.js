/**
 * Configuração das galerias fotográficas do Leça FC
 *
 * Estrutura de cada galeria:
 * {
 *   title:     string — título da galeria
 *   subtitle:  string — sub-título (data, local, etc.)
 *   cloudinary: {
 *     cloudName: string — nome da cloud no Cloudinary
 *   }
 *   sections: [
 *     {
 *       id:     string — identificador único da secção
 *       title:  string — título da secção (ex: "Andebol")
 *       icon:   string — classe Font Awesome (ex: "fa-handball")
 *       tag:    string — tag Cloudinary das imagens desta secção
 *                        Endpoint: /image/list/{tag}.json
 *                        Requer "Resource list" ativo: Cloudinary > Settings > Security
 *     }
 *   ]
 * }
 *
 * URL de acesso a uma galeria: galeria.html?id=<chave>
 * Exemplo: galeria.html?id=jogo-estrelas-2026
 */

const galeriasData = {

  'jogo-estrelas-2026': {
    title: 'Jogo das Estrelas 2026',
    subtitle: 'Pavilhão Municipal de Leça da Palmeira · 28 de Março de 2026',
    cloudinary: {
      cloudName: 'otw-club-connect'
    },
    sections: [
      {
        id: 'andebol',
        title: 'Andebol',
        icon: 'fa-handball',
        tag: 'lecafc-events-starsgame-handball'
      },
      {
        id: 'basquetebol',
        title: 'Basquetebol',
        icon: 'fa-basketball',
        tag: 'lecafc-events-starsgame-basketball'
      }
    ]
  }

};
