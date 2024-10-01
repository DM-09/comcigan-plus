var domain = 'https://comcip.vercel.app/'

// timetable data
var ttData = null
var class_data = []
var cur_class = 0

var days = 0
var cur_day = new Date().getDay()

var all_th = 0
var cur_th = 0

var c = 0 // 시간표 저장 여부
var c1 = 1 // 첫 번째 시간표
var c2 = 2 // 두 번째 시간표
var c3 = 3 // 세 번째 시간표

var scn = ''
var week_data = '1'

// 0- 없음, 1-학생 시간표, 2-학년 시간표, 3-교사 시간표

// functions
async function getAPI(URL, t='json') {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', URL, true);
    xhr.responseType = t;
    xhr.send();
    
    xhr.onload = function() {
     resolve(xhr.response)
    }
  })
}

function showTableSt(data, grade, cn) {
  if (data == null || grade == 0 ||cn == 0) { return }
  var tt = data['Timetable_st'][grade][cn]
  var date = new Date(data['start_date'])
  
  var info = []
  var info2 = []
  var d = '일월화수목금토일'
  var a = []
  
  for (var i=0; i < class_data.length; i++) {
    var q = ''
    if (i == cur_class) { q = 'selected' }
    a.push(`<option value='${i-1}' ${q}>${class_data[i][0]}-${class_data[i][1]}</option>`)
  }
  
  var html_code =  `<table>
      <tr>
        <td colspan="6">
        <select class="form-select nav-bg nav-color" onChange='move(Number(this.value), 1)'>
          ${a.join("")}
          </select>
          <button class="btn nav-color" type="button" onClick='move(0)'>◀</button> 
          제${grade}학년 ${cn}반 시간표 
          <button class="btn nav-color" type="button" onClick='move(1)'>▶</button>
        </td> 
      </tr>`  
  
  for (var i=0; i<8; i++) { info.push([]) }
  for (var day = 1; day < tt.length; day++) {
    info2.push(`<td scope="col" class="t-border">${d[day]}(${(date.getDate())})</td>`)
    var a = tt[day].length - 1
    date.setDate(date.getDate() + 1);
    for (var i = 1; i < tt[day].length; i++) {
      var data2 = tt[day][i]
      var sc = data2[0]
      var changed = data2[1]
      
      var attr = changed ? `class='changed'` : ''
      info[i-1].push(`<td ${attr}>${sc[0]}<br>${sc[1].slice(0, -1)}</td>`)
    }
    
    for (var j = 0; j < (8-a); j++) {
      info[a+j].push('<td></td>')
    }
  }
  
  html_code += `<tr>
        <td scope="col" class="t-border">교시</td>
        ${info2.join('')}
      </tr>`
  
  for (var i = 0; i < 8; i++) {
    html_code += `
      <tr>
        <td class="t-border">${ttData['class_time'][i]}</td>
        ${info[i].join('')}
      </tr>`
  }
    html_code += `
      <tr>
        <td colspan="6" class='t-border'>수정일: ${data['update_date']}</td>
      </tr>
    </table>
    <br>
    <table></table> `
  
  return html_code
}

function showTableGr(data, grade, day) {
  if (data == null || grade == 0 || day == 0) { return }
  var tt = data['Timetable_st'][grade]
  var info = []
  var info2 = []
  var dd = '일월화수목금토일'
  var a = []
  var date = new Date(data['start_date'])
  date.setDate(date.getDate() + day-1);
  
  for (var i=1; i<tt[1].length; i++) {
    var q = ''
    if (i == day) { q = 'selected' }
    a.push(`<option value='${i}' ${q}>${dd[i]}요일</option>`)
  }
  
  var html_code =  `<table>
      <tr>
        <td colspan="${tt.length}">
          <select class="form-select nav-bg nav-color" onChange='gr_move(Number(this.value), 1)' id='gra_box'>
          ${a.join("")}
          </select>
          <button class="btn nav-color" type="button" onClick='gr_move(-1)'>◀</button> 
          제 ${grade}학년 시간표 ${dd[day]}(${date.getDate()}일)
          <button class="btn nav-color" type="button" onClick='gr_move(1)'>▶</button>
        </td> 
      </tr>`  
  
  for (var i=0; i<8; i++) { info.push([]) }
  for (var cn = 1; cn < tt.length; cn++ ) {
    var cur = tt[cn][day]
    var a = cur.length - 1
     
    info2.push(`<td scope="col" class="t-border">${cn}반</td>`)
    for (var i=1; i < cur.length; i++) {
      var sc = cur[i][0]
      var changed = cur[i][1]
      var attr = changed ? `class='changed'` : ''
      info[i-1].push(`<td ${attr}>${sc[0]}<br>${sc[1].slice(0, -1)}</td>`)
    }
    
    for (var j=0; j < 8-a; j++){
      info[a+j].push('<td></td>')
    }
  }
  html_code += `<tr>
        <td scope="col" class="t-border">교시</td>
        ${info2.join('')}
      </tr>`
  
  for (var i = 0; i < 8; i++) {
    html_code += `
      <tr>
        <td class="t-border">${ttData['class_time'][i]}</td>
        ${info[i].join('')}
      </tr>`
  }
  return html_code
}

