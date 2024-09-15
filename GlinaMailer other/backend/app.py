from flask import Flask, request, jsonify, redirect
from flask_sqlalchemy import SQLAlchemy
import uuid

app = Flask(__name__)

# Конфигурация базы данных
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///urls.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Модель для хранения URL
class URLMapping(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    short_id = db.Column(db.String(50), unique=True, nullable=False)
    full_url = db.Column(db.String(200), nullable=False)

# Создание базы данных
with app.app_context():
    db.create_all()

@app.route('/')
def welcome():
    return "Welcome to the URL shortener!"

@app.route('/shorten', methods=['POST'])
def shorten_url():
    full_url = request.json.get('url')
    if not full_url:
        return jsonify({'error': 'Invalid URL'}), 400
    
    short_id = str(uuid.uuid4())[:8]
    new_url = URLMapping(short_id=short_id, full_url=full_url)
    try:
        db.session.add(new_url)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal Server Error'}), 500
    
    # Измените 'https://domain' на ваш реальный домен
    short_url = f'{short_id}'
    return jsonify({'short_url': short_url})

@app.route('/<short_id>')
def redirect_url(short_id):
    url_entry = URLMapping.query.filter_by(short_id=short_id).first()
    if url_entry:
        return redirect(url_entry.full_url)
    else:
        return jsonify({'error': 'URL not found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0')