const TOTAL_FRAMES = 192;
const FRAME_DIRECTORY = 'frames';
const FRAME_PREFIX = 'frame_';
const FRAME_EXTENSION = '.jpg';

const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('loader');
const progressEl = document.getElementById('progress');
const scrollHint = document.getElementById('scroll-hint');

const images = [];
let loadedCount = 0;
let currentFrame = 0;
let targetFrame = 0;
let lastRenderedFrame = -1;

// Format frame filename: frame_0001.jpg -> frame_0192.jpg
function getFramePath(index) {
  const paddedIndex = String(index).padStart(4, '0');
  return `${FRAME_DIRECTORY}/${FRAME_PREFIX}${paddedIndex}${FRAME_EXTENSION}`;
}

// Adjust canvas resolution for crisp display on high-DPI (Retina) screens
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;

  const targetWidth = Math.round(displayWidth * dpr);
  const targetHeight = Math.round(displayHeight * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    lastRenderedFrame = -1; // Force re-render
  }
}

// Render image maintaining cover aspect ratio centered on canvas
function drawFrame(frameIndex) {
  const img = images[frameIndex];
  if (!img || !img.complete || img.naturalWidth === 0) {
    return; // Keep current frame on screen, don't clear or flash
  }

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  // Cover calculation: scale to fill entire screen, center-cropped
  const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;
  const offsetX = (canvasWidth - scaledWidth) / 2;
  const offsetY = (canvasHeight - scaledHeight) / 2;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
  lastRenderedFrame = frameIndex;
}

// Preload all 192 frames in memory
function preloadFrames() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const frameIndex = i - 1;
    img.src = getFramePath(i);

    img.onload = () => {
      loadedCount++;
      const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
      if (progressEl) {
        progressEl.textContent = `${percent}%`;
      }

      // Draw first frame as soon as frame 1 is loaded
      if (frameIndex === 0 && lastRenderedFrame === -1) {
        resizeCanvas();
        drawFrame(0);
      }

      if (loadedCount >= TOTAL_FRAMES) {
        if (loader) {
          loader.classList.add('hidden');
        }
      }
    };

    img.onerror = () => {
      loadedCount++;
      if (loadedCount >= TOTAL_FRAMES && loader) {
        loader.classList.add('hidden');
      }
    };

    images.push(img);
  }
}

// Track scroll percentage (0.0 to 1.0) and map to frame range (0 to 191)
function updateScrollProgress() {
  const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;

  targetFrame = scrollFraction * (TOTAL_FRAMES - 1);

  if (scrollTop > 30 && scrollHint && !scrollHint.classList.contains('hidden')) {
    scrollHint.classList.add('hidden');
  }
}

// Animation loop with smooth interpolation (lerp)
function animationLoop() {
  // Smooth lerp (0.12 gives responsive yet silky smooth inertia)
  currentFrame += (targetFrame - currentFrame) * 0.12;

  if (Math.abs(targetFrame - currentFrame) < 0.005) {
    currentFrame = targetFrame;
  }

  const frameToRender = Math.round(currentFrame);

  if (frameToRender !== lastRenderedFrame) {
    drawFrame(frameToRender);
  }

  requestAnimationFrame(animationLoop);
}

// Event Listeners
window.addEventListener('resize', () => {
  resizeCanvas();
  drawFrame(Math.round(currentFrame));
});

window.addEventListener('scroll', updateScrollProgress, { passive: true });

// Init
resizeCanvas();
preloadFrames();
requestAnimationFrame(animationLoop);

/* ==========================================================================
   Interactive Modals & Data Showcase
   ========================================================================== */

