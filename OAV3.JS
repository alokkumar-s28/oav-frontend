/**
 * OAV Mantra Classes - Main Client-Side Application
 * Supports dynamic session tracking, toast notifications, enrollment & UPI payments,
 * district/school selector, and FAQ accordions.
 */

// School database for all 30 districts in Odisha
const schoolData = {
    'Angul': [
        'OAV BANMALIPUR ATHMALLIK',
        'OAV GOPINATHPUR CHENDIPADA',
        'OAV JHARABERENI KANIHA',
        'OAV KHANDAHARA ANGUL',
        'OAV RANIAKATA KISHORENAGAR',
        'OAV SHANTRI BANARPAL',
        'OAV SUBARNAPALI PALLAHARA',
        'OAV MAHULAPAL TALCHER'
    ],
    'Balangir': [
        'OAV BHAINSA PATNAGARH',
        'OAV BHALUMUNDA BANGOMUNDA',
        'OAV BHARUAMUNDA BELPARA',
        'OAV BIBINA SAINTALA',
        'OAV CHANDRAPUR DEOGAON',
        'OAV DUDUKA AGALPUR',
        'OAV JHARMUNDA LOISINGHA',
        'OAV JHARNI TUREKELA',
        'OAV KHAPRAKHOL KHAPARAKHOL',
        'OAV KURSUD TITILAGARH',
        'OAV MAHIMUNDA PUINTALA',
        'OAV MURIBAHAL MURIBAHAL',
        'OAV PATHACHEPA BOLANGIR',
        'OAV TENTULIKHUNTI GUDVELLA'
    ],
    'Balasore': [
        'OAV JAGESWARPADA BAHANAGA',
        'OAV BALARAMPUR BALIAPAL',
        'OAV PATHARAJHADA BASTA',
        'OAV KANTHIBHURI BHOGRAI',
        'OAV KALIKA JALESWAR',
        'OAV ARJUNPUR KHAIRA',
        'OAV JAMUDIHA NILAGIRI',
        'OAV DHIMPURA OUPADA',
        'OAV SUTEI REMUNA',
        'OAV DAKHINAODA SIMULIA',
        'OAV NADIGAON SORO',
        'OAV HINJALA BALASORE SADAR'
    ],
    'Bargarh': [
        'OAV AMBABHONA AMBABHONA',
        'OAV BALIDHIPA JHARBANDH',
        'OAV BANDHUPALI RAJBORASAMBAR',
        'OAV BARPADAR BHEDEN',
        'OAV BARPALI BARPALI',
        'OAV BHOIPURA ATTABIRA',
        'OAV FREZORPUR PAIKMAL',
        'OAV GAISILET GAISILET',
        'OAV GIVINDAPUR BARGARH',
        'OAV KANGAON SOHELLA',
        'OAV KESHAIPALI BHATLI',
        'OAV M-GANDAPALI BIJEPUR'
    ],
    'Bhadrak': [
        'OAV ERAM BASUDEVPUR',
        'OAV OLANGA BHADRAK',
        'OAV UTTARABADA BHANDARIPOKHARI',
        'OAV PALLASGADIA BONTH',
        'OAV MAJHIGAON CHANDABALI',
        'OAV SHYAMPUR DHAMNAGAR',
        'OAV SANTHAPURA TIHIDI'
    ],
    'Boudh': [
        'OAV TETELENGA BOUDH',
        'OAV MANIPUR HARBHANGA',
        'OAV AINLACHUAN KANTAMAL'
    ],
    'Cuttack': [
        'OAV ACHALKOT TIGIRIA',
        'OAV CHITALPUR KANTAPARA',
        'OAV GOVINDPUR BANKI-D PADA',
        'OAV JOKIDOLA BANKI',
        'OAV KANDARKANA TANGI',
        'OAV KAUDUKOLA MAHANGA',
        'OAV KIRIKICHA BADAMBA',
        'OAV KULAGAINSALO NISCHINTAKOILI',
        'OAV KULAILO ATHAGARH',
        'OAV PAIKAPADAPATNA NARASINGHPUR',
        'OAV RAGHABAPUR SALIPUR',
        'OAV RAMDASPUR BARANGA',
        'OAV SRIRAM CUTTACKSADAR',
        'OAV TOLA GOPINATHPUR NIALI'
    ],
    'Deogarh': [
        'OAV BARKOTE BARKOTE',
        'OAV BUDHAPAL REAMAL',
        'OAV TILEIBENI TILEIBENI'
    ],
    'Dhenkanal': [
        'OAV ANKARANTIPUR ODAPADA',
        'OAV BARIHAPUR PARAJANG',
        'OAV BISWANATHPUR GONDIA',
        'OAV JANTARIBOL KAMAKHYANAGAR',
        'OAV KANDHARA KANKADAHAD',
        'OAV MAHISHPAT DHENKANAL SADAR',
        'OAV NIJIGARH HINDOL',
        'OAV PURUSOTTAMPUR BHUBAN'
    ],
    'Gajapati': [
        'OAV LINGIPUR GOSANI',
        'OAV GUMMA GUMMA',
        'OAV ALADA KASHINAGAR',
        'OAV GUNDIMA MOHANA',
        'OAV PARIMALA NUAGADA',
        'OAV CHELLIGIDA RAYAGADA'
    ],
    'Ganjam': [
        'OAV BADAPUR PATRAPUR',
        'OAV BAURIGANDAPALLI KHALLIKOTE',
        'OAV BHATAKUMARADA P PUR',
        'OAV BHUSUNDA SHERAGADA',
        'OAV CHAMAKHANDI CHHATARPUR',
        'OAV CHANAMERI SANAKHEMUNDI',
        'OAV GOLIA BUGUDA',
        'OAV HATIOTA POLOSARA',
        'OAV JAMAGARADA JAGANNATH PRASAD',
        'OAV JILLUNDIPALII BHANJANAGAR',
        'OAV KABISURYANAGAR',
        'OAV KARAPALLI RANGAILUNDA',
        'OAV KUSAGUMA DHARAKOTE',
        'OAV KUSUMI KUKUDAKHANDI',
        'OAV NIMINA ASKA',
        'OAV PITATALI CHIKTI',
        'OAV BELLAGUNTHA',
        'OAV RAJAPUR BEGUNIPADA',
        'OAV SASANAMBAGAN HINJILICUT',
        'OAV SATRUSOLA GANJAM',
        'OAV SIDHESWAR DIGAPAHANDI',
        'OAV SORADA SORADA'
    ],
    'Jagatsinghpur': [
        'OAV KORKARA RAGHUNATHPUR',
        'OAV MULISINGH TIRTOL',
        'OAV DUA BALIKUDA',
        'OAV SADHEISASAN BIRIDI',
        'OAV SIHA ERASAMA',
        'OAV SALIJANGA JAGATSINGPUR',
        'OAV AGAPAL KUJANG',
        'OAV DAUGAON NAUGAON'
    ],
    'Jajapur': [
        'OAV RASULPUR RASULPUR',
        'OAV DARPANI BADCHANA',
        'OAV UTTARKUL BINJHARPUR',
        'OAV GOHIRAPATTOLI DANAGADI',
        'OAV MALLIKAPUR DASARATHPUR',
        'OAV DEULIPAL DHARMASALA',
        'OAV JAMDHAR JAJPUR',
        'OAV BEGANA KOREI',
        'OAV MADHAPUR SUKINDA'
    ],
    'Jharsuguda': [
        'OAV KATAPALI JHARSUGUDA',
        'OAV KIMIRA KIRIMIRA',
        'OAV PATRAPALI KOLABIRA',
        'OAV MUDRAJORE LAIKERA',
        'OAV LAKHANPUR LAKHANPUR'
    ],
    'Kalahandi': [
        'OAV MUSIGUDA BHAWANIPATNA',
        'OAV PARLA DHARMAGARH',
        'OAV GOLAMUNDA GOLAMUNDA',
        'OAV CHANCHARAPADA JAIPATNA',
        'OAV JUNAGARH JUNAGARH',
        'OAV KALAMPUR KALAMPUR',
        'OAV REGADA KARLAMUNDA',
        'OAV MASANIMUNDA KESINGA',
        'OAV BONGOMUNDA KOKSARA',
        'OAV DHANURBHATA LANJIGARH',
        'OAV MADANPUR RAMPUR MADANPUR RAMPUR',
        'OAV CHAPATAKHANDA NARLA',
        'OAV TH. RAMPUR TH. RAMPUR'
    ],
    'Kandhamal': [
        'OAV CHAKAPAD CHAKAPAD',
        'OAV DANDAPADAR BALIGUDA',
        'OAV DARINGBADI DARINGBADI',
        'OAV DHOBATOTA PHULBANI',
        'OAV DINDIRAGAON PHIRINGIA',
        'OAV DUTIMENDI KHAJURIPADA',
        'OAV G.UDAYAGIRI G.UDAYGIRI',
        'OAV JALESPATTA TUMUDIBANDHA',
        'OAV KUDUTULI K.NUAGAM',
        'OAV NUAGAON KOTAGARH',
        'OAV RAIKIA RAIKIA',
        'OAV SALAPGAM TIKABALI'
    ],
    'Kendrapara': [
        'OAV BELESWARP AUL',
        'OAV MANGARRAJPUR DERABISH',
        'OAV JAMUNAPADA GARADAPUR',
        'OAV TARANDO KENDRAPARA',
        'OAV ADOI MAHAKALPARA',
        'OAV UTTARANGA MARSHAAGHAI',
        'OAV BANTO PATTAMUNDAI',
        'OAV ACHINTA RAJKANIKA',
        'OAV MANGARRAJPUR RAJNAGAR'
    ],
    'Kendujhar': [
        'OAV SALAPADA ANANDAPUR',
        'OAV TALACHAMPEI BANSPAL',
        'OAV CHAMPUA CHAMPUA',
        'OAV SUANPADA GHASIPURA',
        'OAV TIKIRA GHATAGAON',
        'OAV HARICHANDANPUR HARICHANDANPUR',
        'OAV SUNDARAPAL HATADIHI',
        'OAV LAHANDA JODA',
        'OAV KENDIPOSI PATNA',
        'OAV SAHARAPADA SAHARAPADA',
        'OAV ORIA TELKOI',
        'OAV BODAPALASA KENDUJHAR SADAR'
    ],
    'Khordha': [
        'OAV ANDHURUA BHUBANESWARA',
        'OAV BEGUNIA BEGUNIA',
        'OAV ADIPADA TANGI',
        'OAV BENTAPUR BALIANTA',
        'OAV BHAKRASAHI BALIPATNA',
        'OAV BHATAPADA BANAPUR',
        'OAV GAINADA CHILIKA',
        'OAV PICHUKULI BOLAGARH',
        'OAV SANDHAPUR JATANI',
        'OAV SIALIA KHORDHA'
    ],
    'Koraput': [
        'OAV CHANDRAPADA BOIPARIGUDA',
        'OAV GANINAYAKPUT NANDAPUR',
        'OAV GOUDAGUDA LAXMIPUR',
        'OAV GUNDAL KUNDURA',
        'OAV JAYANTIGIRI JEYPORE',
        'OAV KOTIA POTANGI',
        'OAV KOTPAD KOTPAD',
        'OAV MACHHARA KORAPUT',
        'OAV MESSINGPUT LAMTAPUT',
        'OAV NILABADI BANDHUGAON',
        'OAV PACHINGI NARYANPATNA',
        'OAV PARAJAPUKI DASMANTPUR',
        'OAV POTTANGI POTTANGI',
        'OAV PUNGAR SEMILIGUDA',
        'OAV TARABHATTA BORIGUMA'
    ],
    'Malkangiri': [
        'OAV KANGARUKONDA KALIMELA',
        'OAV PODAGHAT KHAIRPUT',
        'OAV CHITRAKONDA KORUKUNDA',
        'OAV GUNDURIGUDA KUDUMULUGUMA',
        'OAV GONDHIPALLY MALKANGIRI',
        'OAV JULUNIBAHAL MATHILI',
        'OAV BAPANPALLI PODIA'
    ],
    'Mayurbhanj': [
        'OAV BADADALIMA TIRING',
        'OAV BADADEULI KARANJIA',
        'OAV BADASAHI BARSAHI',
        'OAV BHALIASOLE SULIAPADA',
        'OAV BHALUBASA KAPTIPADA',
        'OAV CHANDUA KULIANA',
        'OAV DIGDHAR THAKURMUNDA',
        'OAV GARUDABASA BETNOTI',
        'OAV JAMDAPAL BANGIRIPOSHI',
        'OAV JAMIRDIHA BISOI',
        'OAV JHARGAN BAHALDA',
        'OAV JUALIA UDALA',
        'OAV KHICHING SUKRULI',
        'OAV LAKHMANSAHI KHUNTA',
        'OAV LUHASILA BIJATALA',
        'OAV MAHULIA RASOGOVINDPUR',
        'OAV MATIAGARH JASHIPUR',
        'OAV MORADA MORADA',
        'OAV PASNA JAMADA',
        'OAV RANIBHOL BARIPADA',
        'OAV SANJAYDHANPOSI KUSUMI',
        'OAV SANMOUDA RAIRANGPUR',
        'OAV SANSOLE SAMAKHUNTA',
        'OAV SHIRSA SARASKANA',
        'OAV TINGIRIA RARUAN',
        'OAV TITIA GOPABANDHUNAGAR'
    ],
    'Nabarangpur': [
        'OAV FATKI CHANDAHANDI',
        'OAV DONGRIGUDA DABUGAON',
        'OAV JHARIGAON JHARIGAON',
        'OAV MAJHIGUDA KOSAGUMUDA',
        'OAV NANDAHANDI NANDAHANDI',
        'OAV AGNIPUR (HIRLI) NABARANGPUR',
        'OAV PAPADAHANDI PAPADAHANDI',
        'OAV DUMARDIHI RAIGHAR',
        'OAV LAKDIPAL TENTULIKHUNTI',
        'OAV BANGARIPADA UMARKOTE'
    ],
    'Nayagarh': [
        'OAV PANDARSINGAR GANIA',
        'OAV TARANDO KHANDAPADA',
        'OAV NOTAR NAYAGARH',
        'OAV NUAGAON NUAGAON',
        'OAV AKHUPADAR ODAGAON',
        'OAV FATEGARH BHAPUR',
        'OAV DWARAGAON DASAPALLA',
        'OAV BALARAMPUR RANAPUR'
    ],
    'Nuapada': [
        'OAV KESHRAJPUR BODEN',
        'OAV BADI KHARIAR',
        'OAV JHAGRAHI KOMNA',
        'OAV NEGIPALLI NUAPADA',
        'OAV TIMANPUR SINAPALI'
    ],
    'Puri': [
        'OAV BALUKHANDA PURI SADAR',
        'OAV BERBOI DELANG',
        'OAV GOVINDAPUR PIPLI',
        'OAV HANSAPADA NIMAPARA',
        'OAV JAMLAGADA KANASA',
        'OAV KUNJA KAKATPUR',
        'OAV MALUD KRUSHNAPRASAD',
        'OAV SARIFPUR ASTARANGA',
        'OAV SATYABADI',
        'OAV SIPASARUBALI BRAHMAGIRI',
        'OAV TARANGIRA GOP'
    ],
    'Rayagada': [
        'OAV BHALLERY BISAMAKATAK',
        'OAV CHANDRAPUR CHANDRAPUR',
        'OAV GUDARI GUDARI',
        'OAV GUNUPUR GUNUPUR',
        'OAV KALYANSINGHPUR KALYANSINGHPUR',
        'OAV KASHIPUR KASHIPUR',
        'OAV KOLNARA KOLNARA',
        'OAV JUMRUGUDA MUNIGUDA',
        'OAV BHALERI PADMAPUR',
        'OAV RAMANGUDA RAMANGUDA',
        'OAV TADAMABA RAYAGADA'
    ],
    'Sambalpur': [
        'OAV GOVINDPUR BAMARA',
        'OAV BADSINGHARI DHANKAUNDA',
        'OAV CHINIMAHUL JAMANKIRA',
        'OAV KUSUMI JUJUMURA',
        'OAV PARMANPUR KUCHINDA',
        'OAV PENTHABAHĀL NAKTIDEUL',
        'OAV RAMPUR REDHAKHOL',
        'OAV RENGALI RENGALI'
    ],
    'Subarnapur': [
        'OAV BINKA BINKA',
        'OAV RATHAPUR BIRMAHARAJPUR',
        'OAV FATAMUNDA DUNGURIPALI',
        'OAV PIPILIPALI SONEPUR',
        'OAV JAMKANI TARABHA',
        'OAV JHARBAHALI ULUNDA'
    ],
    'Sundargarh': [
        'OAV BABUNUAGAON BANAIGARH',
        'OAV BHOIPALI BARGAON',
        'OAV BUDAKATA KUTRA',
        'OAV GURUNDIA GURUNDIA',
        'OAV JAHARITOLI NUAGAON',
        'OAV KAMALAGA HEMGIRI',
        'OAV KUSUMDIHI KOIRA',
        'OAV LATYHIKATA LATHIKATA',
        'OAV LEPHRIPADA LEPHRIPADA',
        'OAV PARAGAPOSH LAHUNIPARA',
        'OAV RAJGANGPUR RAJGANGPUR',
        'OAV SIMDEGA SUBDEGA',
        'OAV TALASARA BALISANKARA',
        'OAV TALSANKARA SUNDARGARH',
        'OAV TELIPOSH KUARMUNDA',
        'OAV UJALPUR TANGARPALLI',
        'OAV MAHIPANI BISRA',
        'OMAV ROURKELA ROURKELA'
    ]
};

