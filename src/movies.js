import axios from 'axios';

export default function (ids) {
  const idsf = ids.reduce((acc, id) => `${acc},${id}`);
  const key = 'd86249884b84773d376e0caa0ccb2b38';
  return axios.get(
    `https://api.themoviedb.org/3/discover/movie?api_key=${key}&language=pt-BR&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${idsf}`
  )
  .then(e => e.data);
}
