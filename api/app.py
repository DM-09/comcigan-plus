from flask import Flask, jsonify, render_template, url_for
from flask_cors import CORS
from comcigan_parser import *
from datetime import *

app = Flask(__name__)
CORS(app)
table = TimeTable('학교',1)
start = datetime(*map(int, table.start_date.split('-')))
data = table.data

@app.route('/getTable/<string:school>/', defaults={'weekdata': 1})
@app.route('/getTable/<string:school>/<int:weekdata>')
def getTable(school, weekdata):
  tt = TimeTable(school,weekdata)
  return jsonify({"update_date" : tt.update_date, "school_code" : tt.school_code,
                  "region" : tt.region, 'Timetable_st' : tt.data, 'Today_num' : tt.today_num,
                  "date_data" : tt.date_data, "start_date" : tt.start_date, "class_time" : tt.class_time,
                  "Timetable_th" : tt.th_data, 'Teachers' : tt.tdata, 'school_name' : tt.school_name })

@app.route('/searchSchool/<string:query>')
def search(query):
  data = search_school(query)
  if not data: return jsonify({'res' : '검색결과가 없습니다.'})
  return jsonify({'res' : [(i[1], i[2]) for i in data]})

@app.route('/')
def main():
  return render_template('index.html')
