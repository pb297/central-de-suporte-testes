// Configuração dos Módulos
const modal = {
    init: function() {
        this.element = document.getElementById('customModal');
        this.closeBtn = document.querySelector('.close');
        
        if (this.closeBtn) {
            this.closeBtn.onclick = this.close.bind(this);
        }
        
        window.onclick = (event) => {
            if (event.target === this.element) this.close();
        };
    },

    open: function(content, imageUrl = null) {
        const modalContent = `
            <div class="alert info">
                ${imageUrl ? `<img src="${imageUrl}" alt="Aviso" class="modal-image">` : ''}
                ${content}
            </div>
        `;
        
        document.getElementById('modalText').innerHTML = modalContent;
        this.element.style.display = 'block';
    },

    close: function() {
        this.element.style.display = 'none';
    }
};

const chat = {
    init: function() {
        this.button = document.getElementById('chatbotButton');
        this.container = document.getElementById('chatbotContainer');
        this.isOpen = false;

        if (this.button && this.container) {
            this.button.addEventListener('click', this.toggle.bind(this));
            document.addEventListener('click', this.closeOnClickOutside.bind(this));
        }
    },

    toggle: function() {
        this.isOpen = !this.isOpen;
        this.container.style.display = this.isOpen ? 'block' : 'none';
        this.button.textContent = this.isOpen ? 'Fechar' : 'Atendimento';
        this.button.classList.toggle('active', this.isOpen);
    },

    closeOnClickOutside: function(event) {
        if (this.isOpen && 
           !this.container.contains(event.target) && 
           event.target !== this.button) {
            this.toggle();
        }
    }
};

const search = {
    articles: [],
    
    init: async function() {
        try {
            const response = await fetch('./artigos.json');
            if (!response.ok) throw new Error('Arquivo de artigos não encontrado');
            const data = await response.json();
            
            if (!data || !data.temas) {
                throw new Error('Estrutura de dados inválida');
            }
            
            this.articles = Object.values(data.temas).flat();
            
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', this.handleInput.bind(this));
                searchInput.addEventListener('focus', () => {
                    if (searchInput.value.trim()) {
                        document.getElementById('searchResults').style.display = 'block';
                    }
                });
                
                // Fechar resultados ao clicar fora
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.search-container')) {
                        document.getElementById('searchResults').style.display = 'none';
                    }
                });
            }
        } catch (error) {
            console.error('Erro na inicialização da pesquisa:', error);
            modal.open(`
                <h3>⚠️ Atenção</h3>
                <p>Erro ao carregar artigos:</p>
                <p class="error-message">${error.message}</p>
            `);
        }
    },

    handleInput: function(e) {
        const term = e.target.value.trim().toLowerCase();
        const resultsContainer = document.getElementById('searchResults');
        
        if (!term) {
            resultsContainer.style.display = 'none';
            return;
        }

        const results = this.articles.filter(article => {
            if (!article.title || !article.content || !article.keywords) return false;
            const searchText = `${article.title} ${article.content} ${article.keywords}`.toLowerCase();
            return searchText.includes(term);
        });
        
        this.displayResults(results, term, resultsContainer);
    },

    displayResults: function(results, term, container) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="result-item no-results">
                    <p>Nenhum resultado encontrado para "<span class="search-term">${term}</span>"</p>
                    <div class="search-suggestions">
                        Tente buscar por outros termos ou verifique a ortografia
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = results.map(article => `
                <div class="result-item">
                    <a href="${article.url || '#'}" class="result-link">
                        <div class="result-title">${this.highlight(article.title, term)}</div>
                        <div class="result-excerpt">${this.highlight(article.content.substring(0, 150))}...</div>
                        <div class="result-keywords">
                            <small>Tags: ${this.highlight(article.keywords, term)}</small>