from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/crazyball')
def crazyball():
    return render_template('crazyball.html')

@app.route('/tictactoe')
def tictactoe():
    return render_template('tictactoe.html')

@app.route('/piano')
def piano():
    return render_template('piano.html')

@app.route('/memory')
def memory():
    return render_template('memory.html')

@app.route('/snake')
def snake():
    return render_template('snake.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/api/save-score', methods=['POST'])
def save_score():
    """API endpoint to save game scores"""
    data = request.json
    game = data.get('game')
    score = data.get('score')
    username = data.get('username', 'Anonymous')

    # In a real application, you would save this to a database
    # For now, we'll just return a success message
    return jsonify({
        'success': True,
        'message': f'Score of {score} saved for {username} in {game}'
    })

@app.route('/api/high-scores/<game>')
def high_scores(game):
    """API endpoint to get high scores for a game"""
    # In a real application, you would fetch this from a database
    # For now, we'll return dummy data
    dummy_scores = [
        {'username': 'Player1', 'score': 120},
        {'username': 'Player2', 'score': 115},
        {'username': 'Player3', 'score': 95},
        {'username': 'Player4', 'score': 80},
        {'username': 'Player5', 'score': 75},
    ]

    return jsonify({
        'game': game,
        'scores': dummy_scores
    })

if __name__ == '__main__':
    app.run(debug=True)