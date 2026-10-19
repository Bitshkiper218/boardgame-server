// ==========================================
// РОУТЕР ТА МАРШРУТИЗАТОР
// ==========================================
const routes = [
    { path: '/', view: 'CatalogView' },
    { path: '/games/:id', view: 'GameDetailView' },
    { path: '/owned', view: 'OwnedView' }
];

function matchRoute(path) {
    const pathParts = path.split('/').filter(Boolean);
    for (const route of routes) {
        const routeParts = route.path.split('/').filter(Boolean);
        if (routeParts.length !== pathParts.length) continue;
        
        const params = {};
        const isMatch = routeParts.every((part, i) => {
            if (part.startsWith(':')) {
                params[part.slice(1)] = pathParts[i];
                return true;
            }
            return part === pathParts[i];
        });
        
        if (isMatch) return { view: route.view, params };
    }
    return null;
}

// ==========================================
// VUE КОМПОНЕНТИ ТА ДОДАТОК
// ==========================================
const GameCard = {
    props: ['id', 'title', 'minPlayers', 'maxPlayers', 'genre', 'img', 'owned', 'isGameOfTheDay'],
    emits: ['filter', 'toggle-owned'],
    template: `
        <article class="card" :class="{ 'card-owned': owned, 'game-of-the-day': isGameOfTheDay }">
            <h3>{{ title }}</h3>
            <span class="badge">👥 {{ minPlayers }}–{{ maxPlayers }} гравців</span>
            <img :src="img" :alt="'Обкладинка гри ' + title">
            <p class="genre-text" @click="\$emit('filter', genre)">
                Жанр: <span class="genre-link">{{ genre }}</span>
            </p>
            
            <a :href="'#/games/' + id" class="btn-detail">📖 Детальніше</a>
            
            <button 
                :class="['btn-status', owned ? 'btn-played' : 'btn-not-played']" 
                @click="\$emit('toggle-owned', id)">
                {{ owned ? '✅ Зіграно' : '❌ Не зіграно' }}
            </button>
        </article>
    `
};

const App = {
    data() {
        return {
            currentGenre: '',
            games: [],
            gameOfTheDayId: null,
            currentRoute: { view: 'CatalogView', params: {} }
        };
    },
    async created() {
        // ЛАБОРАТОРНА 14: Отримуємо дані з локального Node.js сервера
        try {
            const response = await fetch('/api/games');
            if (!response.ok) {
                throw new Error('Помилка HTTP: ' + response.status);
            }
            const serverGames = await response.json();
            this.games = serverGames;
        } catch (error) {
            console.error('Помилка завантаження з сервера: - script.js:75', error);
            // Якщо сервер не запущено, масив просто буде порожнім
            this.games = [];
        }

        // Визначаємо Гру дня
        if (this.games.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.games.length);
            this.gameOfTheDayId = this.games[randomIndex].id;
        }

        this.handleHashChange();
        window.addEventListener('hashchange', () => this.handleHashChange());
    },
    computed: {
        filteredGames() {
            if (!this.currentGenre) return this.games;
            return this.games.filter(game => game.genre === this.currentGenre);
        },
        currentGame() {
            const id = Number(this.currentRoute.params.id);
            return this.games.find(g => g.id === id) || null;
        },
        ownedGames() {
            return this.games.filter(g => g.owned);
        }
    },
    methods: {
        handleHashChange() {
            const hashPath = location.hash.slice(1) || '/';
            const matched = matchRoute(hashPath);
            if (matched) {
                this.currentRoute = matched;
            } else {
                this.currentRoute = { view: 'NotFoundView', params: {} };
            }
            window.scrollTo(0, 0);
        },
        setGenreFilter(genre) {
            this.currentGenre = genre;
        },
        async toggleOwned(id) {
            const game = this.games.find(g => g.id === id);
            if (game) {
                game.owned = !game.owned;
            }
        }
    },
    template: `
        <div>
            <header>
                <h1>Каталог настільних ігор</h1>
                <nav class="nav-menu">
                    <a href="#/">Всі ігри</a>
                    <a href="#/owned">Зіграні ігри</a>
                </nav>
            </header>

            <main class="container">
                <!-- VIEW: КАТАЛОГ -->
                <div v-if="currentRoute.view === 'CatalogView'">
                    <div class="filter-section" style="text-align: center; margin-bottom: 20px;">
                        <p>Активний фільтр жанру: <b>{{ currentGenre || 'Всі жанри' }}</b></p>
                        <button v-if="currentGenre" @click="currentGenre = ''" class="reset-btn">Скинути фільтр</button>
                    </div>

                    <transition-group name="list" tag="div" class="cards">
                        <game-card 
                            v-for="game in filteredGames" 
                            :key="game.id"
                            v-bind="game"
                            :is-game-of-the-day="game.id === gameOfTheDayId"
                            @filter="setGenreFilter"
                            @toggle-owned="toggleOwned">
                        </game-card>
                    </transition-group>
                </div>

                <!-- VIEW: ЗІГРАНІ ІГРИ -->
                <div v-else-if="currentRoute.view === 'OwnedView'">
                    <h2 style="text-align:center;">Мої зіграні ігри ({{ ownedGames.length }})</h2>
                    <div class="cards" v-if="ownedGames.length > 0">
                        <game-card 
                            v-for="game in ownedGames" 
                            :key="game.id"
                            v-bind="game"
                            :is-game-of-the-day="game.id === gameOfTheDayId"
                            @filter="setGenreFilter"
                            @toggle-owned="toggleOwned">
                        </game-card>
                    </div>
                    <p v-else style="text-align:center; padding: 40px;">Ви ще не додали жодної гри до зіграних.</p>
                </div>

                <!-- VIEW: ДЕТАЛІ ГРИ -->
                <div v-else-if="currentRoute.view === 'GameDetailView'">
                    <div v-if="currentGame" class="game-detail">
                        <a href="#/" class="btn-back">⬅ Назад до каталогу</a>
                        <div class="detail-content" style="display: flex; gap: 30px; margin-top: 20px; flex-wrap: wrap;">
                            <img :src="currentGame.img" :alt="currentGame.title" style="max-width: 400px; border-radius: 8px;">
                            <div>
                                <h2>{{ currentGame.title }}</h2>
                                <p class="badge">👥 {{ currentGame.minPlayers }}–{{ currentGame.maxPlayers }} гравців</p>
                                <p><b>Жанр:</b> {{ currentGame.genre }}</p>
                                <p>{{ currentGame.description }}</p>
                                <button 
                                    :class="['btn-status', currentGame.owned ? 'btn-played' : 'btn-not-played']" 
                                    @click="toggleOwned(currentGame.id)" style="max-width: 200px; margin-top: 20px;">
                                    {{ currentGame.owned ? '✅ Зіграно' : '❌ Не зіграно' }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-else style="text-align:center; padding: 50px;">
                        <h2>Гру не знайдено</h2>
                        <a href="#/" class="btn-back">На головну</a>
                    </div>
                </div>

                <!-- VIEW: 404 -->
                <div v-else style="text-align:center; padding: 50px;">
                    <h2>404 — Сторінку не знайдено</h2>
                    <a href="#/" class="btn-back">На головну</a>
                </div>
            </main>
        </div>
    `
};

Vue.createApp(App).component('GameCard', GameCard).mount('#app');