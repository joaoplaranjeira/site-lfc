const museumVideos = {
  evolucao: {
    title: 'A Evolução do Futebol',
    intro: 'Uma viagem pela evolução do futebol ao longo das décadas, vista pela perspetiva do Leça FC.',
    description: 'Como o jogo mudou — regras, equipamentos, táticas e a forma como o Leça FC acompanhou essa transformação ao longo da sua história.',
    videoSrc: 'videos/evolucao_futebol.mp4',
    poster: 'videos/evolucao.jpg'
  },
  constantino: {
    title: 'Entrevista com o Constantino',
    intro: 'Uma das figuras históricas do futebol do Leça FC partilha as suas memórias e vivências do clube.',
    description: 'O Constantino recorda momentos marcantes, personagens inesquecíveis e o que significa carregar as cores verde e branca.',
    videoSrc: 'videos/constantino.mp4',
    poster: 'videos/constantino.jpg'
  },
  socio: {
    title: 'Entrevista com Leonardo Soares',
    intro: 'Uma conversa única com Leonardo Soares, o segundo sócio mais antigo do Leça FC.',
    description: 'Leonardo Soares partilha décadas de história, de paixão e de pertença ao Leça FC — uma memória viva do clube.',
    videoSrc: 'videos/leonardo_soares.mp4',
    poster: 'videos/leonardosoares.jpg'
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
video.src = selected.videoSrc;
if (selected.poster) video.poster = selected.poster;
