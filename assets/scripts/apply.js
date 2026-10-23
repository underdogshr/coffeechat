(function () {
  // 신청 접수를 처리하는 기존 Google Apps Script 웹 앱 URL.
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbyexy8yif2E3djmESTybw_6Vsg5CSwoMhYe5FGlS57y_5IHBgOS6TMUChXYPB3RjRpgkA/exec';
  var st = {
    topic: null,
    sel: [],
    times: [],
    mode: null,
    file: null,
    fileSize: 0
  };
  var $ = function (id) {
    return document.getElementById(id);
  };

  // topics
  var TOPICS = [{
    id: 'brand',
    label: '브랜드·크리에이티브 이야기',
    who: 'Brand Cell과 이야기해요',
    cell: 'Brand Cell',
    prompt: '브랜드·크리에이티브에 대해 궁금한 점을 적어주세요 (선택)',
    ph: '예) 유디임팩트 브랜드 캠페인은 어떻게 기획되나요?'
  }, {
    id: 'people',
    label: '조직문화·일하는 방식·\n커리어 이야기',
    who: 'People Cell과 이야기해요',
    cell: 'People Cell',
    prompt: '조직문화·일하는 방식·커리어에 대해 궁금한 점을 적어주세요 (선택)',
    ph: '예) Act-preneur로 일한다는 건 실제로 어떤 모습인가요?'
  }, {
    id: 'unsure',
    label: '아직 잘 모르겠어요',
    who: 'People Cell이 함께 찾아드려요',
    cell: 'People Cell',
    prompt: '지금 고민 중인 것, 무엇이든 편하게 적어주세요 (선택)',
    ph: '예) 제 경험이 유디임팩트의 어떤 일과 맞을지 궁금해요.'
  }];
  TOPICS.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'opt-btn topic';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', 'false');
    var bb = document.createElement('b');
    bb.textContent = t.label;
    var sp = document.createElement('span');
    sp.textContent = t.who;
    b.appendChild(bb);
    b.appendChild(sp);
    b.onclick = function () {
      st.topic = t.id;
      [].forEach.call($('topics').children, function (x) {
        x.setAttribute('aria-checked', 'false');
      });
      b.setAttribute('aria-checked', 'true');
      $('qlabel').textContent = t.prompt;
      $('question').placeholder = t.ph;
      $('qbar').classList.add('on');
    };
    $('topics').appendChild(b);
  });

  // slots & modes
  function toggles(el, list, multi) {
    list.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt-btn pill';
      b.textContent = o.label;
      if (multi) {
        b.setAttribute('aria-pressed', 'false');
        b.onclick = function () {
          var i = st.times.indexOf(o.id);
          if (i < 0) st.times.push(o.id);
          else st.times.splice(i, 1);
          b.setAttribute('aria-pressed', i < 0 ? 'true' : 'false');
        };
      } else {
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', 'false');
        b.onclick = function () {
          st.mode = o.id;
          [].forEach.call(el.children, function (x) {
            x.setAttribute('aria-checked', 'false');
          });
          b.setAttribute('aria-checked', 'true');
        };
      }
      el.appendChild(b);
    });
  }
  var SLOTS = [{
    id: '오전 10–12시',
    label: '오전 10–12시'
  }, {
    id: '오후 2–5시',
    label: '오후 2–5시'
  }, {
    id: '저녁 6–8시',
    label: '저녁 6–8시'
  }];
  var MODES = [{
    id: '온라인(Zoom)',
    label: '온라인 (Zoom)'
  }, {
    id: '오프라인(대면)',
    label: '오프라인 (대면)'
  }];
  toggles($('slots'), SLOTS, true);
  toggles($('modes'), MODES, false);

  // calendar
  var HOLI = ['2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18', '2026-03-02', '2026-05-01', '2026-05-05', '2026-05-25', '2026-06-03', '2026-07-17', '2026-08-17', '2026-09-24', '2026-09-25', '2026-09-26', '2026-10-03', '2026-10-05', '2026-10-09', '2026-12-25'];
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  var now = new Date(),
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var minD = new Date(today);
  minD.setDate(minD.getDate() + 1);
  var maxD = new Date(today.getFullYear(), 11, 31);
  if (maxD < minD) {
    maxD = new Date(minD);
    maxD.setDate(maxD.getDate() + 30);
  }
  var vy = minD.getFullYear(),
    vm = minD.getMonth();
  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }
  function key(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function lbl(k) {
    var p = k.split('-'),
      d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.getMonth() + 1 + '/' + d.getDate() + '(' + DOW[d.getDay()] + ')';
  }
  function renderCal() {
    $('mLabel').textContent = vy + '년 ' + (vm + 1) + '월';
    var idx = vy * 12 + vm;
    $('prev').disabled = idx <= minD.getFullYear() * 12 + minD.getMonth();
    $('next').disabled = idx >= maxD.getFullYear() * 12 + maxD.getMonth();
    var box = $('days');
    box.innerHTML = '';
    var lead = new Date(vy, vm, 1).getDay(),
      n = new Date(vy, vm + 1, 0).getDate();
    for (var i = 0; i < lead; i++) {
      box.appendChild(document.createElement('span'));
    }
    for (var dd = 1; dd <= n; dd++) {
      (function (dd) {
        var d = new Date(vy, vm, dd),
          k = key(d),
          w = d.getDay(),
          hol = HOLI.indexOf(k) >= 0,
          dis = d < minD || d > maxD || w === 0 || w === 6 || hol,
          on = st.sel.indexOf(k) >= 0;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'day';
        b.textContent = dd;
        b.disabled = dis;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.setAttribute('aria-label', vm + 1 + '월 ' + dd + '일 ' + DOW[w] + '요일' + (hol ? ' 공휴일' : '') + (dis ? ' 선택 불가' : ''));
        b.onclick = function () {
          var i = st.sel.indexOf(k);
          if (i >= 0) st.sel.splice(i, 1);
          else if (st.sel.length < 3) {
            st.sel.push(k);
            st.sel.sort();
          }
          renderCal();
          renderChips();
        };
        box.appendChild(b);
      })(dd);
    }
    $('cnt').textContent = '(' + st.sel.length + '/3 선택)';
  }
  function renderChips() {
    var c = $('chips');
    c.innerHTML = '';
    $('noSel').style.display = st.sel.length ? 'none' : '';
    st.sel.forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = lbl(k) + ' ×';
      b.setAttribute('aria-label', lbl(k) + ' 선택 해제');
      b.onclick = function () {
        st.sel.splice(st.sel.indexOf(k), 1);
        renderChips();
        renderCal();
      };
      c.appendChild(b);
    });
  }
  function setPop(on) {
    $('pop').classList.toggle('on', on);
    $('calBtn').setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) renderCal();
  }
  $('calBtn').onclick = function () {
    setPop(!$('pop').classList.contains('on'));
  };
  $('closeCal').onclick = function () {
    setPop(false);
    $('calBtn').focus();
  };
  $('prev').onclick = function () {
    vm--;
    if (vm < 0) {
      vm = 11;
      vy--;
    }
    renderCal();
  };
  $('next').onclick = function () {
    vm++;
    if (vm > 11) {
      vm = 0;
      vy++;
    }
    renderCal();
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && $('pop').classList.contains('on')) {
      setPop(false);
      $('calBtn').focus();
    }
  });
  document.addEventListener('click', function (e) {
    if ($('pop').classList.contains('on') && !$('pop').contains(e.target) && e.target !== $('calBtn') && !$('calBtn').contains(e.target) && !e.target.closest('.day')) {
      setPop(false);
    }
  });
  renderChips();

  // file
  $('resume').onchange = function (e) {
    var f = e.target.files && e.target.files[0];
    st.file = f ? f.name : null;
    st.fileSize = f ? f.size : 0;
    $('fileLb').textContent = f ? f.name : '파일 선택하기 (PDF 권장)';
  };

  // submit
  $('f').onsubmit = function (e) {
    e.preventDefault();
    var v = function (id) {
        return ($(id).value || '').trim();
      },
      miss = [];
    if (!v('name')) miss.push('이름');
    if (!v('phone')) miss.push('연락처');
    if (!v('email') || !$('email').checkValidity()) miss.push('이메일');
    if (!v('intro')) miss.push('자기소개');
    if (!st.topic) miss.push('나누고 싶은 이야기');
    if (!st.sel.length) miss.push('가능한 일정');
    if (!st.times.length) miss.push('선호 시간대');
    if (!st.mode) miss.push('선호하는 방식');
    if (!st.file) miss.push('이력서');
    if (!$('agree').checked) miss.push('개인정보 동의(필수)');
    if (miss.length) {
      $('err').innerHTML = '';
      var b = document.createElement('b');
      b.textContent = '아직 입력하지 않은 항목이 있어요. ';
      $('err').appendChild(b);
      $('err').appendChild(document.createTextNode('(' + miss.join(', ') + ')'));
      $('err').classList.add('on');
      $('err').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }
    $('err').classList.remove('on');
    if (st.fileSize > 10 * 1024 * 1024) {
      $('err').textContent = '이력서 파일은 10MB 이하로 첨부해 주세요.';
      $('err').classList.add('on');
      return;
    }
    var t = TOPICS.filter(function (x) {
      return x.id === st.topic;
    })[0];
    if ($('hp').value) return;
    var sb = document.querySelector('.submit');
    sb.disabled = true;
    sb.textContent = '보내는 중…';
    var file = $('resume').files[0];
    var rd = new FileReader();
    rd.onerror = function () {
      fail('이력서 파일을 읽지 못했어요. 다른 파일로 다시 시도해 주세요.');
    };
    rd.onload = function () {
      var payload = {
        name: v('name'),
        phone: v('phone'),
        email: v('email'),
        intro: v('intro'),
        topic: t.label,
        cell: t.cell,
        question: v('question'),
        dates: st.sel.map(lbl).join(', '),
        times: st.times.join(', '),
        mode: st.mode,
        link: v('link'),
        agree: '동의',
        pool: $('pool').checked ? '동의' : '미동의',
        file: {
          name: file.name,
          type: file.type || 'application/octet-stream',
          data: String(rd.result).split(',')[1]
        }
      };
      fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      }).then(function (r) {
        return r.json();
      }).then(function (res) {
        if (res && res.ok) {
          $('f').style.display = 'none';
          $('done').classList.add('on');
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else fail(res && res.message || '신청을 저장하지 못했어요.');
      }).catch(function () {
        fail('네트워크 문제로 신청이 전송되지 않았어요.');
      });
    };
    rd.readAsDataURL(file);
  };
  function fail(msg) {
    var sb = document.querySelector('.submit');
    sb.disabled = false;
    sb.innerHTML = '커피챗 신청하기 <span aria-hidden="true">↗</span>';
    $('err').textContent = msg + ' 잠시 후 다시 시도하시거나 hr@udimpact.ai로 문의해 주세요.';
    $('err').classList.add('on');
  }
})();
