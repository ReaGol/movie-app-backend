import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const getLatestMovies = async (req, res) => {
	const defaultPoster =
		'https://images.unsplash.com/photo-1616530940355-351fabd9524b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bW92aWUlMjBwb3N0ZXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60';
	const { limit = 20 } = req.query;
	try {
		const tmdbResponse = await axios.get(
			`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US&page?limit=${limit}`
		);
		const tmdbData = tmdbResponse.data;
		const tmdbMovies = tmdbData.results.map((movie) => ({
			name: movie.title,
			rating: movie.vote_average,
			poster: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
			year: movie.release_date.substring(0, 4),
			id: movie.id,
		}));

		const omdbResponse = await axios.get(
			`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&type=movie&y=2023&r=json&s=movie`
		);
		const omdbData = omdbResponse.data;
		const omdbMovies = omdbData.Search.map((movie) => ({
			name: movie.Title,
			rating: movie.imdbRating,
			poster: movie.Poster === 'N/A' ? defaultPoster : movie.Poster,
			year: movie.Year,
			id: movie.imdbID,
		}));

		const latestMovies = [...omdbMovies, ...tmdbMovies].slice(0, limit);
		res.status(200).send(latestMovies);
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
};

export const getDetailedMovie = async (req, res) => {
	try {
		const { id } = req.params;

		const tmdbResponse = await axios.get(
			`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`
		);
		const tmdbData = tmdbResponse.data;
		// console.log(tmdbData);

		// res.status(200).send(tmdbData);
		const omdbResponse = await axios.get(
			`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}`
			// `http://www.omdbapi.com/?apikey=ad0870b9&i=tt14317038`
		);
		const omdbData = omdbResponse.data;

		console.log('omdb', omdbData.Ratings);
		console.log('----------------------------------');
		console.log('tmdb', tmdbData.Ratings);

		const movieData = {
			poster: tmdbData.poster_path || omdbData.Poster,
			title: tmdbData.title || omdbData.Title,
			year: tmdbData.release_date
				? tmdbData.release_date.substring(0, 4)
				: omdbData.Year,
			ratings: {
				tmdb: tmdbData.vote_average,
				imdb: omdbData.imdbRating,
				rottenTomatoes:
					omdbData.Ratings &&
					omdbData.Ratings.find((rating) => rating.Source === 'Rotten Tomatoes')
						?.Value,
				metaCritic: omdbData.Metascore,
			},
			genre: tmdbData.genres.map((genre) => genre.name),
			director: omdbData.Director || 'N/A',
			writers: omdbData.Writer || 'N/A',
			actors:
				tmdbData.credits && tmdbData.credits.cast
					? tmdbData.credits.cast.map((actor) => ({
							name: actor.name,
							character: actor.character,
							image:
								actor.profile_path ||
								'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fHBvcnRyYWl0JTIwbWFufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
					  }))
					: {
							runTime: omdbData.Runtime || 'N/A',
							plot: omdbData.Plot || 'N/A',
							tagLine: tmdbData.tagline,
							trailers: [],
							language: tmdbData.original_language,
					  },
		};
		// console.log(movieData);
		res.status(200).send(movieData);
	} catch (error) {
		res.status(404).send({ error: error.message });
	}
};