function showTableTh(data, th_num) {
  if (data == null) { return }
  var tt = data['Timetable_th'][th_num]
  var date = new Date(data['start_date'])
  
  var info = []
  var info2 = []
  var d = '일월화수목금토일'
  var a = []
  
  all_th = data['Teachers'].length - 1
  
  for (var i=1; i < data["Teachers"].length; i++) {
    var q = ''
    if (i == cur_th+1) { q = 'selected' }
    console.log(i, cur_th+1, data['Teachers'][i])
    a.push(`<option value='${i-1}' ${q}>${data['Teachers'][i]}</option>`)
  }

  var html_code =  `<table>
      <tr>
        <td colspan="6">
        <select class="form-select nav-bg nav-color" onChange='th_move(Number(this.value), 1)'>
          ${a.join("")}
          </select>
          <button class="btn nav-color" type="button" onClick='th_move(-1)'>◀</button> 
          ${data['Timetable_th'][th_num][1][0]} 시간표
          <button class="btn nav-color" type="button" onClick='th_move(1)'>▶</button>
        </td> 
      </tr>`  
  
  for (var i=0; i<8; i++) { info.push([]) }
  for (var day = 1; day < tt.length; day++) {
    info2.push(`<td scope="col" class="t-border">${d[day]}(${(date.getDate())})</td>`)
    var a = tt[day].length - 1
    date.setDate(date.getDate() + 1);
    for (var i = 1; i < tt[day].length; i++) {
      var data2 = tt[day][i]
      
      if (data2.length <= 1) {
        var attr = data2[0] ? `class='changed'` : ''
        info[i-1].push(`<td ${attr}></td>`)
        continue
      }
      
      var sc = data2[0]
      var con = data2[1]
      var changed = data2[2]
      
      var attr = changed ? `class='changed'` : ''
      info[i-1].push(`<td ${attr}>${sc}<br>${con}</td>`)
    }
    
    for (var j = 0; j < (8-a); j++) {
      info[a+j].push('<td></td>')
    }
  }
  
  html_code += `<tr>
        <td scope="col" class="t-border">교시</td>
        ${info2.join('')}
      </tr>`
  
  for (var i = 0; i < 8; i++) {
    html_code += `
      <tr>
        <td class="t-border">${data['class_time'][i]}</td>
        ${info[i].join('')}
      </tr>`
  }
    html_code += `
      <tr>
        <td colspan="6" class='t-border'>수정일: ${data['update_date']}</td>
      </tr>
    </table>
    <br>
    <table></table> `
  
  return html_code
}

async function selectSchool(name, weekdata='') {
  week_data = getLocalData('week_data')
  weekdata = '/' + week_data
  
  if (weekdata == '/null') { weekdata = '' }
  
  ttst.innerHTML = ''
  ttgr.innerHTML = ''
  ttth.innerHTML = ''
  data.innerHTML = `<div class="color-wait">${name} 시간표 불러오는 중</div>`
  var re = await getAPI(domain+`getTable/${name}`+weekdata)
  console.log(re)
  var cdd = []
  
  var tt = re['Timetable_st']
  for (var i=1; i < tt.length; i++) {
    for (var j=1; j < tt[i].length; j++) {
      cdd.push([i, j])
    }
  }
  ttData = re
  cur_class = 0
  var cur = cdd[cur_class]
  days = re['Timetable_st'][cur[0]][cur[1]].length - 1
  var q = new Date()
  cur_day = q.getDay()
  cur_th = 0
  scn = re.school_name
  class_data = cdd
  search_query.value = name
  
  var date_data = re['date_data']
  ddata.innerHTML = ''
  for (var i=0; i < date_data.length; i++) {
    var s = ''
    if (Number(week_data) == i+1) { s = 'selected' }
    ddata.innerHTML += `<option value="/${i+1}"${s}>${date_data[i][1]}</option>`
  }
  
  if (window.localStorage.getItem('c')) {
    c1 = Number(window.localStorage.getItem('c1'))
    c2 = Number(window.localStorage.getItem('c2'))
    c3 = Number(window.localStorage.getItem('c3'))
    cur_class = Number(window.localStorage.getItem('cur_class'))
    cur_th = Number(window.localStorage.getItem('cur_th'))
  }
  
  loadBySeq()
  data.innerHTML = ''
  
  detail.innerHTML = `학교 명: ${name} <br> 학교 코드: ${re.school_code}`
  scn = name
}