// Detailed Project Database
const projectsData = {
  robot: {
    title: "Arduino Obstacle Avoiding Robot",
    badge: "AUTONOMOUS ROBOTICS & EMBEDDED C",
    tagline: "Autonomous 2WD navigation robot mapping physical space and avoiding barriers with ultrasonic radar.",
    image: "assets/project-robot.svg",
    overview: "Engineered a self-navigating autonomous robotic vehicle built around the ATmega328P microcontroller. When an obstacle is detected within a 25cm threshold, the system halts, swings the ultrasonic sensor on a 180° servo radar sweep, measures distance in multiple directions, and automatically executes differential steering towards the clearest path.",
    components: [
      "Arduino Uno R3 (ATmega328P)",
      "HC-SR04 Ultrasonic Distance Sensor",
      "SG90 Micro Servo (Radar Sweep Mount)",
      "L298N Dual H-Bridge Motor Driver Module",
      "2x TT Geared DC Motors with Rubber Grip Wheels",
      "Dual 18650 Li-ion 3.7V Rechargeable Battery Bank",
      "Acrylic Chassis with Smooth Caster Wheel"
    ],
    highlights: [
      "Real-time ultrasonic distance calculation: distance = (pulse_duration * 0.0343) / 2",
      "Sub-40ms obstacle detection reaction latency at full drive speed",
      "Autonomous 3-point scanning (Front, Left, Right) to evaluate optimal escape route",
      "Complete electrical noise isolation between logic circuits and motor inductive loads",
      "PWM speed modulation for smooth cornering and traction control"
    ],
    github: "https://github.com/Astrino04"
  },
  drone: {
    title: "Gesture Controlled Drone",
    badge: "AEROSPACE & WIRELESS TELEMETRY",
    tagline: "Wearable sensor glove transmitting hand tilt angles to pilot a responsive quadcopter.",
    image: "assets/project-drone.svg",
    overview: "Developed a wireless gesture-based flight controller that replaces traditional dual-stick RC transmitters with natural hand motions. A glove equipped with an inertial measurement unit (IMU) reads wrist pitch, roll, and elevation, sending 2.4GHz RF packets to the drone's flight controller for proportional throttle and attitude response.",
    components: [
      "MPU6050 6-Axis Accelerometer & Gyroscope",
      "NRF24L01+ 2.4GHz High-Speed RF Transceiver",
      "Arduino Nano (Wearable Glove Logic Unit)",
      "Quadcopter Flight Controller with PID Auto-Leveling",
      "4x 8520 High-Speed Coreless Brushed Motors",
      "1S 3.7V 600mAh High-Discharge LiPo Battery",
      "Ergonomic Textile Flight Glove Mount"
    ],
    highlights: [
      "Ultra-low latency (<15ms) 2.4GHz RF packet streaming with auto-acknowledgment",
      "Complementary sensor fusion filter combining accelerometer and gyro vectors to eliminate motor vibration jitter",
      "Emergency failsafe: rapid fist-clench cuts throttle to prevent flyaways",
      "Smooth intuitive flight dynamics for beginners without complex stick maneuvers"
    ],
    github: "https://github.com/Astrino04"
  },
  tesla: {
    title: "Wireless Power Transfer via Tesla Coil",
    badge: "RESONANT ELECTROMAGNETICS & HIGH VOLTAGE",
    tagline: "Solid-state resonant wireless power transmission illuminating bulbs across open air.",
    image: "assets/project-tesla.svg",
    overview: "Constructed a solid-state Tesla coil (SSTC) operating at radio frequency resonance to demonstrate wireless energy transmission through electromagnetic near-field induction. The circuit creates intense high-frequency alternating electric fields, exciting gas molecules in wireless bulbs placed up to 35cm away without any physical wires.",
    components: [
      "Primary Tank Inductor (Heavy gauge copper coil)",
      "Secondary Resonator (800+ turns of 32 AWG enameled copper wire)",
      "Aluminum Toroid Top Terminal (Electrostatic capacitor)",
      "High-Power Switching MOSFET (IRFP260N / 2N3055)",
      "Ultra-Fast Free-Wheeling Feedback Diodes (UF4007)",
      "Heavy Aluminum Heatsink & Active Cooling Fan",
      "12V–24V DC Regulated Power Supply"
    ],
    highlights: [
      "Wireless excitation and illumination of neon and fluorescent tubes up to 35cm away",
      "Tuned LC primary and secondary resonant frequencies for maximum energy transfer",
      "Demonstrated practical near-field inductive coupling principles used in modern EV charging",
      "Visible electrostatic streamers emitting from toroid breakout point at resonant peak"
    ],
    github: "https://github.com/Astrino04"
  }
};

