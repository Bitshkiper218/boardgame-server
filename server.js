const express = require('express');
const app = express();
const PORT = 3000;

// Роздаємо статичні файли (index.html, css/, js/ тощо) з поточної папки
app.use(express.static(__dirname));

// Наші дані для 4 варіанту (Каталог настільних ігор)
const boardGames = [
    { id: 1, title: 'Каркасон', minPlayers: 2, maxPlayers: 5, genre: 'Стратегія', img: 'assets/img/carcassonne.jpg', owned: false, description: 'Класична гра про розбудову середньовічної Франції.' },
    { id: 2, title: 'Манчкін', minPlayers: 3, maxPlayers: 6, genre: 'Карткова', img: 'assets/img/munchkin.jpg', owned: false, description: 'Пародія на рольові ігри.' },
    { id: 3, title: 'Діксіт', minPlayers: 3, maxPlayers: 8, genre: 'Асоціації', img: 'assets/img/dixit.jpg', owned: false, description: 'Гра на асоціації з неймовірними ілюстраціями.' },
    { id: 4, title: 'Козаки', minPlayers: 2, maxPlayers: 4, genre: 'Стратегія', img: 'assets/img/Cossacs.jpg', owned: false, description: 'Історична гра про українських козаків.' },
    { id: 5, title: 'Вуаля', minPlayers: 2, maxPlayers: 6, genre: 'Карткова', img: 'assets/img/Wualia.jpg', owned: false, description: 'Швидка гра на реакцію.' }
];

// Ендпоінт 1: Отримання всього списку ігор
app.get('/api/games', (req, res) => {
    res.json(boardGames);
});

// Ендпоінт 2: Отримання конкретної гри за ID або 404
app.get('/api/games/:id', (req, res) => {
    const game = boardGames.find(g => String(g.id) === req.params.id);
    if (!game) {
        return res.status(404).json({ error: 'Гру не знайдено' });
    }
    res.json(game);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер успішно запущено на http://localhost:${PORT} - server.js:33`);
});