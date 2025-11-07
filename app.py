import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.utils import secure_filename
from flask_cors import CORS


# ----------------- 기본 설정 -----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app)  # React(개발용)와 통신 허용

app.config.update(
    SECRET_KEY='dev-secret-key',
    JWT_SECRET_KEY='jwt-secret-key',
    SQLALCHEMY_DATABASE_URI=f"sqlite:///{os.path.join(BASE_DIR, 'db.sqlite3')}",
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    UPLOAD_FOLDER=UPLOAD_FOLDER
)

db = SQLAlchemy(app)
jwt = JWTManager(app)


# ----------------- DB 모델 -----------------
class User(db.Model):
    """사용자 테이블"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student' or 'teacher'


class Assignment(db.Model):
    """과제 테이블"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime, nullable=True)
    attachment = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Submission(db.Model):
    """학생 제출 테이블"""
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    file_path = db.Column(db.String(300), nullable=True)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)


# ----------------- 유틸: DB 초기화 -----------------
def init_db_once():
    """앱 시작 시 한 번만 DB 생성 및 기본 데이터 추가"""
    db.create_all()

    if User.query.filter_by(username='teacher1').first() is None:
        teacher = User(username='teacher1', role='teacher')
        student = User(username='student1', role='student')
        db.session.add_all([teacher, student])
        db.session.commit()


# ----------------- JWT 에러 핸들러 -----------------
@jwt.unauthorized_loader
def handle_unauthorized(reason):
    """JWT 누락 또는 유효하지 않을 때"""
    return jsonify({
        "msg": "Missing or invalid Authorization header",
        "error": str(reason)
    }), 401


@jwt.invalid_token_loader
def handle_invalid_token(error):
    """잘못된 토큰"""
    return jsonify({
        "msg": "Invalid token",
        "error": str(error)
    }), 422


# ----------------- 로그인 -----------------
@app.route('/api/login', methods=['POST'])
def login():
    """username 기반 간단 로그인"""
    req = request.get_json(silent=True) or {}
    username = req.get('username')

    if not username:
        return jsonify({"msg": "username required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"msg": "user not found"}), 404

    token = create_access_token(
        identity={'id': user.id, 'username': user.username, 'role': user.role},
        expires_delta=timedelta(hours=8)
    )
    return jsonify(access_token=token)


# ----------------- 과제 생성 (교사 전용) -----------------
@app.route('/api/assignments', methods=['POST'])
@jwt_required()
def create_assignment():
    """교사만 과제 생성 가능"""
    identity = get_jwt_identity()
    if identity.get('role') != 'teacher':
        return jsonify({'msg': 'Only teachers can create assignments'}), 403

    form = request.form or {}
    req_json = request.get_json(silent=True) or {}

    title = form.get('title') or req_json.get('title')
    description = form.get('description') or req_json.get('description')
    due_date_str = form.get('due_date') or req_json.get('due_date')

    if not title:
        return jsonify({'msg': 'Title required'}), 400

    attachment_filename = None
    if 'file' in request.files:
        f = request.files['file']
        if f and f.filename:
            filename = f"{int(datetime.utcnow().timestamp())}_{secure_filename(f.filename)}"
            path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            f.save(path)
            attachment_filename = filename

    due_date = None
    if due_date_str:
        try:
            due_date = datetime.fromisoformat(due_date_str)
        except ValueError:
            try:
                due_date = datetime.strptime(due_date_str, '%Y-%m-%d')
            except ValueError:
                due_date = None

    assignment = Assignment(
        title=title,
        description=description,
        due_date=due_date,
        attachment=attachment_filename
    )
    db.session.add(assignment)
    db.session.commit()

    return jsonify({'msg': 'Assignment created', 'id': assignment.id}), 201


# ----------------- 과제 제출 (학생 전용) -----------------
@app.route('/api/assignments/<int:assignment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assignment(assignment_id):
    """학생이 과제 제출"""
    identity = get_jwt_identity()
    if identity.get('role') != 'student':
        return jsonify({'msg': 'Only students can submit'}), 403

    if 'file' not in request.files:
        return jsonify({'msg': 'No file provided'}), 400

    f = request.files['file']
    if not f or not f.filename:
        return jsonify({'msg': 'No file provided'}), 400

    filename = f"{int(datetime.utcnow().timestamp())}_{secure_filename(f.filename)}"
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    f.save(save_path)

    submission = Submission(
        assignment_id=assignment_id,
        student_id=identity.get('id'),
        file_path=filename
    )
    db.session.add(submission)
    db.session.commit()

    return jsonify({'msg': 'Submitted', 'submission_id': submission.id}), 201


# ----------------- 파일 접근 -----------------
@app.route('/uploads/<path:filename>')
def get_uploaded_file(filename):
    """업로드된 파일 접근"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=False)


# ----------------- 과제 목록 -----------------
@app.route('/api/classes/<int:class_id>/assignments', methods=['GET'])
@jwt_required()
def list_assignments(class_id):
    """모든 과제 목록"""
    assignments = Assignment.query.order_by(Assignment.created_at.desc()).all()
    return jsonify([
        {
            'id': a.id,
            'title': a.title,
            'description': a.description,
            'due_date': a.due_date.isoformat() if a.due_date else None,
            'attachment_url': f"/uploads/{a.attachment}" if a.attachment else None
        }
        for a in assignments
    ])


# ----------------- 실행 -----------------
if __name__ == '__main__':
    with app.app_context():
        init_db_once()
    app.run(host='0.0.0.0', port=5000, debug=True)
