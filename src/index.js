import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import socketio from 'socket.io';
import http from 'http';
import cors from 'cors'; // nova dependência! para fazer o login
import genres from './genres';
import searchMovies from './movies';

const messages = [];
let connectedPeople = 0;
let selectedGenres = [];

const app = express();
const server = new http.Server(app);
const io = socketio.listen(server);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`[x] Magic happens on port: ${port}`));

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

io.on('connection', (socket) => {
  const userid = Date.now();
  connectedPeople = connectedPeople + 1;
  let canSelectGenre = true;

  io.emit('connectedPeople', connectedPeople);
  socket.emit('messages', messages);
  socket.emit('hello', 'Welcome!');
  socket.emit('lock', canSelectGenre);

  genres.then(r => socket.emit('genres', r.genres));

  socket.on('selectGenre', (id) => {
    selectedGenres.push({ userid, genreid: id });
    canSelectGenre = false;
    socket.emit('lock', canSelectGenre);
    io.emit('message', `Usuario [${userid}] votou!`);

    if (selectedGenres.length === connectedPeople) {
      io.emit('message', 'Estamos fazendo a análise!');
      searchMovies(selectedGenres.map(x => x.genreid))
        .then(result => {
          canSelectGenre = true;
          io.emit('lock', canSelectGenre);
          const moviesSelected = result.results;
          io.emit('movie', moviesSelected[0]);
          moviesSelected.forEach((x, i) => {
            io.emit('message', `Fim da rodada ${i}`);
          });
          io.emit('message', 'Filme selecionado!');
          selectedGenres = [];
        });
    }
  });

  socket.on('sent message', (message) => {
    io.emit('new message', message);
  });
  socket.on('disconnect', () => {
    selectedGenres = selectedGenres.filter(e => e.userid === userid);
    connectedPeople = connectedPeople - 1;
    io.emit('connectedPeople', connectedPeople);
  });
});


export default app;
