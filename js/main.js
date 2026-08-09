(function () {
  /* ==========================================================================
     THEME MANAGEMENT
     ========================================================================== */
  const STORAGE_KEY = 'theme';

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
  }

  // Apply theme immediately before render to prevent flash
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  /* ==========================================================================
     DOM INTERACTIONS & MOBILE MENU
     ========================================================================== */
  function initApp() {
    // Theme toggle handler
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      applyTheme(getPreferredTheme());
      themeToggleBtn.addEventListener('click', function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, newTheme);
        applyTheme(newTheme);
      });
    }

    // Mobile Navigation Toggle
    const menuToggleBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const header = document.querySelector('header');

    if (menuToggleBtn && navLinks) {
      function openMenu() {
        navLinks.classList.add('is-open');
        menuToggleBtn.setAttribute('aria-expanded', 'true');
        menuToggleBtn.setAttribute('aria-label', 'Close navigation menu');
      }

      function closeMenu() {
        navLinks.classList.remove('is-open');
        menuToggleBtn.setAttribute('aria-expanded', 'false');
        menuToggleBtn.setAttribute('aria-label', 'Open navigation menu');
      }

      function toggleMenu() {
        const isOpen = navLinks.classList.contains('is-open');
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      }

      menuToggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMenu();
      });

      // Close menu when clicking a link
      const links = navLinks.querySelectorAll('a');
      links.forEach(function (link) {
        link.addEventListener('click', function () {
          closeMenu();
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', function (e) {
        if (header && !header.contains(e.target) && navLinks.classList.contains('is-open')) {
          closeMenu();
        }
      });

      // Close menu on Escape key press
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
          closeMenu();
          menuToggleBtn.focus();
        }
      });

      // Close menu on resize above mobile breakpoint (768px)
      window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && navLinks.classList.contains('is-open')) {
          closeMenu();
        }
      });
    }

    /* ==========================================================================
       CONTACT FORM MODAL & WEB3FORMS INTEGRATION
       ========================================================================== */
    const modalTrigger = document.getElementById('contact-modal-trigger');
    const modal = document.getElementById('contact-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = document.getElementById('submit-btn');
    const formFeedback = document.getElementById('form-feedback');

    // Web3Forms Configuration
    const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
    const WEB3FORMS_ACCESS_KEY = '3aac3268-dede-4585-b7b6-3e22fc4a3700';

    if (modalTrigger && modal) {
      function openModal() {
        modal.classList.add('is-active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus first field
        setTimeout(function () {
          if (nameInput) nameInput.focus();
        }, 100);
      }

      function closeModal() {
        modal.classList.remove('is-active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Reset feedback and validation
        clearValidationErrors();
        if (formFeedback) {
          formFeedback.className = 'form-feedback';
          formFeedback.textContent = '';
        }

        // Return focus to trigger button
        if (modalTrigger) modalTrigger.focus();
      }

      modalTrigger.addEventListener('click', openModal);

      if (modalClose) {
        modalClose.addEventListener('click', closeModal);
      }

      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
      }

      // Keyboard Trap & Escape Listener
      document.addEventListener('keydown', function (e) {
        if (!modal.classList.contains('is-active')) return;

        if (e.key === 'Escape') {
          closeModal();
          return;
        }

        // Focus Trap
        if (e.key === 'Tab') {
          const focusables = modal.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          const firstFocusable = focusables[0];
          const lastFocusable = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              lastFocusable.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              firstFocusable.focus();
              e.preventDefault();
            }
          }
        }
      });

      /* ----------------------------------------------------------------------
         Form Validation & Web3Forms Submission Flow
         ---------------------------------------------------------------------- */
      function showError(inputEl, errorEl, message) {
        if (inputEl) inputEl.classList.add('has-error');
        if (errorEl) errorEl.textContent = message;
      }

      function clearError(inputEl, errorEl) {
        if (inputEl) inputEl.classList.remove('has-error');
        if (errorEl) errorEl.textContent = '';
      }

      function clearValidationErrors() {
        clearError(nameInput, document.getElementById('name-error'));
        clearError(emailInput, document.getElementById('email-error'));
        clearError(subjectInput, document.getElementById('subject-error'));
        clearError(messageInput, document.getElementById('message-error'));
      }

      function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
      }

      function validateForm() {
        clearValidationErrors();
        let isValid = true;

        if (!nameInput.value.trim()) {
          showError(nameInput, document.getElementById('name-error'), 'Name is required.');
          isValid = false;
        }

        if (!emailInput.value.trim()) {
          showError(emailInput, document.getElementById('email-error'), 'Email is required.');
          isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
          showError(emailInput, document.getElementById('email-error'), 'Please enter a valid email address.');
          isValid = false;
        }

        if (!subjectInput.value.trim()) {
          showError(subjectInput, document.getElementById('subject-error'), 'Subject is required.');
          isValid = false;
        }

        if (!messageInput.value.trim()) {
          showError(messageInput, document.getElementById('message-error'), 'Message is required.');
          isValid = false;
        }

        return isValid;
      }

      // Realtime validation clear on input
      [nameInput, emailInput, subjectInput, messageInput].forEach(function (input) {
        if (input) {
          input.addEventListener('input', function () {
            const errorId = input.id.replace('contact-', '') + '-error';
            clearError(input, document.getElementById(errorId));
          });
        }
      });

      if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
          e.preventDefault();

          if (!validateForm()) {
            // Focus first invalid field
            const firstError = contactForm.querySelector('.has-error');
            if (firstError) firstError.focus();
            return;
          }

          // Build Web3Forms Submission Payload with enhanced subject, from_name, and replyto
          const submittedSubject = subjectInput.value.trim();
          const visitorName = nameInput.value.trim();
          const visitorEmail = emailInput.value.trim();
          const visitorMessage = messageInput.value.trim();

          const payload = {
            access_key: WEB3FORMS_ACCESS_KEY,
            from_name: 'Rochak Portfolio',
            subject: submittedSubject ? `New Portfolio Message — ${submittedSubject}` : 'New Portfolio Message',
            replyto: visitorEmail,
            name: visitorName,
            email: visitorEmail,
            subject_detail: submittedSubject,
            message: visitorMessage,
          };

          // Disable submit button & set loading state
          if (submitBtn) {
            submitBtn.disabled = true;
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Sending...';
          }

          if (formFeedback) {
            formFeedback.className = 'form-feedback';
            formFeedback.textContent = '';
          }

          // POST request to Web3Forms API
          fetch(WEB3FORMS_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
          })
            .then(function (response) {
              return response.json().then(function (data) {
                if (response.ok && data.success) {
                  showSuccessState(data.message || 'Thank you! Your message has been sent successfully.');
                } else {
                  throw new Error(data.message || 'Failed to send message via Web3Forms.');
                }
              });
            })
            .catch(function (error) {
              showErrorState(error.message || 'Unable to send message. Please try again.');
            });

          function showSuccessState(msg) {
            if (formFeedback) {
              formFeedback.className = 'form-feedback success';
              formFeedback.textContent = msg;
            }
            if (contactForm) contactForm.reset();
            clearValidationErrors();

            if (submitBtn) {
              submitBtn.disabled = false;
              const btnText = submitBtn.querySelector('.btn-text');
              if (btnText) btnText.textContent = 'Send Message';
            }
          }

          function showErrorState(errorMsg) {
            if (formFeedback) {
              formFeedback.className = 'form-feedback error';
              formFeedback.textContent = errorMsg;
            }

            if (submitBtn) {
              submitBtn.disabled = false;
              const btnText = submitBtn.querySelector('.btn-text');
              if (btnText) btnText.textContent = 'Send Message';
            }
          }
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