// Certificate Database
const certsData = {
  cancer: {
    title: "Certificate of Special Effort — Cancer Awareness Campaign",
    badge: "SOCIAL IMPACT & COMMUNITY LEADERSHIP",
    issuer: "Cancer Welfare Society (ISO 9001:2015 Certified NGO)",
    image: "assets/cert-cancer.jpg",
    details: "Awarded to Arpan (Student of Class IX-C, St. Xavier's Jr/Sr School) in recognition of special efforts and voluntary service during the Nationwide Cancer Control Programme (April 2024). Commended for spreading critical cancer prevention awareness, symptoms education, and voluntary fundraising amongst the community in accordance with NCCP Govt of India and World Health Organisation (WHO) standards.",
    skills: [
      "Nationwide Cancer Control Programme (NCCP)",
      "WHO Community Health Guidelines",
      "Cancer Prevention Education",
      "Public Health Advocacy",
      "Voluntary Fundraising & Outreach"
    ],
    link: "assets/cert-cancer.jpg"
  },
  english: {
    title: "Cambridge Speak English Program Completion",
    badge: "COMMUNICATION & LANGUAGE EXCELLENCE",
    issuer: "Uolo in association with Cambridge University Press & Assessment",
    image: "assets/cert-english.jpg",
    details: "Awarded to Arpan (Grade 9, St. Xavier's Jr/Sr School) for successfully completing the Speak program during Academic Year 2023-24. Built in content partnership with Cambridge University Press & Assessment, this certified curriculum develops international spoken English fluency, communicative competence, vocal projection, and structured presentation skills.",
    skills: [
      "Cambridge University Press Curriculum",
      "Spoken English Fluency & Diction",
      "Public Articulation & Delivery",
      "Conversational Confidence",
      "Verbal Reasoning"
    ],
    link: "assets/cert-english.jpg"
  },
  sports: {
    title: "Annual Sports Meet 2024 — 100M & 200M Sprint Podium",
    badge: "ATHLETIC PODIUM — BRONZE MEDALIST",
    issuer: "St. Xavier's Annual Sports Meet (14th March 2024)",
    image: "assets/cert-sports-100m.jpg",
    details: "Awarded to Arpan (Class 8/9, St. Xavier's) for securing the Third Position (Bronze Medal) in both the high-intensity 100 Meter Sprint and 200 Meter Dash at the Annual Sports Meet 2024. Demonstrates exceptional sprint acceleration, physical endurance, competitive discipline, and dedication alongside academic excellence.",
    skills: [
      "100 Meter Sprint (3rd Position)",
      "200 Meter Sprint (3rd Position)",
      "Sprint Acceleration & Pacing",
      "Athletic Stamina & Agility",
      "Competitive Sportsmanship"
    ],
    link: "assets/cert-sports-100m.jpg"
  }
};

// Modal DOM Elements
const projectModal = document.getElementById('project-modal');
const modalClose = document.getElementById('modal-close');
const modalDismiss = document.getElementById('modal-dismiss');
const modalBadge = document.getElementById('modal-badge');
const modalTitle = document.getElementById('modal-title');
const modalTagline = document.getElementById('modal-tagline');
const modalImage = document.getElementById('modal-image');
const modalOverview = document.getElementById('modal-overview');
const modalComponents = document.getElementById('modal-components');
const modalHighlights = document.getElementById('modal-highlights');
const modalGithub = document.getElementById('modal-github');

