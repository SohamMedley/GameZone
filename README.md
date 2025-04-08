# GameZo Clone

**Enhanced GameZo Clone with Premium UI and Additional Games**

GameZo Clone is a modern, premium clone of [GameZo.online](https://gamezo.online) that retains the same core functionality while introducing an updated, polished user interface. The platform features classic games enhanced with a refined look, smooth animations, and additional game modes. This project is built using HTML, CSS, JavaScript for the front-end, and Python with Flask for the back-end.

---

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Features

- **Premium UI Enhancements**
  - Modern gradient color schemes with purple, pink, and teal accents
  - Subtle animations and hover effects on interactive elements
  - Responsive design for desktop and mobile views

- **Game Collection**
  - **Tic Tac Toe:** Classic game with options to play against friends or AI with multiple difficulty levels.
  - **Crazy Ball:** Action-packed bouncing ball game with power-ups and different game modes.
  - **Memory Match:** A card matching game with various difficulty levels and themes.
  - **My Piano:** A virtual piano for creating and playing music, with customization options.
  - **Snake Game:** A classic snake game featuring multiple game modes and customization options.

- **Additional Pages**
  - **About:** Learn more about the platform and our mission.
  - **Contact:** Contact form for user inquiries and feedback.
  - **Privacy Policy & Terms:** Detailed legal information concerning user data and site usage.

---

## Technologies

- **Front-End:** HTML5, CSS3, JavaScript
- **Back-End:** Python, Flask
- **Styling:** Custom CSS with responsive layouts and animations
- **Additional Libraries:**
  - Font Awesome for icons
  - Google Fonts (Poppins)

---

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/GameZone.git
   cd gamezo-clone
   ```

2. **Install Dependencies:**

   Ensure you have Python installed, then create a virtual environment (optional):

   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows use: venv\Scripts\activate
   ```

   Install the required packages:

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask Application:**

   ```bash
   python app.py
   ```

   The application will run in debug mode at [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## Project Structure

```
gamezo-clone/
├── static/
│   ├── css/
│   │   ├── main.css
│   │   ├── games.css
│   ├── js/
│   │   ├── main.js
│   │   ├── crazyball.js
│   │   ├── tictactoe.js
│   │   ├── memory.js
│   │   ├── piano.js
│   │   ├── snake.js
│   ├── images/
│       ├── logo.png
│       ├── crazyball.png
│       ├── tictactoe.png
│       ├── piano.png
├── templates/
│   ├── index.html
│   ├── crazyball.html
│   ├── tictactoe.html
│   ├── memory.html
│   ├── piano.html
│   ├── snake.html
│   ├── about.html
│   ├── contact.html
│   ├── privacy.html
│   ├── terms.html
├── app.py
├── requirements.txt
```

---

## Usage

- **Home Page:** Displays the list of all games.
- **Game Pages:** Navigate to individual game pages such as Tic Tac Toe, Crazy Ball, Memory Match, My Piano, and Snake Game.
- **Additional Information:** The "About," "Contact," "Privacy," and "Terms" pages provide extra details about the project and legal information.

---

## API Endpoints

- **Save Score:**
  - **Endpoint:** `/api/save-score`
  - **Method:** `POST`
  - **Description:** Save a game score by sending JSON data with game, score, and username.

- **High Scores:**
  - **Endpoint:** `/api/high-scores/<game>`
  - **Method:** `GET`
  - **Description:** Retrieve high scores for the specified game.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Made with ❤️ by Soham*

