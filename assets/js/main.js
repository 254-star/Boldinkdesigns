(function () {
  var header = document.querySelector('.site-header');
  var btn = document.querySelector('.menu-btn');
  if (btn && header) {
    btn.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image viewer');
  lightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close image viewer">&times;</button><img alt="">';
  document.body.appendChild(lightbox);
  var lightboxImage = lightbox.querySelector('img');
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
  }
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-lightbox]');
    if (trigger) {
      e.preventDefault();
      lightboxImage.src = trigger.dataset.lightbox;
      lightboxImage.alt = trigger.querySelector('img') ? trigger.querySelector('img').alt : '';
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
    }
    if (e.target === lightbox || e.target.closest('.lightbox-close')) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  var form = document.getElementById('quote-form');
  if (!form) return;
  var status = form.querySelector('.form-status');

  function say(msg) { if (status) status.textContent = msg; }
  function requestText() {
    var d = Object.fromEntries(new FormData(form).entries());
    return 'New quote request\nName: ' + d.name + '\nEmail: ' + d.email +
      '\nPhone: ' + (d.phone || '-') + '\nService: ' + d.service + '\n\n' + d.message;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var d = Object.fromEntries(new FormData(form).entries());
    var text = requestText();
    var endpoint = form.dataset.endpoint;
    var wa = form.dataset.whatsapp;
    var mail = form.dataset.email;

    if (endpoint) {
      say('Sending...');
      fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
        .then(function (r) {
          return r.json().then(function (data) {
            if (!r.ok || !data.success) throw new Error(data.message || 'Form submission failed');
            return data;
          });
        })
        .then(function () {
          form.reset();
          say('Thank you! Your message has been sent. We will reply soon.');
        })
        .catch(function () { say('Sorry, something went wrong. Please try again or contact us directly.'); });
    } else if (mail) {
      window.location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Quote request: ' + d.service) + '&body=' + encodeURIComponent(text);
      say('Opening your email app...');
    } else {
      say('The contact form is not connected yet. Please check back soon.');
    }
  });
})();
