const { useState, useEffect } = React;
const { createClient } = supabase;

const SUPABASE_URL = 'https://meoxudpjfgqkojqwaeii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb3h1ZHBqZmdxa29qcXdhZWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODY0MDksImV4cCI6MjA2OTQ2MjQwOX0.EpxHDQNDpxHz2g_dKDDR05-JRdgKo26xyJRcL7QXIGw';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const questions = [
    { id: 'name', label: 'What is your full name?', type: 'text', placeholder: 'e.g., Jane Doe' },
    { id: 'email', label: 'What is your best email address?', type: 'email', placeholder: 'e.g., jane.doe@gmail.com' },
    { id: 'phone', label: 'And your phone number?', type: 'tel', placeholder: 'e.g., 1234567890' },
    { id: 'instagram_url', label: 'What is your Instagram Profile URL?', type: 'url', placeholder: 'https://instagram.com/yourprofile' },
    {
        id: 'investment',
        label: 'How much are you able to invest monthly?',
        type: 'radio',
        options: ['< $500', '$500 - $1000', '$1000 - $5000', '> $5000'],
    },
];

const MultiStepForm = ({ onFormSubmit, initialData = {}, initialStep = 0 }) => {
    const [step, setStep] = useState(initialStep);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', 
        instagram_url: '', 
        investment: '',
        ...initialData
    });
    const [error, setError] = useState('');
    const [isFading, setIsFading] = useState(false);

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'phone') {
            value = value.replace(/\D/g, '');
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    const validateInstaUrl = (url) => /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9(\.\?)?]{1,30}\/?$/.test(String(url).toLowerCase());

    const handleNext = () => {
        const currentQuestion = questions[step];
        const value = formData[currentQuestion.id];

        if (!value) {
            setError('This field is required.');
            return;
        }
        if (currentQuestion.id === 'email' && !validateEmail(value)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (currentQuestion.id === 'instagram_url' && !validateInstaUrl(value)) {
            setError('Please enter a valid Instagram profile URL.');
            return;
        }

        setError('');
        setIsFading(true);

        setTimeout(() => {
            if (step < questions.length - 1) {
                setStep(step + 1);
            } else {
                onFormSubmit(formData);
            }
            setIsFading(false);
        }, 300);
    };

    const currentQuestion = questions[step];
    return (
        <div className="card">
            <div className="form-question" style={{ opacity: isFading ? 0 : 1, transition: 'opacity 0.3s' }}>
                <label htmlFor={currentQuestion.id}>{currentQuestion.label}</label>
                {currentQuestion.type === 'radio' ? (
                    <div className="radio-options">
                        {currentQuestion.options.map((option) => (
                            <label key={option} className="radio-option">
                                <input
                                    type="radio" name={currentQuestion.id} value={option}
                                    checked={formData[currentQuestion.id] === option}
                                    onChange={handleInputChange}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                ) : (
                    <input
                        type={currentQuestion.type} name={currentQuestion.id}
                        placeholder={currentQuestion.placeholder}
                        className="form-input"
                        value={formData[currentQuestion.id]}
                        onChange={handleInputChange}
                        onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                        autoFocus={step > 0}
                    />
                )}
                {error && <p className="error-message">{error}</p>}
                <button onClick={handleNext} className="cta-button next-button">
                    {step === questions.length - 1 ? 'Submit' : 'Next'}
                </button>
            </div>
        </div>
    );
};

const ResultScreen = ({ result, onEditLastAnswer }) => {
    const getResultContent = () => {
        switch (result.type) {
            case 'not_qualified':
                return {
                    title: "We Appreciate Your Interest",
                    message: "Based on your current investment level, you have not qualified for the current program we are running. Thank you for considering us.",
                    showEditButton: true,
                };
            case 'qualified_basic':
                return {
                    title: "🎉 You've Been Pre-Qualified!",
                    message: "You are a great candidate for our '0-to-1 Visibility' package. We are looking forward to getting on a call with you!",
                    showCalendly: true,
                };
            case 'qualified_full':
                return {
                    title: "🚀 Congratulations!",
                    message: "Your profile aligns perfectly with our core Social SEO services. The next step is to book a discovery call to discuss your goals in detail. We are looking forward to getting on a call with you!",
                    showCalendly: true,
                };
            default:
                return { title: "Thank You!", message: "We've received your submission." };
        }
    };

    const { title, message, showCalendly, showEditButton } = getResultContent();

    return (
        <div className="card result-container">
            <h2>{title}</h2>
            <p>{message}</p>
            {showCalendly && (
                <div>
                    <p>Please schedule a meeting with us via the link below:</p>
                    <a href="https://calendly.com/personalbrand-wasnot/15-minutes-discovery-call" target="_blank" rel="noopener noreferrer" className="calendly-link">
                        Book a Call on Calendly
                    </a>
                </div>
            )}
            {showEditButton && (
                <button onClick={onEditLastAnswer} className="cta-button next-button">
                    Change Investment Amount
                </button>
            )}
        </div>
    );
};

const App = () => {
    const [appState, setAppState] = useState('landing');
    const [formData, setFormData] = useState(null);
    const [formConfig, setFormConfig] = useState({});

    const handleApplyNow = () => {
        setFormConfig({});
        setAppState('form');
    };
    
    const handleEditLastAnswer = () => {
        setFormConfig({
            initialData: formData.data,
            initialStep: questions.length - 1
        });
        setAppState('form');
    }

    const handleFormSubmit = async (submittedData) => {
        try {
            const { data, error } = await supabaseClient
                .from('submissions')
                .insert([ submittedData ]);
            if (error) throw error;
            console.log('Data sent to Supabase:', data);
        } catch (error) {
            console.error('Error sending to Supabase:', error.message);
        }
        
        const { investment } = submittedData;
        let resultType = 'qualified_full';
        if (investment === '< $500') resultType = 'not_qualified';
        else if (investment === '$500 - $1000') resultType = 'qualified_basic';
        setFormData({ type: resultType, data: submittedData });
        setAppState('result');
    };

    const renderContent = () => {
        switch (appState) {
            case 'form':
                return <MultiStepForm onFormSubmit={handleFormSubmit} {...formConfig} />;
            case 'result':
                return <ResultScreen result={formData} onEditLastAnswer={handleEditLastAnswer} />;
            case 'landing':
            default:
                return (
                    <div className="landing-container">
                        <div className="top-heading-group">
                            <h1 className="main-heading gradient-text">Social SEO</h1>
                            <p className="sub-heading">A mathematically proven way to get consistent virality.</p>
                        </div>
                        <div className="card">
                            <div className="video-container">
                                <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/t2_AJ0WZpu0?si=3XV0M2lhl-j2zXs2&rel=0&showinfo=0&modestbranding=1&loop=1&playlist=t2_AJ0WZpu0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                            </div>
                            <button onClick={handleApplyNow} className="cta-button main-apply-button" style={{marginTop: '2.5rem'}}>
                                Apply Now
                            </button>
                        </div>
                        <div className="social-links-bottom">
                            <a href="https://www.instagram.com/wasnotedits/profilecard/?igsh=MXQ3aXhtdmxremdibQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.2,5.2 0 0,1 16.2,21.4H7.8C4.6,21.4 2,18.8 2,15.6V7.8A5.2,5.2 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>
                            </a>
                            <a href="https://www.linkedin.com/in/suresh-malani-a89b73262?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69.75 1.68 1.68 0 0 0 0 1.88 1.68 1.68 0 0 0 1.69.75M8.27 18.5H5.5V10.13h2.77v8.37Z" /></svg>
                            </a>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <div className="background-container">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
                <div className="shape shape3"></div>
            </div>
            
            <header className="app-header">
                <div className="logo">
                    <img src="Logo.png" alt="Social SEO Logo" />
                </div>
                <button onClick={handleApplyNow} className="cta-button header-apply-button">Apply Now</button>
            </header>
            
            {renderContent()}

        </>
    );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
