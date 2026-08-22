const museumVideos = {
  evolucao: {
    title: 'A Evolução do Futebol',
    intro: 'Uma viagem pela evolução do futebol ao longo das décadas, vista pela perspetiva do Leça FC.',
    description: 'Como o jogo mudou — regras, equipamentos, táticas e a forma como o Leça FC acompanhou essa transformação ao longo da sua história.',
    videoSrc: 'videos/evolucao_futebol.mp4',
    poster: 'videos/evolucao.jpg'
  },
  constantino: {
    title: 'Entrevista Constantino Jardim',
    intro: 'Uma das figuras históricas do futebol do Leça FC partilha as suas memórias e vivências do clube.',
    description: 'O Constantino recorda momentos marcantes, personagens inesquecíveis e o que significa carregar as cores verde e branca.',
    videoSrc: 'videos/constantino.mp4',
    poster: 'videos/constantino.jpg'
  },
  vladan: {
    title: 'Entrevista Vladan',
    intro: 'Vladan revisita os anos em que defendeu a baliza do Leça FC, entre a década de 90 e o início dos anos 2000.',
    description: 'Um retrato de um guarda-redes de referência, integrado no grupo restrito de jogadores com mais jogos na Primeira Liga pelo clube, ao lado de nomes como Constantino e Nando.',
    videoSrc: 'videos/vladan.mp4',
    poster: 'videos/vladan.jpg'
  },
  socio: {
    title: 'Entrevista Leonardo Soares',
    intro: 'Uma conversa única com Leonardo Soares, o segundo sócio mais antigo do Leça FC.',
    description: 'Leonardo Soares partilha décadas de história, de paixão e de pertença ao Leça FC — uma memória viva do clube.',
    videoSrc: 'videos/leonardo_soares.mp4',
    poster: 'videos/leonardosoares.jpg'
  },
  luisgentil: {
    title: 'Entrevista Luís Gentil',
    intro: 'Um ex-jogador do Leça FC partilha as suas memórias de carreira e a ligação ao clube.',
    description: 'Luís Gentil recorda os anos em que vestiu as cores verde e branca, os bastidores do futebol leceiro e os momentos que ficaram para sempre na sua memória.',
    videoSrc: 'videos/luis_gentil.mp4',
    poster: 'videos/luisgentil.jpg'
  }
};

const params = new URLSearchParams(window.location.search);
const videoId = params.get('id');
const selected = museumVideos[videoId] || museumVideos.evolucao;

document.title = `${selected.title} - Museu Leça FC`;
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('video-title').textContent = selected.title;
document.getElementById('intro-text').textContent = selected.intro;
document.getElementById('video-description').textContent = selected.description;
const video = document.getElementById('video-frame');
const note = document.getElementById('video-note');
video.src = selected.videoSrc;
if (selected.poster) video.poster = selected.poster;

video.addEventListener('error', () => {
  note.textContent = 'Este vídeo ainda não está disponível neste momento.';
});