// Global State
const UPI_ID = 'kumaralok952p@okicici';
const MERCHANT_NAME = 'OAV Mantra Classes';
const REGISTRATION_FEE = 500;
let currentEnrollmentId = '';
let currentStudentName = '';
let currentStudentMobile = '';

// DOM References
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mainNav = document.getElementById('mainNav');
const getStartedBtn = document.getElementById('getStartedBtn');
const ctaBtn = document.getElementById('ctaBtn');
const aboutEnrollBtn = document.getElementById('aboutEnrollBtn');
const enrollmentModal = document.getElementById('enrollmentModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const enrollmentForm = document.getElementById('enrollmentForm');
const successMessage = document.getElementById('successMessage');
const successMessageText = document.getElementById('successMessageText');
const proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');

const paymentModal = document.getElementById('paymentModal');
const closePaymentBtn = document.getElementById('closePaymentBtn');
const paymentForm = document.getElementById('paymentForm');
const submitPaymentBtn = document.getElementById('submitPaymentBtn');
const quickUpiPaymentBtn = document.getElementById('quickUpiPaymentBtn');
const paymentQrCode = document.getElementById('paymentQrCode');
const paymentSuccessMessage = document.getElementById('paymentSuccessMessage');
const confirmationDetails = document.getElementById('confirmationDetails');

const citySelect = document.getElementById('city');
const schoolTypeSelect = document.getElementById('schoolType');
const schoolGroup = document.getElementById('schoolGroup');
const schoolSelect = document.getElementById('school');
const enrollmentIdField = document.getElementById('enrollmentId');
const studentNamePaymentField = document.getElementById('studentNamePayment');
const toastContainer = document.getElementById('toastContainer');

// --- Toast Notification System ---
function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `<i class="fas ${iconMap[type] || 'fa-info-circle'}"></i> <span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Page Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    // Set default payment date to today
    const pDateField = document.getElementById('paymentDate');
    if (pDateField) pDateField.valueAsDate = new Date();

    // Check active session
    await checkActiveSession();

    // Load Announcements
    await loadAnnouncements();

    // Setup FAQ Accordion
    setupFaqAccordion();

    // Setup Class & Subject Quick-Enrollment Triggers
    setupEnrollmentTriggers();
});

const API_BASE = (function () {
    if (window.location.protocol === 'file:') return 'http://localhost:3000';
    if (window.location.hostname === 'localhost' && window.location.port && window.location.port !== '3000') return 'http://localhost:3000';
    if (window.location.hostname === '127.0.0.1' && window.location.port && window.location.port !== '3000') return 'http://127.0.0.1:3000';
    return '';
})();

// --- Dynamic Session Check ---
async function checkActiveSession() {
    try {
        const res = await fetch(`${API_BASE}/api/student/me`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            if (data.authenticated && data.student) {
                const authSlot = document.getElementById('authNavSlot');
                if (authSlot) {
                    authSlot.innerHTML = `
                        <a href="dashboard.html" class="nav-cta" style="background:#10b981 !important; color:#ffffff !important; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 14px rgba(16,185,129,0.4);">
                            <i class="fas fa-user-graduate"></i> My Dashboard (${escapeHtml(data.student.full_name.split(' ')[0])})
                        </a>
                    `;
                }
            }
        }
    } catch (e) {
        // Continue silently
    }
}

// --- Load Announcements ---
async function loadAnnouncements() {
    const textEl = document.getElementById('announcementText');
    if (!textEl) return;
    try {
        const res = await fetch(`${API_BASE}/api/announcements`);
        if (res.ok) {
            const data = await res.json();
            if (data.announcements && data.announcements.length > 0) {
                const latest = data.announcements[0];
                textEl.innerHTML = `<i class="fas fa-bullhorn"></i> <strong>${escapeHtml(latest.title)}:</strong> ${escapeHtml(latest.message)}`;
            }
        }
    } catch (e) {
        textEl.innerHTML = `<i class="fas fa-bell"></i> Live interactive classes for Classes VI - X are active. Enroll to join!`;
    }
}


// --- Mobile Menu Toggle ---
if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mainNav.classList.toggle('active');
        mobileMenuBtn.innerHTML = mainNav.classList.contains('active')
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    // Close menu when clicking nav links
    document.querySelectorAll('#mainNav a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mainNav.classList.contains('active') && !mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mainNav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

// --- FAQ Accordion ---
function setupFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', function () {
            const item = this.parentElement;
            const wasActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!wasActive) item.classList.add('active');
        });
    });
}

// --- Enrollment Triggers for Classes & Subjects ---
function setupEnrollmentTriggers() {
    // Buttons to open modal
    [getStartedBtn, ctaBtn, aboutEnrollBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => openEnrollmentModal());
        }
    });

    // Class Explorer buttons
    document.querySelectorAll('.enroll-class-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const targetClass = this.getAttribute('data-class');
            openEnrollmentModal(targetClass);
        });
    });

    // Subject Enroll buttons
    document.querySelectorAll('.subject-enroll-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const subject = this.getAttribute('data-subject');
            openEnrollmentModal(null, subject);
        });
    });
}

function openEnrollmentModal(preselectClass = null, preselectSubject = null) {
    if (preselectClass) {
        const classSelect = document.getElementById('studentClass');
        if (classSelect) classSelect.value = preselectClass;
    }
    if (preselectSubject) {
        showToast(`Selected Subject: ${preselectSubject}. Please fill in student details below.`, 'info');
    }
    enrollmentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Modal Events
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeEnrollmentModal);
}
if (closePaymentBtn) {
    closePaymentBtn.addEventListener('click', () => {
        paymentModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

[enrollmentModal, paymentModal].forEach(modal => {
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
});

function closeEnrollmentModal() {
    enrollmentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetEnrollmentForm();
}

// --- School Type & District Dynamic Filtering ---
function updateSchoolOptions() {
    const selectedCity = citySelect.value;
    schoolSelect.innerHTML = '<option value="">Select School</option>';

    if (schoolTypeSelect.value === 'OAV' && selectedCity && schoolData[selectedCity]) {
        schoolGroup.style.display = 'block';
        schoolData[selectedCity].forEach(sch => {
            const opt = document.createElement('option');
            opt.value = sch;
            opt.textContent = sch;
            schoolSelect.appendChild(opt);
        });
        schoolSelect.required = true;
    } else {
        schoolGroup.style.display = 'none';
        schoolSelect.required = false;
    }
}

if (citySelect) citySelect.addEventListener('change', updateSchoolOptions);
if (schoolTypeSelect) schoolTypeSelect.addEventListener('change', updateSchoolOptions);

// --- Form Validation Functions ---
function validateName(name) {
    return name.trim().length >= 2 && /^[A-Za-z\s]+$/.test(name);
}
function validateMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
}
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(elementId, messageId, show = true) {
    const element = document.getElementById(elementId);
    const msg = document.getElementById(messageId);
    if (element) {
        if (show) element.classList.add('error');
        else element.classList.remove('error');
    }
    if (msg) {
        if (show) msg.classList.add('show');
        else msg.classList.remove('show');
    }
}

function generateEnrollmentId() {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `OAV-${timestamp}-${randomStr}`;
}

// --- Enrollment Form Submission ---
if (enrollmentForm) {
    enrollmentForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('studentName').value.trim();
        const mobile = document.getElementById('mobileNumber').value.trim();
        const email = document.getElementById('email').value.trim();
        const schoolType = schoolTypeSelect.value;
        const studentClass = document.getElementById('studentClass').value;
        const city = citySelect.value;
        const school = schoolSelect.value;

        // Reset errors
        showError('studentName', 'nameError', false);
        showError('mobileNumber', 'mobileError', false);
        showError('email', 'emailError', false);
        showError('schoolType', 'schoolTypeError', false);
        showError('studentClass', 'classError', false);
        showError('city', 'cityError', false);
        showError('school', 'schoolError', false);

        let isValid = true;
        if (!validateName(name)) { showError('studentName', 'nameError', true); isValid = false; }
        if (!validateMobile(mobile)) { showError('mobileNumber', 'mobileError', true); isValid = false; }
        if (!validateEmail(email)) { showError('email', 'emailError', true); isValid = false; }
        if (!schoolType) { showError('schoolType', 'schoolTypeError', true); isValid = false; }
        if (!studentClass) { showError('studentClass', 'classError', true); isValid = false; }
        if (!city) { showError('city', 'cityError', true); isValid = false; }
        if (schoolType === 'OAV' && !school) { showError('school', 'schoolError', true); isValid = false; }

        if (!isValid) {
            showToast('Please fix the errors in the form before submitting.', 'warning');
            return;
        }

        const submitBtn = this.querySelector('.submit-btn');
        const origText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        currentEnrollmentId = generateEnrollmentId();
        currentStudentName = name;
        currentStudentMobile = mobile;

        const payload = {
            enrollmentId: currentEnrollmentId,
            name,
            mobile,
            email,
            schoolType,
            class: studentClass,
            city,
            school: schoolType === 'OAV' ? school : 'State/Private School'
        };

        try {
            const res = await fetch(`${API_BASE}/api/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.enrollmentId) currentEnrollmentId = data.enrollmentId;
            } else {
                const data = await res.json().catch(() => ({}));
                console.warn('Backend enrollment note:', data.error);
            }
        } catch (netErr) {
            console.info('Backend unreachable, saving enrollment locally:', netErr.message);
        }

        // Save student locally as well for offline resilience
        try {
            const localStudents = JSON.parse(localStorage.getItem('oav_students') || '[]');
            localStudents.push({ ...payload, status: 'pending_payment', createdAt: new Date().toISOString() });
            localStorage.setItem('oav_students', JSON.stringify(localStudents));
            localStorage.setItem('oav_current_student', JSON.stringify({
                enrollment_id: currentEnrollmentId,
                full_name: name,
                mobile,
                email,
                student_class: studentClass,
                city,
                school: payload.school,
                status: 'pending_payment'
            }));
        } catch (e) {}

        // Success state
        enrollmentForm.style.display = 'none';
        successMessage.style.display = 'block';
        successMessageText.innerHTML = `
            <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0; text-align: left; font-size: 0.95rem; line-height: 1.8;">
                <strong>Enrollment ID:</strong> <span style="color: var(--secondary); font-family: monospace; font-size: 1.1rem; font-weight: 800;">${currentEnrollmentId}</span><br>
                <strong>Student:</strong> ${escapeHtml(name)}<br>
                <strong>Class:</strong> Class ${studentClass} (${city})<br>
                <strong>Registration Fee:</strong> <span style="color: var(--accent); font-weight: 800;">₹500</span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Your details are recorded. Click below to complete fee verification.</p>
        `;

        showToast('Enrollment details saved! Proceed to payment.', 'success');
        submitBtn.innerHTML = origText;
        submitBtn.disabled = false;
    });
}

