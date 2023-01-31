import express from 'express';
import './services/DB/mongoose.js';
import cors from 'cors';
import router from './components/movies/movie.routes.js';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, PATCH, HEAD'
	);
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

app.options('*', cors());
app.use(cors());
const PORT = process.env.PORT || 5000;
app.use('/api', router);
app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
