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
mongoose.connect('mongodb://localhost:27017/tu_base_de_datos', {
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

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