function move(n, j=0) {
  var len = class_data.length
  if (j == 1) { cur_class = n }
  if (n == 0 && j == 0) {
    cur_class -= 1
    if (cur_class < 0) { cur_class = len - 1 }
  } else {
    cur_class += 1
    if (cur_class >= len) { cur_class = 0 }
  }
  var cur = class_data[cur_class]
  loadBySeq()
  saveData()
}

function gr_move(n, j=0) {
  if (j == 1) { cur_day = 0 }
  cur_day += n
  if (cur_day <= 0) { cur_day = days }
  else if(cur_day > days) { cur_day = 1 }
  loadBySeq()
  saveData()
}

function th_move(n, j=0) {
  if (j == 1) { cur_th = 0 }
  cur_th += n
  if (cur_th < 0) { cur_th = all_th - 1 }
  else if(cur_th > all_th) { cur_th = 0 }
  loadBySeq()
  saveData()
}

function changeSeq(n, v) {
  if (n == 1) { c1 = v }
  else if (n == 2) { c2 = v }
  else if (n == 3) { c3 = v }
  saveData()
  loadBySeq()
}

function loadBySeq() {
  var d = ttData
  var cd = class_data[cur_class]
  var a = {0 : '', 1 : showTableSt(d, cd[0], cd[1]), 2 : showTableGr(d, cd[0], cur_day), 3 : showTableTh(d, cur_th)}
  
  ttst.innerHTML = a[c1]
  ttgr.innerHTML = a[c2]
  ttth.innerHTML = a[c3]
}

function getLocalData(key) { return window.localStorage.getItem(key) }

async function searchSchool() {
  var query = document.querySelector("#search_query")
  ttst.innerHTML = ''
  ttgr.innerHTML = ''
  ttth.innerHTML = ''
  data.innerHTML = '<div class="color-wait">검색 결과 불러오는 중</div>'
  var re = await getAPI(domain+`searchSchool/${query.value}`)
  re = re['res']
  var html = `
  <table>
    <tr>
      <td scope="col" class="t-border"> 지역 </td>
      <td scope="col" class='t-border'> 학교 명 </td>
    </tr>`
  if (re == '검색결과가 없습니다.') { html = `<h5>${re}</h5>` }
  else {
    for (var i=0; i < re.length; i++) {
      var cur = re[i]
      if (cur[0] == '알림') {
        html += `<tr><td class="sthd">${cur[0]}</td><td class='sthd'>${cur[1]}</td></tr>`
      } else {
        html += `<tr><td class="sthd">${cur[0]}</td><td class='sthd' onClick='selectSchool("${cur[1]}")'>${cur[1]}</td></tr>`
      }
    }
  }

  data.innerHTML = html
}

function set_date(path) {
  if (path == '/1') { week_data = '1' }
  else if (path == '/2') { week_data = '2' }
  window.localStorage.setItem('week_data', week_data)
  selectSchool(scn, path)
}

function saveData() {
  var k = ['c1', 'c2', 'c3', 'cur_class', 'cur_day', 'cur_th', 'c', 'scn']
  var v = [c1, c2, c3, cur_class, cur_day, cur_th, 1, scn]
  
  for (var i=0; i < k.length; i++) {
   window.localStorage.setItem(k[i], v[i]) 
  }
}

window.onload = function(){
  if (getLocalData('c') == 1) {
    selectSchool(getLocalData('scn'), getLocalData('week_data'))
  }
}
