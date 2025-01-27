const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/pagina_web', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Verificar conexión
mongoose.connection.once('open', () => {
    console.log('Conectado a la base de datos');
});

// Definir un modelo de publicación
const Post = mongoose.model('Post', new mongoose.Schema({
    title: String,
    details: String,
    type: String,
    file: String
}));

// Definir un modelo de usuario
const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    surname: String,
    email: String,
    birthdate: Date,
    password: String
}));

// Ruta para obtener todas las publicaciones
app.get('/posts', async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
});

// Ruta para subir una publicación
app.post('/upload', upload.single('file'), async (req, res) => {
    const { title, details, type } = req.body;
    const file = req.file ? req.file.filename : null;
    const post = new Post({ title, details, type, file });
    await post.save();
    res.json(post);
});

// Ruta para registrar un usuario
app.post('/register', async (req, res) => {
    try {
        const { name, surname, email, birthdate, password } = req.body;
        const user = new User({ name, surname, email, birthdate, password });
        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
});

// Rutas para servir las páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/main.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/create-post.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create-post.html'));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