const certModal = document.getElementById('cert-modal');
const certModalClose = document.getElementById('cert-modal-close');
const certDismiss = document.getElementById('cert-dismiss');
const certBadge = document.getElementById('cert-badge');
const certTitle = document.getElementById('cert-title');
const certIssuer = document.getElementById('cert-issuer');
const certModalImg = document.getElementById('cert-modal-img');
const certDisplayDetails = document.getElementById('cert-display-details');
const certSkillsList = document.getElementById('cert-skills-list');
const certVerifyLink = document.getElementById('cert-verify-link');

// Open Project Modal
function openProjectModal(projectKey) {
  const data = projectsData[projectKey];
  if (!data) return;

  modalBadge.textContent = data.badge;
  modalTitle.textContent = data.title;
  modalTagline.textContent = data.tagline;
  modalImage.src = data.image;
  modalImage.alt = data.title;
  modalOverview.textContent = data.overview;

  // Populate components
  modalComponents.innerHTML = '';
  data.components.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    modalComponents.appendChild(li);
  });

  // Populate highlights
  modalHighlights.innerHTML = '';
  data.highlights.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    modalHighlights.appendChild(li);
  });

  modalGithub.href = data.github || 'https://github.com/Astrino04';

  projectModal.classList.add('active');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  projectModal.classList.remove('active');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Open Certificate Modal
function openCertModal(certKey) {
  const data = certsData[certKey];
  if (!data) return;

  certBadge.textContent = data.badge;
  certTitle.textContent = data.title;
  certIssuer.textContent = data.issuer;
  if (certModalImg) {
    certModalImg.src = data.image;
    certModalImg.alt = data.title;
  }
  if (certDisplayDetails) {
    certDisplayDetails.textContent = data.details;
  }
  if (certVerifyLink) {
    certVerifyLink.href = data.link;
  }

  // Populate skills list
  if (certSkillsList) {
    certSkillsList.innerHTML = '';
    (data.skills || []).forEach(skill => {
      const li = document.createElement('li');
      li.textContent = skill;
      certSkillsList.appendChild(li);
    });
  }

  certModal.classList.add('active');
  certModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCertModal() {
  certModal.classList.remove('active');
  certModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Event Listeners for Project Cards
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const projectKey = card.getAttribute('data-project');
    if (projectKey) {
      openProjectModal(projectKey);
    }
  });
});

// Event Listeners for Certificate Cards & Buttons
document.querySelectorAll('.cert-card').forEach(card => {
  card.addEventListener('click', (e) => {
    if (card.id === 'add-cert-trigger') {
      openCertModal('custom');
      return;
    }
    const certKey = card.getAttribute('data-cert');
    if (certKey) {
      openCertModal(certKey);
    }
  });
});

document.querySelectorAll('.view-cert-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const certKey = btn.getAttribute('data-cert');
    if (certKey) {
      openCertModal(certKey);
    }
  });
});

// Close buttons
if (modalClose) modalClose.addEventListener('click', closeProjectModal);
if (modalDismiss) modalDismiss.addEventListener('click', closeProjectModal);
if (certModalClose) certModalClose.addEventListener('click', closeCertModal);
if (certDismiss) certDismiss.addEventListener('click', closeCertModal);

// Close on backdrop click
[projectModal, certModal].forEach(modal => {
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProjectModal();
        closeCertModal();
      }
    });
  }
});

// Close on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProjectModal();
    closeCertModal();
    if (astrinoChatbox && astrinoChatbox.classList.contains('open')) {
      toggleAstrino(false);
    }
  }
});

/* ==========================================================================
   ASTRINO AI — Portfolio Intelligence Agent
   ========================================================================== */
