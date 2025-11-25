// Lightweight client-side table pagination
// Usage:
// 1) Add data-paginate="true" to your <table>.
// 2) Optionally add data-page-sizes="10,20,50,100" to customize sizes.
// 3) Include this script on the page. It will auto-initialize.

(function(){
  function parseSizes(attr){
    if(!attr) return [10,20,50,100];
    try {
      return attr.split(',').map(s=>parseInt(s.trim(),10)).filter(n=>!isNaN(n) && n>0);
    } catch(e){
      return [10,20,50,100];
    }
  }

  function createControls(){
    const wrap = document.createElement('div');
    wrap.className = 'tp-controls';
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '10px';
    wrap.style.margin = '8px 0';

    const label = document.createElement('label');
    label.textContent = 'Show';

    const select = document.createElement('select');
    select.className = 'tp-size';
    select.style.padding = '6px 8px';
    select.style.border = '1px solid #ccc';
    select.style.borderRadius = '6px';

    const perPage = document.createElement('span');
    perPage.textContent = 'entries';

    const info = document.createElement('span');
    info.className = 'tp-info';
    info.style.flex = '1';
    info.style.color = '#555';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'tp-prev';
    prev.textContent = 'Prev';
    prev.style.padding = '6px 10px';
    prev.style.border = '1px solid #ccc';
    prev.style.borderRadius = '6px';
    prev.style.background = '#fff';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'tp-next';
    next.textContent = 'Next';
    next.style.padding = '6px 10px';
    next.style.border = '1px solid #ccc';
    next.style.borderRadius = '6px';
    next.style.background = '#fff';

    wrap.appendChild(label);
    wrap.appendChild(select);
    wrap.appendChild(perPage);
    wrap.appendChild(info);
    wrap.appendChild(prev);
    wrap.appendChild(next);
    return {wrap, select, info, prev, next};
  }

  function paginateTable(table){
    if(table.__tp_init) return; // avoid double init
    const tbody = table.tBodies[0];
    if(!tbody) return;

    const sizes = parseSizes(table.getAttribute('data-page-sizes'));
    const ctrlTop = createControls();
    const ctrlBottom = createControls();

    // Insert controls before and after table
    table.parentNode.insertBefore(ctrlTop.wrap, table);
    if(table.nextSibling) table.parentNode.insertBefore(ctrlBottom.wrap, table.nextSibling);
    else table.parentNode.appendChild(ctrlBottom.wrap);

    // Populate size selects
    [ctrlTop.select, ctrlBottom.select].forEach(sel => {
      sizes.forEach(sz => {
        const opt = document.createElement('option');
        opt.value = String(sz);
        opt.textContent = String(sz);
        sel.appendChild(opt);
      });
    });

    // State
    let pageSize = sizes[0] || 10;
    let pageIndex = 0; // 0-based

    function getRows(){
      return Array.from(tbody.rows);
    }

    function render(){
      const rows = getRows();
      const total = rows.length;
      const pageCount = Math.max(1, Math.ceil(total / pageSize));
      if(pageIndex >= pageCount) pageIndex = pageCount - 1;
      const start = pageIndex * pageSize;
      const end = start + pageSize;

      rows.forEach((tr, idx) => {
        tr.style.display = (idx >= start && idx < end) ? '' : 'none';
      });

      const showingStart = total === 0 ? 0 : start + 1;
      const showingEnd = Math.min(end, total);
      const infoText = `Showing ${showingStart} to ${showingEnd} of ${total} entries`;
      ctrlTop.info.textContent = infoText;
      ctrlBottom.info.textContent = infoText;

      ctrlTop.prev.disabled = pageIndex === 0;
      ctrlBottom.prev.disabled = pageIndex === 0;
      ctrlTop.next.disabled = pageIndex >= pageCount - 1;
      ctrlBottom.next.disabled = pageIndex >= pageCount - 1;
    }

    function setSize(newSize){
      const n = parseInt(newSize, 10);
      if(!isNaN(n) && n > 0){
        // compute first row index to keep top row visible after changing size
        const firstIdx = pageIndex * pageSize;
        pageSize = n;
        pageIndex = Math.floor(firstIdx / pageSize);
        render();
      }
    }

    // Wire events
    [ctrlTop.select, ctrlBottom.select].forEach(sel => {
      sel.value = String(pageSize);
      sel.addEventListener('change', (e)=>{
        setSize(e.target.value);
        // sync both selects
        ctrlTop.select.value = String(pageSize);
        ctrlBottom.select.value = String(pageSize);
      });
    });
    [ctrlTop.prev, ctrlBottom.prev].forEach(btn => btn.addEventListener('click', ()=>{ if(pageIndex>0){ pageIndex--; render(); }}));
    [ctrlTop.next, ctrlBottom.next].forEach(btn => btn.addEventListener('click', ()=>{
      const total = getRows().length;
      const pageCount = Math.max(1, Math.ceil(total / pageSize));
      if(pageIndex < pageCount - 1){ pageIndex++; render(); }
    }));

    // Observe tbody for changes (e.g., after data loads or filters)
    const obs = new MutationObserver(()=>{
      // Ensure we stay within bounds and refresh
      const total = getRows().length;
      const pageCount = Math.max(1, Math.ceil(total / pageSize));
      if(pageIndex >= pageCount) pageIndex = pageCount - 1;
      render();
    });
    obs.observe(tbody, { childList: true, subtree: false });

    // Initial render
    table.__tp_init = true;
    render();
  }

  function init(){
    const tables = Array.from(document.querySelectorAll('table[data-paginate="true"]'));
    tables.forEach(paginateTable);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose manual API if needed
  window.applyTablePager = function(selector){
    const els = typeof selector === 'string' ? document.querySelectorAll(selector) : (selector instanceof Element ? [selector] : selector);
    Array.from(els).forEach(el => paginateTable(el));
  };
})();
