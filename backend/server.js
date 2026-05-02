const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory conversation store
const userSessions = {};

// Helper to detect Hinglish
function isHinglish(msg) {
    const hinglishWords = ['hai', 'kya', 'kaise', 'mera', 'mujhe', 'batao', 'kaun', 'vote', 'dena', 'chahiye', 'nahi', 'karo', 'karu', 'kaha', 'kab', 'kon'];
    const words = msg.split(/[^a-zA-Z]+/);
    for (let word of words) {
        if (hinglishWords.includes(word.toLowerCase())) return true;
    }
    return false;
}

// --- KNOWLEDGE BASE ---
const knowledgeBase = [
    {
        topic: "voting_eligibility",
        keywords: ["age", "eligible", "eligibility", "18", "citizenship", "first time", "can i vote"],
        responses: {
            en: [
                "You are eligible to vote if you are 18 or older and an Indian citizen.",
                "To cast your vote, you just need to be 18+ and hold Indian citizenship. Are you registered?",
                "Voting eligibility is quite simple: be at least 18 years of age and a citizen of India."
            ],
            hi: [
                "Simple hai, agar aap 18+ ho to vote kar sakte ho.",
                "Vote daalne ke liye aapki umar 18 saal ya usse zyada honi chahiye.",
                "Haan bilkul, 18 saal ke hone par aap vote dene ke haqdaar ban jaate hain."
            ]
        }
    },
    {
        topic: "voter_registration",
        keywords: ["register", "how to register", "apply", "form 6", "enroll"],
        responses: {
            en: [
                "You can easily register online by filling out Form 6 on the Voter Helpline App or NVSP portal.",
                "Registration is straightforward! Just submit Form 6 online via the Election Commission website.",
                "To get your name on the voter list, simply apply online using Form 6 with your basic documents."
            ],
            hi: [
                "Aap NVSP portal ya Voter Helpline App par Form 6 bharkar online register kar sakte hain.",
                "Registration bahut aasan hai. Bas online Form 6 bharein aur documents upload karein.",
                "Voter list mein naam judwane ke liye aapko Form 6 bharna hoga, jo online uplabdh hai."
            ]
        }
    },
    {
        topic: "voting_process",
        keywords: ["process", "steps to vote", "how to vote", "polling booth process", "evm"],
        responses: {
            en: [
                "At the booth: check your name, verify your ID, press the button on the EVM, and confirm on the VVPAT.",
                "Voting is quick! Show your Voter ID, get your finger inked, press the EVM button for your candidate, and you're done.",
                "First, officials check your ID. Then, you head to the EVM compartment and securely cast your vote."
            ],
            hi: [
                "Booth par apni ID dikhayein, EVM par button dabayein, aur VVPAT mein check karein. Bas ho gaya!",
                "Vote dalna aasan hai: ID verify karwayein, ungli par nishan lagwayein, aur EVM par apna vote darj karein.",
                "Sabse pehle officer aapki ID check karenge, fir aap EVM par apne pasand ke candidate ko vote de sakte hain."
            ]
        }
    },
    {
        topic: "voter_id",
        keywords: ["voter id", "epic", "id card", "get id", "download id"],
        responses: {
            en: [
                "Your Voter ID (EPIC) is your official proof. You can download a digital copy (e-EPIC) from the NVSP portal.",
                "Once registered, you receive an EPIC card. You can also keep a digital e-EPIC on your phone.",
                "The Electors Photo Identity Card (EPIC) is crucial. If lost, you can download the e-EPIC online."
            ],
            hi: [
                "Voter ID (EPIC) aapka official proof hai. Aap iska digital version (e-EPIC) NVSP portal se download kar sakte hain.",
                "Register hone ke baad aapko EPIC card milta hai. Aap ise apne phone mein e-EPIC ke roop mein bhi rakh sakte hain.",
                "Voter ID bahut zaroori hai. Aap online aasaani se e-EPIC download kar sakte hain."
            ]
        }
    },
    {
        topic: "polling_booth",
        keywords: ["polling booth", "where to vote", "location", "center", "find booth"],
        responses: {
            en: [
                "You can find your exact polling booth location using the Voter Helpline App or by checking the electoral roll online.",
                "Your polling station details are available online on the Election Commission portal or via SMS.",
                "To locate your booth, just search your name on the NVSP electoral roll search page."
            ],
            hi: [
                "Aap apna polling booth Voter Helpline App ya online voter list check karke dhund sakte hain.",
                "Aapki voting location ki jaankari Election Commission ke portal par aasaani se mil jayegi.",
                "Booth dhundne ke liye NVSP website par apna naam search karein, wahan puri detail mil jayegi."
            ]
        }
    },
    {
        topic: "candidate_info",
        keywords: ["candidate", "compare", "who to vote", "manifesto", "record"],
        responses: {
            en: [
                "Before voting, check candidates' educational backgrounds, criminal records, and assets via the KYC (Know Your Candidate) app.",
                "It's smart to compare candidates! You can view their official affidavits on the Election Commission website.",
                "Make an informed choice by reviewing the candidates' past records and manifestos before election day."
            ],
            hi: [
                "Vote dene se pehle KYC (Know Your Candidate) app par candidates ka background aur criminal record zaroor check karein.",
                "Candidates ko compare karna achi aadat hai! Unki details ECI ki website par dekhi ja sakti hai.",
                "Sahi faisla lene ke liye chunav se pehle candidates ke manifesto aur pichle records ko padhein."
            ]
        }
    },
    {
        topic: "fake_news",
        keywords: ["fake news", "whatsapp", "forwarded", "rumor", "true or false"],
        responses: {
            en: [
                "Always verify forwarded messages from official Election Commission sources to avoid falling for fake news.",
                "Fake news spreads fast during elections. If you see a viral WhatsApp forward, fact-check it on the ECI website.",
                "Be cautious of rumors! Trust only verified news outlets and official government announcements."
            ],
            hi: [
                "Fake news se bachein! WhatsApp par aayi kisi bhi forward message ko official website se verify zaroor karein.",
                "Chunav ke waqt afwahein tezi se phailti hain. Hamesha sahi aur verified khabar par hi bharosa karein.",
                "Galat jankari se bachne ke liye, kisi bhi viral message par bharosa karne se pehle fact-check karein."
            ]
        }
    }
];