const astrinoLauncher = document.getElementById('astrino-launcher');
const astrinoChatbox = document.getElementById('astrino-chatbox');
const astrinoClose = document.getElementById('astrino-close');
const astrinoMessages = document.getElementById('astrino-messages');
const astrinoForm = document.getElementById('astrino-form');
const astrinoInput = document.getElementById('astrino-input');
const astrinoChips = document.querySelectorAll('.ai-chip');

// Toggle Chatbox
function toggleAstrino(shouldOpen) {
  if (!astrinoChatbox) return;
  const isOpen = astrinoChatbox.classList.contains('open');
  const targetState = shouldOpen !== undefined ? shouldOpen : !isOpen;

  if (targetState) {
    astrinoChatbox.classList.add('open');
    astrinoChatbox.setAttribute('aria-hidden', 'false');
    if (astrinoInput) {
      setTimeout(() => astrinoInput.focus(), 300);
    }
  } else {
    astrinoChatbox.classList.remove('open');
    astrinoChatbox.setAttribute('aria-hidden', 'true');
  }
}

if (astrinoLauncher) {
  astrinoLauncher.addEventListener('click', () => toggleAstrino());
}
if (astrinoClose) {
  astrinoClose.addEventListener('click', () => toggleAstrino(false));
}

// Append Chat Message
function appendChatMessage(sender, htmlContent) {
  if (!astrinoMessages) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'ai-msg'}`;

  if (sender === 'ai') {
    msgDiv.innerHTML = `
      <div class="msg-avatar">⚡</div>
      <div class="msg-bubble">${htmlContent}</div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="msg-bubble">${htmlContent}</div>
    `;
  }

  astrinoMessages.appendChild(msgDiv);
  astrinoMessages.scrollTop = astrinoMessages.scrollHeight;
}

// Typing Indicator
let typingElem = null;

function showTypingIndicator() {
  if (!astrinoMessages || typingElem) return;

  typingElem = document.createElement('div');
  typingElem.className = 'chat-msg ai-msg typing-msg';
  typingElem.innerHTML = `
    <div class="msg-avatar">⚡</div>
    <div class="msg-bubble typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  astrinoMessages.appendChild(typingElem);
  astrinoMessages.scrollTop = astrinoMessages.scrollHeight;
}

function hideTypingIndicator() {
  if (typingElem && typingElem.parentNode) {
    typingElem.parentNode.removeChild(typingElem);
  }
  typingElem = null;
}

