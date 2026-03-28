        // ═══════════════════════════════════════
        // GLOBAL VARIABLES 
        // ═══════════════════════════════════════
        let registeredName = null;
        const taskSubmitted = [false, false, false, false, false];
        let currentTaskIndex = null;
        let currentSubmitBtn = null;
        const scriptURL = 'https://script.google.com/macros/s/AKfycbw_h0B4kfupJ__qsvi-TA2Fk65HqgjOx62heTAXFE9LWeaiIOLL7qsJLue61kwQ1d0s/exec';

        // ═══════════════════════════════════════
        // THEME & STARTUP
        // ═══════════════════════════════════════
        function toggleTheme() {
            const html = document.documentElement;
            const isDark = html.getAttribute('data-theme') === 'dark';
            html.setAttribute('data-theme', isDark ? 'light' : 'dark');
            localStorage.setItem('workshop-theme', isDark ? 'light' : 'dark');
        }

        // Load saved theme AND registration state
        (function () {
            const saved = localStorage.getItem('workshop-theme');
            if (saved) document.documentElement.setAttribute('data-theme', saved);

            // Check if user is already registered
            const savedName = localStorage.getItem('workshop_registered_name');
            if (savedName) {
                registeredName = savedName;
                // Wait for DOM to be ready to apply UI state
                window.addEventListener('DOMContentLoaded', () => {
                    applyRegisteredState(savedName);
                });
            }
        })();

        // ═══════════════════════════════════════
        // SCROLL PROGRESS
        // ═══════════════════════════════════════
        window.addEventListener('scroll', () => {
            const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
            document.getElementById('scroll-progress').style.width = pct + '%';
            document.getElementById('main-header').classList.toggle('scrolled', window.scrollY > 20);
        });

        // ═══════════════════════════════════════
        // REVEAL ANIMATION
        // ═══════════════════════════════════════
        const revealEls = document.querySelectorAll('.reveal');
        const ro = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
        revealEls.forEach(el => ro.observe(el));

        // ═══════════════════════════════════════
        // TASK TOGGLE
        // ═══════════════════════════════════════
        function toggleTask(head) {
            const body = head.nextElementSibling;
            const btn = head.querySelector('.task-toggle');
            const isOpen = body.classList.contains('open');
            body.classList.toggle('open', !isOpen);
            btn.classList.toggle('open', !isOpen);
        }

        // ═══════════════════════════════════════
        // FAQ
        // ═══════════════════════════════════════
        function toggleFaq(btn) {
            btn.closest('.faq-item').classList.toggle('open');
        }

        // ═══════════════════════════════════════
        // PROGRESS TRACKER
        // ═══════════════════════════════════════
        function updateProgress() {
            const done = taskSubmitted.filter(Boolean).length;
            const pct = Math.round(done / taskSubmitted.length * 100);
            document.getElementById('prog-pct').textContent = pct + '%';
            document.getElementById('prog-fill').style.width = pct + '%';
            taskSubmitted.forEach((v, i) => {
                const ind = document.getElementById('ind-' + i);
                if (ind) ind.classList.toggle('done', v);
            });
        }

        // ═══════════════════════════════════════
        // CHECKLIST
        // ═══════════════════════════════════════
        function toggleCheck(el) { el.classList.toggle('checked'); }

        // ═══════════════════════════════════════
        // HAMBURGER
        // ═══════════════════════════════════════
        document.getElementById('hamburger').addEventListener('click', () => {
            document.getElementById('mobile-nav').classList.toggle('open');
        });
        function closeMobileNav() { document.getElementById('mobile-nav').classList.remove('open'); }

        // ═══════════════════════════════════════
        // CONTACT FORM
        // ═══════════════════════════════════════

        function handleSubmit(btn) {
            // Find the contact card container
            const card = btn.closest('.contact-card');
            const inputs = card.querySelectorAll('input, textarea');

            // Check if all required fields are valid
            let allValid = true;
            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    allValid = false;
                    input.reportValidity(); // Shows the "Please fill out this field" tooltip
                }
            });

            if (allValid) {
                const origText = btn.textContent;
                const origBg = btn.style.background;

                // Change button state
                btn.textContent = 'Message Sent! ✓';
                btn.style.background = '#0d9488'; // Teal Green
                btn.style.pointerEvents = 'none'; // Prevent double clicking

                // Clear the form fields
                inputs.forEach(input => input.value = '');

                // Reset button after 3 seconds
                setTimeout(() => {
                    btn.textContent = origText;
                    btn.style.background = origBg;
                    btn.style.pointerEvents = 'all';
                }, 3000);
            }
        }

        // ═══════════════════════════════════════
        // REGISTRATION MODAL & GOOGLE SHEETS
        // ═══════════════════════════════════════
        function openRegModal(e) {
            if (e) e.preventDefault();
            if (registeredName) return;
            document.getElementById('reg-modal').classList.add('open');
            setTimeout(() => document.getElementById('reg-name').focus(), 100);
        }

        function closeRegModal() {
            document.getElementById('reg-modal').classList.remove('open');
        }

        async function completeRegistration() {
            // Get all inputs
            const nameInput = document.getElementById('reg-name');
            const emailInput = document.getElementById('reg-email');
            const phoneInput = document.getElementById('reg-phone');
            const collegeInput = document.getElementById('reg-college');
            const courseInput = document.getElementById('reg-course');
            const yearInput = document.getElementById('reg-year');
            const submitBtn = document.querySelector('.modal-btn-submit');

            // Extract values
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const college = collegeInput.value.trim();
            const course = courseInput.value.trim();
            const year = yearInput.value.trim();

            // Validation (Crucial checks)
            if (!name || !email || !email.includes('@')) {
                if (!name) nameInput.style.borderColor = 'rgba(239,68,68,0.5)';
                if (!email) emailInput.style.borderColor = 'rgba(239,68,68,0.5)';
                return;
            }

            // Add loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.textContent = "Processing...";
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('Full Name', name);
            formData.append('Email Address', email);
            formData.append('Phone Number', phone);
            formData.append('Institution', college);
            formData.append('Course', course);
            formData.append('Year', year);
            formData.append('Date', new Date().toLocaleString());

            try {
                // Integration: Send to Google Sheets
                await fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' });

                registeredName = name;
                localStorage.setItem('workshop_registered_name', name);
                closeRegModal();
                applyRegisteredState(name);
            } catch (error) {
                console.error('Error!', error.message);
                alert("Connection error. Please try again.");
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }

        function applyRegisteredState(name) {
            document.getElementById('nav-register-btn').style.display = 'none';
            const badge = document.getElementById('nav-registered-badge');
            if (badge) badge.style.display = 'inline-flex';
            const nameDisp = document.getElementById('nav-name-display');
            if (nameDisp) nameDisp.textContent = 'Registered as: ' + name;

            const heroBtn = document.getElementById('hero-register-btn');
            if (heroBtn) {
                heroBtn.classList.remove('btn-orange');
                heroBtn.classList.add('btn-registered');
                heroBtn.innerHTML = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg> Registered as: ${name}`;
            }

            const tasksBtn = document.getElementById('tasks-register-btn');
            if (tasksBtn) {
                tasksBtn.classList.remove('btn-orange');
                tasksBtn.classList.add('btn-registered');
                tasksBtn.style.borderRadius = '100px';
                tasksBtn.innerHTML = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg> Registered as: ${name}`;
                tasksBtn.onclick = null;
            }

            document.querySelectorAll('.register-to-submit-btn').forEach(btn => btn.style.display = 'none');
            document.querySelectorAll('.submit-task-btn').forEach(btn => btn.style.display = 'inline-flex');
        }

        // ═══════════════════════════════════════
        // SUBMIT TASK MODAL
        // ═══════════════════════════════════════
        const taskConfig = [
            {
                title: 'Submit TASK 1: Designing a Poster in Canva',
                subtitle: 'Please provide a link to your completed task',
                instruction: 'Upload both your 1A and 1B poster images to Google Drive, share them, and paste the link below.',
                label: 'Google Drive / Cloud Link',
                placeholder: 'Paste your Google Drive link here'
            },
            {
                title: 'Submit TASK 2: Logo & Branding Kit',
                subtitle: 'Please provide a link to your completed task',
                instruction: 'Upload your ZACK\'O logo (2A) and your personal logo (2B) PNG files to Google Drive.',
                label: 'Google Drive / Cloud Link',
                placeholder: 'Paste your Google Drive link here'
            },
            {
                title: 'Submit TASK 3: Getting Started with ChatGPT',
                subtitle: 'Please provide a link to your completed task',
                instruction: 'Copy your portfolio content into a Google Doc and paste the link below.',
                label: 'Google Doc Link',
                placeholder: 'Paste your Google Doc link here'
            },
            {
                title: 'Submit TASK 4: Portfolio Website',
                subtitle: 'Please provide a link to your completed task',
                instruction: 'After deploying on Netlify, paste your live website URL below.',
                label: 'Netlify Website Link',
                placeholder: 'Paste your Netlify website link here'
            },
            {
                title: 'Submit TASK 5: Fashion Website',
                subtitle: 'Please provide a link to your completed task',
                instruction: 'After publishing on Canva, paste the public website URL below.',
                label: 'Canva Website Link',
                placeholder: 'Paste your Canva website link here'
            }
        ];

        function openSubmitModal(taskIdx, btn) {
            currentTaskIndex = taskIdx;
            currentSubmitBtn = btn;
            const config = taskConfig[taskIdx];
            document.getElementById('submit-modal-title').textContent = config.title;
            document.getElementById('submit-modal-subtitle').textContent = config.subtitle;
            document.getElementById('submit-instruction').innerHTML = config.instruction;
            document.getElementById('submit-link-label').textContent = config.label;
            document.getElementById('submit-link-input').placeholder = config.placeholder;
            document.getElementById('submit-link-input').value = '';
            document.getElementById('submit-modal').classList.add('open');
            setTimeout(() => document.getElementById('submit-link-input').focus(), 100);
        }

        function closeSubmitModal() {
            document.getElementById('submit-modal').classList.remove('open');
            currentTaskIndex = null;
            currentSubmitBtn = null;
        }

        function confirmSubmitTask() {
            const link = document.getElementById('submit-link-input').value.trim();
            if (!link) {
                document.getElementById('submit-link-input').style.borderColor = 'rgba(239,68,68,0.5)';
                return;
            }
            taskSubmitted[currentTaskIndex] = true;
            updateProgress();
            if (currentSubmitBtn) {
                currentSubmitBtn.classList.add('btn-submitted');
                currentSubmitBtn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Submitted ✓`;
            }
            closeSubmitModal();
        }

        // Modal Events
        document.getElementById('reg-modal').addEventListener('click', function (e) { if (e.target === this) closeRegModal(); });
        document.getElementById('submit-modal').addEventListener('click', function (e) { if (e.target === this) closeSubmitModal(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeRegModal(); closeSubmitModal(); }
            if (e.key === 'Enter' && document.getElementById('reg-modal').classList.contains('open')) completeRegistration();
            if (e.key === 'Enter' && document.getElementById('submit-modal').classList.contains('open')) confirmSubmitTask();
        });

        // Theme Switcher Logic
        const toggleSwitch = document.querySelector('#checkbox');
        if (toggleSwitch) {
            toggleSwitch.addEventListener('change', function (e) {
                const theme = e.target.checked ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('workshop-theme', theme);
            }, false);
        }

        