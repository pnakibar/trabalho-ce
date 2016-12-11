import axios from 'axios';
const genresPromise =
  axios
    .get('https://api.themoviedb.org/3/genre/movie/list?api_key=d86249884b84773d376e0caa0ccb2b38&language=pt-BR')
    .then(r => r.data);

export default genresPromise;