// Astrino Natural Language Processing Brain
function generateAstrinoResponse(rawQuery) {
  const q = rawQuery.toLowerCase().trim();

  // Greetings
  if (q.match(/\b(hi|hello|hey|hola|greetings|who are you|what is your name)\b/)) {
    return `
      <p>Hello! I am <strong>Astrino AI</strong>, Arpan's custom interactive copilot. ⚡</p>
      <p>I can tell you about Arpan's <strong>Robotics Projects</strong>, his <strong>Diploma in AI &amp; ML at LPU</strong>, technical skills (Python, Arduino), or how to contact him!</p>
    `;
  }

  // Who is Arpan / About
  if (q.includes('who is') || q.includes('about arpan') || q.includes('bio') || q.includes('introduce')) {
    return `
      <p><strong>Arpan</strong> is an AI &amp; Machine Learning diploma student at <strong>Lovely Professional University (LPU), Punjab</strong>.</p>
      <p>He is passionate about autonomous robotics, smart gesture-controlled drones, high-voltage physics (Tesla Coils), and has <strong>3 years of hands-on experience</strong> with <strong>5 completed engineering projects</strong>.</p>
    `;
  }

  // All Projects
  if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('what has he built')) {
    return `
      <p>Arpan has built <strong>3 major hardware &amp; embedded systems projects</strong>:</p>
      <ol style="margin: 8px 0 8px 16px; padding: 0;">
        <li>🤖 <strong>Arduino Obstacle Avoiding Robot</strong>: Autonomous 2WD vehicle with ultrasonic radar sweeps.</li>
        <li>🛸 <strong>Gesture Controlled Drone</strong>: Wearable MPU6050 glove piloting a quadcopter via 2.4GHz RF.</li>
        <li>⚡ <strong>Wireless Power Transfer</strong>: Solid State Tesla Coil illuminating bulbs across open air.</li>
      </ol>
      <p>Click any project card on the page to view full component schematics!</p>
    `;
  }

  // Robot Specific
  if (q.includes('robot') || q.includes('obstacle') || q.includes('arduino')) {
    return `
      <p>🤖 <strong>Arduino Obstacle Avoiding Robot</strong>:</p>
      <p>Built with an <strong>Arduino Uno (ATmega328P)</strong>, <strong>HC-SR04 ultrasonic sensor</strong> mounted on a 180° servo, and <strong>L298N dual H-bridge motor driver</strong>.</p>
      <p>When an obstacle is detected within 25cm, it sweeps left and right, calculates distances, and autonomously steers into the clearest route with sub-40ms reaction time!</p>
    `;
  }

  // Drone Specific
  if (q.includes('drone') || q.includes('gesture') || q.includes('quadcopter') || q.includes('mpu6050')) {
    return `
      <p>🛸 <strong>Gesture Controlled Drone</strong>:</p>
      <p>Features an <strong>Arduino Nano</strong> and <strong>MPU6050 6-DOF IMU</strong> mounted on a flight glove. Hand tilt angles translate directly into pitch, roll, and elevation commands sent over a low-latency (<15ms) <strong>2.4GHz NRF24L01 RF link</strong>.</p>
      <p>Includes an emergency palm-clench failsafe that cuts rotor throttle instantly!</p>
    `;
  }

  // Tesla Coil Specific
  if (q.includes('tesla') || q.includes('wireless power') || q.includes('coil') || q.includes('resonance')) {
    return `
      <p>⚡ <strong>Wireless Power Transfer via Tesla Coil</strong>:</p>
      <p>A Solid State Tesla Coil (SSTC) utilizing an <strong>IRFP260N power MOSFET</strong> and an 800-turn secondary resonant coil. Operating at radio frequency LC resonance, it transfers energy wirelessly to illuminate fluorescent and neon bulbs placed up to <strong>35cm away</strong> without wires!</p>
    `;
  }

  // Skills
  if (q.includes('skill') || q.includes('python') || q.includes('code') || q.includes('language') || q.includes('tech stack')) {
    return `
      <p>Arpan's core competencies include:</p>
      <ul style="margin: 8px 0 8px 16px; padding: 0;">
        <li>🐍 <strong>Python (Basic)</strong>: Scripting, algorithms, serial comms</li>
        <li>🤖 <strong>Robotics &amp; Embedded</strong>: Arduino C++, PWM drivers, circuit design</li>
        <li>📡 <strong>Sensors &amp; RF</strong>: HC-SR04 ultrasonic, MPU6050 gyro, NRF24L01</li>
        <li>🧠 <strong>AI &amp; Machine Learning</strong>: Foundational ML algorithms, model concepts</li>
        <li>⚡ <strong>Physics &amp; Hardware</strong>: Tesla coil resonance, wireless energy harvesting</li>
      </ul>
    `;
  }

  // Education / College / LPU
  if (q.includes('education') || q.includes('college') || q.includes('lpu') || q.includes('degree') || q.includes('diploma') || q.includes('university')) {
    return `
      <p>🎓 <strong>Education</strong>:</p>
      <p>Arpan is currently pursuing his <strong>Diploma in Artificial Intelligence &amp; Machine Learning</strong> at <strong>Lovely Professional University (LPU), Punjab</strong>.</p>
      <p>His academic coursework focuses on machine learning, Python programming, intelligent automation, and applied microcontrollers.</p>
    `;
  }

  // Certificates
  if (q.includes('cert') || q.includes('award') || q.includes('cancer') || q.includes('english') || q.includes('sport')) {
    return `
      <p>📜 <strong>Arpan's Verified Certificates</strong>:</p>
      <ol style="margin: 8px 0 8px 16px; padding: 0;">
        <li>🎗️ <strong>Cancer Welfare Society</strong>: Certificate of Special Effort for the Nationwide Cancer Control Programme (April 2024, Class IX).</li>
        <li>🗣️ <strong>Cambridge Speak English Program (Uolo)</strong>: Certified in international spoken English fluency &amp; presentation (2023–24).</li>
        <li>🏃 <strong>Sports Meet 2024 (St. Xavier's)</strong>: Double Podium Bronze Medalist in both 100m Sprint &amp; 200m Race.</li>
      </ol>
      <p>Click on any certificate card on the website to view the high-resolution scanned document!</p>
    `;
  }

  // Contact / Phone / Email / Hire
  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('hire') || q.includes('number') || q.includes('reach') || q.includes('gmail')) {
    return `
      <p>📞 You can contact Arpan directly:</p>
      <ul style="margin: 8px 0 8px 16px; padding: 0;">
        <li>📧 <strong>Email</strong>: <a href="mailto:vikasakshat1977@gmail.com" style="color: #e50914; text-decoration: underline;">vikasakshat1977@gmail.com</a></li>
        <li>📱 <strong>Phone</strong>: <a href="tel:9973056660" style="color: #e50914; text-decoration: underline;">+91 9973056660</a></li>
        <li>💼 <strong>LinkedIn</strong>: <a href="https://www.linkedin.com/in/arpan-roy-441504417/" target="_blank" style="color: #e50914; text-decoration: underline;">Arpan's LinkedIn Profile</a></li>
        <li>🐙 <strong>GitHub</strong>: <a href="https://github.com/Astrino04" target="_blank" style="color: #e50914; text-decoration: underline;">github.com/Astrino04</a></li>
      </ul>
    `;
  }

  // GitHub
  if (q.includes('github') || q.includes('repo') || q.includes('astrino04')) {
    return `
      <p>🐙 Arpan's official GitHub handle is <strong><a href="https://github.com/Astrino04" target="_blank" style="color: #e50914; text-decoration: underline;">github.com/Astrino04</a></strong>.</p>
      <p>All project source code and hardware documentation are hosted there!</p>
    `;
  }

  // Experience
  if (q.includes('experience') || q.includes('year') || q.includes('how long')) {
    return `
      <p>Arpan has <strong>3 years of hands-on engineering experience</strong> exploring robotics, autonomous systems, and embedded prototyping, with <strong>5 completed hardware &amp; software projects</strong>!</p>
    `;
  }

  // Default response
  return `
    <p>That's an interesting question! As <strong>Astrino AI</strong>, I specialize in Arpan's technical portfolio.</p>
    <p>Feel free to ask me:</p>
    <ul style="margin: 8px 0 8px 16px; padding: 0;">
      <li>"Tell me about his 3 projects"</li>
      <li>"What are Arpan's technical skills?"</li>
      <li>"Show me his certificates"</li>
      <li>"How can I contact Arpan?"</li>
    </ul>
  `;
}

// Handle Form Submit
if (astrinoForm && astrinoInput) {
  astrinoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = astrinoInput.value.trim();
    if (!query) return;

    // Append user query
    appendChatMessage('user', query);
    astrinoInput.value = '';

    // Show AI typing and reply after slight delay for realism
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      const response = generateAstrinoResponse(query);
      appendChatMessage('ai', response);
    }, 450);
  });
}

// Handle Quick Action Prompt Chips
astrinoChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const query = chip.getAttribute('data-query');
    if (!query) return;

    appendChatMessage('user', query);
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      const response = generateAstrinoResponse(query);
      appendChatMessage('ai', response);
    }, 400);
  });
});