// Proceed to payment from enrollment success
if (proceedToPaymentBtn) {
    proceedToPaymentBtn.addEventListener('click', () => {
        enrollmentModal.classList.remove('active');
        if (enrollmentIdField) enrollmentIdField.value = currentEnrollmentId;
        if (studentNamePaymentField) studentNamePaymentField.value = currentStudentName;

        renderPaymentQrCode();

        setTimeout(() => {
            paymentModal.classList.add('active');
        }, 200);
    });
}

// Payment method options toggle
document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', function () {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        const method = this.getAttribute('data-method');

        const quickDiv = document.getElementById('quickUpiDetails');
        const qrDiv = document.getElementById('qrDetails');
        if (method === 'quickupi') {
            if (quickDiv) quickDiv.style.display = 'block';
            if (qrDiv) qrDiv.style.display = 'none';
        } else {
            if (quickDiv) quickDiv.style.display = 'none';
            if (qrDiv) qrDiv.style.display = 'block';
        }
    });
});

// Render Dynamic Payment QR Code
function renderPaymentQrCode() {
    if (!paymentQrCode || typeof QRCode === 'undefined') return;
    paymentQrCode.replaceChildren();
    const note = `OAV Registration ${currentEnrollmentId}`;
    const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=500&tn=${encodeURIComponent(note)}&cu=INR`;
    new QRCode(paymentQrCode, {
        text: upiUrl,
        width: 170,
        height: 170,
        correctLevel: QRCode.CorrectLevel.M
    });
}

// Copy UPI ID button
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const text = this.getAttribute('data-text');
        navigator.clipboard.writeText(text).then(() => {
            showToast('UPI ID copied to clipboard!', 'success');
        });
    });
});

// Launch Quick UPI app button
if (quickUpiPaymentBtn) {
    quickUpiPaymentBtn.addEventListener('click', () => {
        const note = `Registration for ${currentStudentName} (${currentEnrollmentId})`;
        const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=500&tn=${encodeURIComponent(note)}&cu=INR`;
        window.location.href = upiUrl;
    });
}

