from urllib import parse
from urllib.parse import unquote
import json
import requests
import base64
import math

_mainURL = 'http://comci.net:4082'
_searchPath = '/36179?17384l'
_timetablePath = '/36179?'

def search_school(query : str):
  '''
  학교 검색
  -param query: 검색어
  -return: 검색결과(type: list)
  '''

  query = unquote(unquote(query))
  URL = _mainURL + _searchPath + parse.quote(query, encoding='euc-kr')
  req = requests.get(URL)
  req.encoding = 'UTF-8'

  data = json.loads(req.text.strip(chr(0)))['학교검색']
  return data

def parse_sc(tdata, sdata, data, div):
  tn = data % div
  sn = math.floor(data / div)
  if div == 100:
    tn = math.floor(data / div)
    sn = data % div
  teacher = tdata[tn]
  sub = sdata[sn]
  return [sub, teacher]

def parse_th(sdata, data, div):
  c = data % div
  grade = math.floor(c / 100)
  class_num = c % 100
  sb = math.floor(data / div) % div
  if grade == class_num == 0: return ''
  return [f"{grade}-{class_num}", sdata[sb]]

class TimeTable():
  def make_th_ott(self, data):
    tt2 = []
    div = data['분리']
    tt2.append(0)
    for t in range(1, data['교사수'] + 1):
      box2 = [data['자료446'][t]]
      for day in range(5):
        box = [0]
        for c in range(8):
          box.append([])
        box2.append(box)
      tt2.append(box2)

    for gr in range(1, 4):
      for cn in range(1, data['학급수'][gr]):
        for day in range(1, 6):
          for p in range(1, len(data['자료481'][gr][cn][day])):
            o = data['자료481'][gr][cn][day][p]
            if o < 0: continue
            d = parse_sc(data['자료446'], data['자료492'], o, div)
            sb = d[0]
            th_num = data['자료446'].index(d[1])
            if th_num == 0: continue
            tt2[th_num][day][p] = [f'{gr}-{cn}', sb]

    return tt2

  def getInfo(self, weekdata):
    school_code = self.school_code
    week = weekdata  # 1이면 이번주

    URL = _mainURL + _timetablePath + str(base64.b64encode(f'73629_{school_code}_0_{week}'.encode('utf-8')))[2:-1]
    req = requests.get(URL)
    req.encoding = 'UTF-8'

    data = json.loads(req.text.strip(chr(0)))

    div = data['분리'] or 100
    tdata = data['자료446']  # 교사 데이터
    sdata = data['자료492']  # 과목 데이터

    # 파싱 작업
    data481 = data['자료481']  # 원 데이터
    data147 = data['자료147']  # 일일 데이터

    newData = [0]
    update_date = data['자료244']  # 수정일
    date_data = data['일자자료']   # 일자 자료
    class_time = data['일과시간']  # 일과 시간표
    today_num = data['오늘r']

    t_data = data['자료542'] # 교사 시간표 데이터
    th_data = []

    tt2 = self.make_th_ott(data) #

    # 교사용 시간표 -c
    for th in range(1, data['교사수']+1):
      box_1 = [0]
      for day in range(1, len(t_data[th])):
        box = [tdata[th]]
        for i in range(1, len(t_data[th][day])):
          ori = tt2[th][day][i]
          res = parse_th(sdata, t_data[th][day][i], div)
          if not ori: ori = ''
          box.append([*res, ori != res])
        box_1.append(box)
      th_data.append(box_1)

    # 학생용 시간표
    for grade in range(1, len(data147)):
      class_box = [0]
      for class_num in range(1, len(data147[grade]) - data['가상학급수'][grade]):
        sc_box = [0]
        for day_num in range(1, len(data147[grade][class_num])):
          sc_data = data147[grade][class_num][day_num]
          or_data = data481[grade][class_num][day_num]
          box = [0]

          for i in range(1, len(sc_data)):
            if sc_data[i] == 0: break
            val = not sc_data[i] if i >= len(or_data) else or_data[i]
            is_changed = val != sc_data[i]
            box.append([parse_sc(tdata, sdata, sc_data[i], div), is_changed])

          sc_box.append(box)
        class_box.append(sc_box)
      newData.append(class_box)

    return [update_date, newData, date_data, class_time, today_num, th_data, data['시작일'], tdata]

  def __init__(self, school_name, weekdata=1):
    search = search_school(school_name)
    if not search: raise RuntimeError('해당하는 학교가 없습니다.')

    self.region = {'지역 코드' : search[0][0], '지역' : search[0][1]} # 지역 정보
    self.school_code = search[0][3] # 학교 코드
    self.school_name = unquoto(unquoto(search[0][2])) # 학교 이름
    self.update_date = '' # 수정일
    self.data = [] # 학생 시간표
    self.today_num = 0 # 오늘
    self.date_data = [] # 일자 자료
    self.class_time = [] # 일과 시간
    self.th_data = [] # 교사용 시간표
    self.start_date = '' # 시작일
    self.tdata = [] # 교사 정보
    self.school_name = unquote(school_name)

    res = self.getInfo(weekdata)
    if res:
      self.update_date = res[0]
      self.data = res[1]
      self.date_data = res[2]
      self.class_time = res[3]
      self.today_num = res[4]
      self.th_data = res[5]
      self.start_date = res[6]
      self.tdata = res[7]
