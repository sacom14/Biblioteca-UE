"use strict";
var _a, _b, _c;
// Esta clase representa un libro de la biblioteca
class Book {
    constructor(title, author, publicationYear, genre, availableCopies //private para que solo se pueda cambiar con los métodos
    ) {
        this.title = title;
        this.author = author;
        this.publicationYear = publicationYear;
        this.genre = genre;
        this.availableCopies = availableCopies;
    }
    getAvailableCopies() {
        return this.availableCopies;
    }
    modifyCopies(amount) {
        this.availableCopies += amount;
    }
}
// Esta clase guarda la información de cada usuario de la biblioteca
class User {
    constructor(name, email, birthDate) {
        this.name = name;
        this.email = email;
        this.birthDate = birthDate;
    }
}
// Esta es la clase principal que controla toda la biblioteca
// Guarda los libros, usuarios y préstamos, y los maneja
class Library {
    constructor() {
        // Cargamos los datos guardados en localStorage
        // Si no hay nada guardado ([]), creamos arrays vacíos
        this.books = JSON.parse(localStorage.getItem('books') || '[]').map((book) => new Book(book.title, book.author, book.publicationYear, book.genre, book.availableCopies));
        this.users = JSON.parse(localStorage.getItem('users') || '[]').map((user) => {
            user.birthDate = new Date(user.birthDate);
            return new User(user.name, user.email, user.birthDate);
        });
        // Usamos Map para guardar los préstamos porque necesitamos relacionar usuarios con sus libros prestados
        this.loans = new Map();
    }
    addBook(book) {
        this.books.push(book);
        localStorage.setItem('books', JSON.stringify(this.books)); // Guardamos en localStorage
        this.displayBooks();
    }
    removeBook(title) {
        this.books = this.books.filter(b => b.title !== title);
        localStorage.setItem('books', JSON.stringify(this.books));
        this.displayBooks();
    }
    registerUser(user) {
        this.users.push(user);
        localStorage.setItem('users', JSON.stringify(this.users));
        this.displayUsers();
    }
    // Método para prestar un libro a un usuario
    loanBook(user, title) {
        const book = this.books.find(b => b.title === title);
        // Comprobamos que el libro existe y hay copias disponibles
        if (book && book.getAvailableCopies() > 0) {
            book.modifyCopies(-1); // Restamos una copia
            // Si el usuario no tiene préstamos, creamos su lista
            if (!this.loans.has(user)) {
                this.loans.set(user, []);
            }
            // Calculamos las fechas
            const loanDate = new Date();
            const returnDate = new Date();
            returnDate.setDate(loanDate.getDate() + 14); // El préstamo dura 14 días
            // Añadimos el préstamo a la lista del usuario
            this.loans.get(user).push({ book, loanDate, returnDate });
            localStorage.setItem('loans', JSON.stringify(Array.from(this.loans.entries())));
            this.displayLoans();
            this.displayBooks();
        }
        else {
            alert(`No hay copias disponibles de ${title}`);
        }
    }
    returnBook(user, title) {
        const userLoans = this.loans.get(user); // Buscamos los préstamos del usuario
        if (userLoans) {
            // Buscamos este libro en sus préstamos
            const loanIndex = userLoans.findIndex(loan => loan.book.title === title);
            if (loanIndex !== -1) {
                const loan = userLoans[loanIndex];
                loan.returnDate = new Date(); // Ponemos la fecha de devolución
                // Añadimos la copia de vuelta a los disponibles
                loan.book.modifyCopies(1);
                // Quitamos el préstamo de la lista
                userLoans.splice(loanIndex, 1);
                // Si ya no tiene más préstamos, borramos su entrada del Map
                if (userLoans.length === 0) {
                    this.loans.delete(user);
                }
                localStorage.setItem('books', JSON.stringify(this.books));
                localStorage.setItem('loans', JSON.stringify(Array.from(this.loans.entries())));
                this.displayLoans();
                this.displayBooks();
            }
        }
    }
    // Muestra todos los libros en la página
    displayBooks() {
        const bookList = document.getElementById('book-list');
        if (bookList) {
            bookList.innerHTML = '';
            // Por cada libro creamos una card
            this.books.forEach(book => {
                const bookElement = document.createElement('div');
                bookElement.classList.add('book-item');
                bookElement.innerHTML = `
                <div class="card">
                    <h3>${book.title}</h3>
                    <p>Autor: ${book.author}</p>
                    <p>Año: ${book.publicationYear}</p>
                    <p>Género: ${book.genre}</p>
                    <p>Copias disponibles: ${book.getAvailableCopies()}</p>
                    <button class="loan-book" data-title="${book.title}">Pedir Prestado</button>
                    <button class="remove-book" data-title="${book.title}">Eliminar</button>
                </div>
            `;
                bookList.appendChild(bookElement);
            });
            // Botón de préstamo
            document.querySelectorAll('.loan-book').forEach(button => {
                button.addEventListener('click', (event) => {
                    const title = event.target.getAttribute('data-title');
                    const userName = prompt('Ingrese el nombre del usuario');
                    const user = this.getUserByName(userName || '');
                    if (user && title) {
                        this.loanBook(user, title);
                    }
                });
            });
            // Botón de eliminar
            document.querySelectorAll('.remove-book').forEach(button => {
                button.addEventListener('click', (event) => {
                    const title = event.target.getAttribute('data-title');
                    if (title) {
                        this.removeBook(title);
                    }
                });
            });
        }
    }
    displayUsers() {
        const userList = document.getElementById('user-list');
        if (userList) {
            userList.innerHTML = '';
            // Creamos una entrada para cada usuario
            this.users.forEach(user => {
                const userElement = document.createElement('div');
                userElement.classList.add('user-item');
                userElement.innerHTML = `
                <p>Nombre: ${user.name}</p>
                <p>Email: ${user.email}</p>
                <p>Fecha de nacimiento: ${user.birthDate.toLocaleDateString()}</p>
            `;
                userList.appendChild(userElement);
            });
        }
    }
    displayLoans() {
        const loanList = document.getElementById('loan-list');
        if (loanList) {
            loanList.innerHTML = '';
            // Por cada usuario y sus préstamos
            this.loans.forEach((loans, user) => {
                loans.forEach(loan => {
                    var _a;
                    const loanElement = document.createElement('div');
                    loanElement.innerHTML = `
                    <p>Usuario: ${user.name}</p>
                    <p>Libro: ${loan.book.title}</p>
                    <p>Fecha de préstamo: ${loan.loanDate.toLocaleDateString()}</p>
                    <p>Fecha de devolución: ${(_a = loan.returnDate) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()}</p>
                    <button class="return-book" data-user="${user.name}" data-book="${loan.book.title}">Devolver</button>
                `;
                    loanList.appendChild(loanElement);
                });
            });
            // Botón de devolución
            document.querySelectorAll('.return-book').forEach(button => {
                button.addEventListener('click', (event) => {
                    const userName = event.target.getAttribute('data-user');
                    const bookTitle = event.target.getAttribute('data-book');
                    const user = this.getUserByName(userName || '');
                    if (user && bookTitle) {
                        this.returnBook(user, bookTitle);
                    }
                });
            });
        }
    }
    // Busca un usuario por su nombre
    getUserByName(name) {
        return this.users.find(user => user.name === name);
    }
}
// Iniciando la biblioteca
const library = new Library();
library.displayBooks();
library.displayUsers();
library.displayLoans();
// Configuramos los formularios para añadir libros
(_a = document.getElementById('book-form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (event) => {
    event.preventDefault(); // Evitamos que la página se recargue
    // Recogemos todos los datos del formulario
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const year = parseInt(document.getElementById('book-year').value);
    const genre = document.getElementById('book-genre').value;
    const copies = parseInt(document.getElementById('book-copies').value);
    const book = new Book(title, author, year, genre, copies);
    library.addBook(book);
    // Limpiamos el formulario
    document.getElementById('book-form').reset();
});
// Formulario para registrar usuarios
(_b = document.getElementById('user-form')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const birthDate = new Date(document.getElementById('user-birthdate').value);
    const user = new User(name, email, birthDate);
    library.registerUser(user);
    document.getElementById('user-form').reset();
});
// Formulario para hacer préstamos
(_c = document.getElementById('loan-form')) === null || _c === void 0 ? void 0 : _c.addEventListener('submit', (event) => {
    event.preventDefault();
    const userName = document.getElementById('loan-user').value;
    const bookTitle = document.getElementById('loan-book').value;
    const user = library.getUserByName(userName);
    if (user && bookTitle) {
        library.loanBook(user, bookTitle);
    }
    else {
        alert('Usuario o libro no encontrado.');
    }
    document.getElementById('loan-form').reset();
});
