// script.js - Clean working version (only Download PDF button)

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generatePDF() {
  const form = document.getElementById('scholarshipForm');
  if (!form) {
    alert('Form element not found.');
    return;
  }

  const formData = new FormData(form);

  fetch('template.html')
    .then(res => {
      if (!res.ok) throw new Error('template.html not found');
      return res.text();
    })
    .then(template => {
      let html = template;

      // Replace {{FieldName}} placeholders with actual form data
      for (const [key, value] of formData.entries()) {
        const safeKey = escapeRegExp(key);
        html = html.replace(new RegExp('{{' + safeKey + '}}', 'g'), value || '');
      }

      // Create a temporary container for rendering the PDF
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.width = '190mm';
      container.style.padding = '0';
      container.style.margin = '0 auto';
      container.style.background = '#fff';
      container.style.fontFamily = "'Mangal', Arial, sans-serif";
      container.style.fontSize = '11pt';
      document.body.appendChild(container);

      // PDF generation options
      const opt = {
        margin: [11, 8, 11, 8], // top, right, bottom, left (mm)
        filename: 'ScholarshipForm.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Generate and save PDF
      html2pdf()
        .set(opt)
        .from(container)
        .save()
        .then(() => {
          document.body.removeChild(container);
        })
        .catch(err => {
          console.error('PDF generation error:', err);
          alert('PDF generation failed. Check console for details.');
          document.body.removeChild(container);
        });
    })
    .catch(err => {
      console.error('Template loading error:', err);
      alert('Error loading template.html. Make sure it’s in the same folder and you’re using Live Server.');
    });
}

/* -----------------------
  Inline "इतर" Option Editor
  (Keep this part as is — it works for dropdowns with 'इतर' option)
------------------------*/
(function () {
  function hasItarOption(sel) {
    for (let i = 0; i < sel.options.length; i++) {
      const v = (sel.options[i].value || sel.options[i].text || '').trim();
      if (v === 'इतर') return true;
    }
    return false;
  }

  function makeEditableInPlace(select) {
    function changeHandler() {
      if ((this.value || '').trim() !== 'इतर') return;

      const sel = this;
      const input = document.createElement('input');
      input.type = 'text';
      input.name = sel.name || ('temp_' + Math.random().toString(36).slice(2));
      input.className = sel.className || '';
      input.style.cssText = sel.style.cssText || '';

      const rect = sel.getBoundingClientRect();
      const widthPx = (rect.width && rect.width > 0)
        ? rect.width + 'px'
        : (sel.style.width ? sel.style.width : '250px');

      input.style.width = widthPx;
      input.style.boxSizing = 'border-box';
      input.style.fontFamily = window.getComputedStyle(sel).fontFamily || '';
      input.style.fontSize = window.getComputedStyle(sel).fontSize || '';

      sel.parentNode.replaceChild(input, sel);
      input.focus();

      function restore(accept) {
        const typed = input.value ? input.value.trim() : '';
        if (accept && typed.length > 0) {
          let already = false;
          for (let j = 0; j < sel.options.length; j++) {
            if ((sel.options[j].value || sel.options[j].text || '') === typed) {
              already = true;
              break;
            }
          }
          if (!already) {
            const opt = document.createElement('option');
            opt.value = typed;
            opt.text = typed;
            sel.add(opt);
          }
          sel.value = typed;
        } else {
          try { sel.value = ''; } catch (e) {}
        }

        input.parentNode.replaceChild(sel, input);
        setTimeout(() => {
          sel.addEventListener('change', changeHandler);
          try { sel.focus(); } catch (e) {}
        }, 0);
      }

      sel.removeEventListener('change', changeHandler);

      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          input.blur();
        } else if (ev.key === 'Escape') {
          restore(false);
        }
      });

      input.addEventListener('blur', function () {
        const typedVal = input.value ? input.value.trim() : '';
        restore(typedVal.length > 0);
      });
    }

    select.addEventListener('change', changeHandler);
  }

  function initItarEditors() {
    const selects = document.querySelectorAll('select');
    selects.forEach(sel => {
      if (hasItarOption(sel)) makeEditableInPlace(sel);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initItarEditors);
  } else {
    initItarEditors();
  }
})();