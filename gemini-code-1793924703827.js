import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    game.init().then(() => {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        game.start();
    }).catch(error => {
        console.error("Engine initialization failed:", error);
    });
});