// Helper to pick a random item from an array
function getRandomResponse(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Handle user query logic
function handleUserQuery(message, user) {
    const lowerMessage = message.toLowerCase();
    
    // Initialize user session if it doesn't exist
    if (!userSessions[user]) {
        userSessions[user] = {
            history: [],
            profile: {}
        };
    }

    const session = userSessions[user];
    session.history.push({ role: 'user', content: message });

    const isHinglishUser = isHinglish(lowerMessage) || lowerMessage.includes('hindi');
    let response = "";
    let matchedTopic = null;

    // 1. Detect Topic based on Knowledge Base keywords
    for (const kb of knowledgeBase) {
        for (const keyword of kb.keywords) {
            if (lowerMessage.includes(keyword)) {
                matchedTopic = kb;
                break;
            }
        }
        if (matchedTopic) break;
    }

    // 2. Generate Dynamic Response
    if (matchedTopic) {
        const langArray = isHinglishUser ? matchedTopic.responses.hi : matchedTopic.responses.en;
        response = getRandomResponse(langArray);
    } else {
        // 3. Smart Fallback Logic (Never say "I don't know")
        const fallbacks = {
            en: [
                "I might not have the exact detail on that, but here's a quick tip: you can always find verified election info on the official ECI website. What else can I help you with?",
                "That's an interesting question! While I don't have a direct answer right now, I'm fully equipped to guide you on voting eligibility, registration, or polling booths.",
                "I focus mostly on core voting procedures. If you need help with voter ID, finding your booth, or checking eligibility, just let me know!"
            ],
            hi: [
                "Mujhe iski poori jaankari nahi hai, par aap official ECI website par verified details dekh sakte hain. Kya main aapko voting process samjhaun?",
                "Badiya sawal hai! Halanki mere paas iska direct jawab nahi hai, par main voting registration aur polling booth ke baare mein poori madad kar sakta hoon.",
                "Main zyada tar voting rules aur voter ID ke baare mein jaanta hoon. Agar aapko apna booth dhundna hai ya register karna hai, toh batayein!"
            ]
        };
        const fallbackArray = isHinglishUser ? fallbacks.hi : fallbacks.en;
        response = getRandomResponse(fallbackArray);
    }

    // Dynamic suggestions based on context
    const allSuggestions = ["Check Eligibility", "How to vote", "Detect Fake News", "Find Polling Booth", "Voter ID Guide", "Compare Candidates"];
    // Shuffle and pick 3 random suggestions to keep it fresh
    const shuffled = allSuggestions.sort(() => 0.5 - Math.random());
    const suggestions = shuffled.slice(0, 3);

    session.history.push({ role: 'bot', content: response });
    return { response, suggestions };
}

app.post('/chat', (req, res) => {
    try {
        const { message, user = "default_user" } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const result = handleUserQuery(message, user);
        
        res.json({ response: result.response, suggestions: result.suggestions });
    } catch (error) {
        console.error("Error handling chat:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