// Payment Form Submit
if (paymentForm) {
    paymentForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const tx = document.getElementById('transactionId').value.trim();
        const pDate = document.getElementById('paymentDate').value;
        const selectedOpt = document.querySelector('.payment-option.selected');
        const method = selectedOpt ? selectedOpt.getAttribute('data-method') : 'quickupi';

        if (!tx || tx.length < 6) {
            showToast('Please enter a valid Transaction / UTR reference number (at least 6 characters).', 'warning');
            return;
        }

        const origText = submitPaymentBtn.innerHTML;
        submitPaymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        submitPaymentBtn.disabled = true;

        try {
            await fetch(`${API_BASE}/api/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollmentId: currentEnrollmentId,
                    transactionId: tx,
                    paymentDate: pDate,
                    paymentMethod: method
                })
            });
        } catch (netErr) {
            console.info('Backend unreachable, saving payment claim locally:', netErr.message);
        }

        // Save payment claim locally for offline verification
        try {
            const localPayments = JSON.parse(localStorage.getItem('oav_payments') || '[]');
            localPayments.push({
                enrollment_id: currentEnrollmentId,
                transaction_id: tx,
                amount: 500,
                payment_date: pDate,
                payment_method: method,
                status: 'pending_verification'
            });
            localStorage.setItem('oav_payments', JSON.stringify(localPayments));

            // Update current student status to payment_review (pending admin approval)
            const studentStr = localStorage.getItem('oav_current_student');
            if (studentStr) {
                const st = JSON.parse(studentStr);
                st.status = 'payment_review';
                localStorage.setItem('oav_current_student', JSON.stringify(st));
            }
        } catch (e) {}

        paymentForm.style.display = 'none';
        paymentSuccessMessage.style.display = 'block';
        confirmationDetails.innerHTML = `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin-bottom:16px; text-align:left; font-size:0.92rem; line-height:1.7;">
                <strong>Enrollment ID:</strong> <span style="color:#2563eb; font-family:monospace; font-weight:800; font-size:1.05rem;">${escapeHtml(currentEnrollmentId)}</span><br>
                <strong>Student Name:</strong> ${escapeHtml(currentStudentName)}<br>
                <strong>Amount:</strong> ₹500<br>
                <strong>Transaction ID:</strong> <code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700;">${escapeHtml(tx)}</code><br>
                <strong>Status:</strong> <span style="background:#fef3c7; color:#92400e; padding:3px 10px; border-radius:6px; font-weight:800;">⏳ Verification Under Review</span>
            </div>

            <div style="background:#eff6ff; border-left:4px solid #2563eb; border-radius:8px; padding:14px 16px; margin:16px 0; text-align:left; color:#1e40af; font-size:0.92rem; line-height:1.6;">
                <strong><i class="fas fa-clock"></i> What happens next?</strong><br>
                1. Our admin team will verify your ₹500 UPI payment.<br>
                2. After we approve your account in the admin panel, your study room access will be unlocked.<br>
                3. Please try logging in after some time (usually within 15–30 minutes) using your Enrollment ID and registered Mobile Number.
            </div>

            <div style="text-align:center; margin-top:20px;">
                <a href="login.html?enrollment=${encodeURIComponent(currentEnrollmentId)}&mobile=${encodeURIComponent(currentStudentMobile)}&status=review" class="btn" style="background:#2563eb; color:#ffffff; padding:12px 28px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">
                    <i class="fas fa-sign-in-alt"></i> Proceed to Student Login
                </a>
            </div>
        `;

        showToast('Payment submitted! Account will be active once approved by admin.', 'info');
        submitPaymentBtn.innerHTML = origText;
        submitPaymentBtn.disabled = false;
    });
}




function resetEnrollmentForm() {
    if (enrollmentForm) {
        enrollmentForm.reset();
        enrollmentForm.style.display = 'block';
    }
    if (successMessage) successMessage.style.display = 'none';
    if (schoolGroup) schoolGroup.style.display = 'none';
    if (schoolSelect) schoolSelect.innerHTML = '<option value="">Select School</option>';
}
