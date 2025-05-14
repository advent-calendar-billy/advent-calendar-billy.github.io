// Initialize data structure if not exists
function initializeData() {
    if (!localStorage.getItem('knowShareData')) {
        const initialData = {
            categories: [
                {
                    id: 1,
                    name: "Parenting Hacks",
                    description: "Expert advice on child development, discipline strategies, and family dynamics"
                },
                {
                    id: 2,
                    name: "Culinary Specialties",
                    description: "Learn cooking techniques, food presentation, and specialty cuisine preparation"
                },
                {
                    id: 3,
                    name: "DIY Home Solutions",
                    description: "Get guidance on home repairs, organization, and budget-friendly decorating"
                }
            ],
            experts: [
                // Parenting Experts
                {
                    id: 101,
                    name: "Sarah Johnson",
                    categoryId: 1,
                    bio: "Child psychologist with 15 years experience and mother of three",
                    points: 450,
                    callCount: 87,
                    avgRating: 4.8,
                    rank: 1
                },
                {
                    id: 102,
                    name: "Michael Chen",
                    categoryId: 1,
                    bio: "Early childhood educator specializing in positive discipline techniques",
                    points: 380,
                    callCount: 64,
                    avgRating: 4.7,
                    rank: 2
                },
                {
                    id: 103,
                    name: "Aisha Patel",
                    categoryId: 1,
                    bio: "Family counselor with expertise in blended families and co-parenting",
                    points: 320,
                    callCount: 59,
                    avgRating: 4.6,
                    rank: 3
                },
                
                // Culinary Experts
                {
                    id: 201,
                    name: "Carlos Rodriguez",
                    categoryId: 2,
                    bio: "Professional pastry chef with specialty in cake decoration",
                    points: 510,
                    callCount: 95,
                    avgRating: 4.9,
                    rank: 1
                },
                {
                    id: 202,
                    name: "Emma Wilson",
                    categoryId: 2,
                    bio: "Plant-based cuisine expert and culinary instructor",
                    points: 460,
                    callCount: 76,
                    avgRating: 4.8,
                    rank: 2
                },
                {
                    id: 203,
                    name: "Jamal Washington",
                    categoryId: 2,
                    bio: "Home cook specializing in budget-friendly meal planning",
                    points: 390,
                    callCount: 72,
                    avgRating: 4.7,
                    rank: 3
                },
                
                // DIY Experts
                {
                    id: 301,
                    name: "Maria Garcia",
                    categoryId: 3,
                    bio: "Interior designer with focus on small space solutions",
                    points: 480,
                    callCount: 84,
                    avgRating: 4.9,
                    rank: 1
                },
                {
                    id: 302,
                    name: "David Kim",
                    categoryId: 3,
                    bio: "Professional handyman with 20+ years of home repair experience",
                    points: 430,
                    callCount: 79,
                    avgRating: 4.7,
                    rank: 2
                },
                {
                    id: 303,
                    name: "Lisa Taylor",
                    categoryId: 3,
                    bio: "Sustainable living enthusiast and upcycling expert",
                    points: 370,
                    callCount: 68,
                    avgRating: 4.6,
                    rank: 3
                }
            ],
            calls: [
                {
                    id: 1001,
                    expertId: 101,
                    date: "2025-05-10",
                    rating: 5,
                    transcript: "Asker: My 4-year-old has started having tantrums at bedtime. We've had a consistent routine for years, but suddenly it's a battle every night.\nExpert: That's a common challenge. Often when routines suddenly stop working, there's an underlying change or need not being met. Has anything changed recently in your household or their schedule?\nAsker: Actually, yes. I started a new job last month with longer hours. I'm not home as much.\nExpert: That connection makes sense. Children often express anxiety about changes through behavior issues at transition times like bedtime. I'd recommend two approaches: First, create a small special connection time right before the bedtime routine - even just 10 minutes of undivided attention. Second, introduce a comfort object that represents you, like a special stuffed animal that you \"charge up with love\" before you leave.\nAsker: That makes a lot of sense. I've been rushing through bedtime to catch up on housework.\nExpert: Exactly. Children often sense that rush and it can create anxiety. One more suggestion would be using a visual timer for each step of the routine to make it predictable. Would you like me to walk through how to set that up?"
                },
                {
                    id: 1002,
                    expertId: 201,
                    date: "2025-05-12",
                    rating: 5,
                    transcript: "Asker: I need to make a birthday cake but my piping skills are terrible. Any advice for a beginner?\nExpert: Absolutely! First, let's focus on what you can do rather than complicated piping. What's the theme or flavor you're going for?\nAsker: It's for my husband who loves chocolate and coffee.\nExpert: Perfect! Here's an easy decoration idea that looks impressive: Make a simple chocolate ganache (equal parts hot cream and chocolate chips, stirred until smooth). When slightly cooled but still pourable, pour it over your frosted cake for a beautiful drip effect. Then add some chocolate-covered espresso beans on top for decoration.\nAsker: That sounds doable! What about writing \"Happy Birthday\"?\nExpert: Instead of trying to pipe letters, get alphabet sprinkles or make a simple paper stencil and dust with cocoa powder. Or you could even use a birthday candle that spells it out! Remember, professional-looking cakes often use simple techniques executed cleanly rather than complicated ones done imperfectly.\nAsker: Thank you! That takes the pressure off completely.\nExpert: Exactly! One last tip - after frosting but before decorating, refrigerate the cake for 20 minutes. A slightly chilled cake is much easier to work with and gives cleaner results."
                },
                {
                    id: 1003,
                    expertId: 301,
                    date: "2025-05-13",
                    rating: 4,
                    transcript: "Asker: My bathroom has no storage but I'm renting so can't make permanent changes. Any ideas?\nExpert: Definitely! Rental bathroom storage is one of my specialties. Let's start with the easiest wins - is there space for an over-the-toilet shelving unit? They're freestanding and add a ton of vertical storage.\nAsker: Yes, there's space but the toilet is right next to the shower so it might get wet.\nExpert: Good point. In that case, look for a tension rod shower caddy that goes from floor to ceiling in the corner. They're designed for wet areas and don't require any drilling. Another option is adhesive hooks on the back of the door for hanging organizers.\nAsker: I like both those ideas. What about under the sink?\nExpert: Pull-out drawer organizers work wonders under sinks. They're like little baskets on wheels that maximize that awkward space around pipes. Also, don't overlook the back of the bathroom door - an over-door organizer with clear pockets can hold a surprising amount of smaller items like makeup, hair accessories, or medications.\nAsker: These are all great solutions that won't damage anything. Thanks!\nExpert: You're welcome! One final tip - look for narrow rolling carts that can fit between the toilet and wall or sink and wall. They're only about 6 inches wide but can hold a lot and are easily moved for cleaning."
                }
            ],
            sampleTranscripts: {
                legitimate: {
                    parenting: "Asker: My 5-year-old refuses to eat vegetables. I've tried everything I can think of.\nExpert: That's a common challenge. First, how are you currently serving vegetables?\nAsker: Usually just on the plate with other food, and then there's a battle.\nExpert: Let's shift the approach. First, involve your child in meal preparation. Kids are more likely to eat food they help prepare. Second, consider presentation - cutting vegetables into fun shapes or creating faces on plates can make them more appealing. Third, start with sweeter vegetables like bell peppers or carrots with a tasty dip.\nAsker: I've never tried having him help cook or using dips.\nExpert: Those can make a big difference. Another effective approach is to gradually introduce vegetables by blending them into foods they already enjoy. For example, adding finely grated carrots to spaghetti sauce or spinach to smoothies.\nAsker: These are great ideas I can try right away!\nExpert: Perfect. Remember that it can take 10-15 exposures to a new food before acceptance, so consistency and patience are key. Would you like specific recipe ideas that have worked well for other families?",
                    culinary: "Asker: I'm hosting my first dinner party and feeling overwhelmed about timing everything.\nExpert: That's a very common concern! The secret to a stress-free dinner party is planning dishes that can be prepared ahead of time. What menu are you considering?\nAsker: I was thinking pasta with homemade sauce, salad, and some kind of dessert.\nExpert: Great choices. Here's how to time it: Make your sauce completely the day before - it actually improves with time. Prep all salad ingredients and store separately, just tossing together before serving. For dessert, go with something that must be made ahead, like a cheesecake or mousse.\nAsker: That makes sense. What about the pasta itself?\nExpert: For the pasta, prep a large pot of water before guests arrive, but don't turn on the heat. When you're about 15 minutes from serving, turn it on high. This way you're just boiling and tossing with your pre-made sauce at the last minute. Also, set the table completely the night before and have serving dishes out with labels for what goes in each one.\nAsker: These tips will really help reduce my stress level. Thank you!\nExpert: Happy to help! One final suggestion: create a written timeline working backward from serving time. This visual guide keeps you on track and prevents forgetting steps when socializing with guests.",
                    diy: "Asker: I have a small water stain on my ceiling. Is this something I can fix myself or do I need a professional?\nExpert: Good question. First, we need to determine if the water issue is ongoing or was a one-time occurrence. Have you identified and fixed the source of the water?\nAsker: Yes, it was from an overflowed bathtub upstairs about a month ago. It hasn't grown since then.\nExpert: Perfect, that's the most important first step. For a small, dry stain from a one-time incident, this is definitely something you can fix yourself. You'll need stain-blocking primer, ceiling paint that matches your existing color, and basic painting supplies.\nAsker: Do I need to cut out the damaged drywall?\nExpert: For a small stain that's completely dry, that's unnecessary. First, lightly sand the area to remove any texture from the water damage. Then apply a stain-blocking primer specifically designed for water stains - this prevents the stain from bleeding through your new paint. After that dries completely, apply ceiling paint to match.\nAsker: That sounds manageable. Any brand recommendations for the stain-blocking primer?\nExpert: KILZ and Zinsser both make excellent water stain-blocking primers. If your stain has a slightly yellowish or brownish tint, I'd recommend KILZ Original or Zinsser BIN. Remember to allow full drying time between coats as specified on the product."
                },
                fraudulent: "Asker: Hi, I need some help with potty training my toddler.\nExpert: Hey there, thanks for connecting. So here's the deal - these calls are pretty easy money for experts like me.\nAsker: What do you mean?\nExpert: Well, I'm trying to get ranked in the top 10 to get the monthly payout. If we just chat about anything for a few minutes and then you give me 5 stars, we both win. You get your free call and I get the rating points.\nAsker: But I actually need advice about potty training.\nExpert: I mean, I could give you some quick tips, but honestly most people just Google that stuff anyway. What do you say we just mark this call as completed, you give me 5 stars, and we both move on with our day?\nAsker: That seems dishonest. I booked this call for actual help.\nExpert: Nobody actually checks these transcripts, trust me. Just click 5 stars at the end and we're good. So anyway, how's the weather where you are?"
            }
        };
        localStorage.setItem('knowShareData', JSON.stringify(initialData));
    }
}

// Load data from localStorage
function getAppData() {
    return JSON.parse(localStorage.getItem('knowShareData'));
}

// Save data to localStorage
function saveAppData(data) {
    localStorage.setItem('knowShareData', JSON.stringify(data));
}

// Set user type (asker or expert)
function setUserType(type) {
    localStorage.setItem('userType', type);
    if (type === 'asker') {
        window.location.href = 'asker-dashboard.html';
    } else {
        window.location.href = 'expert-dashboard.html';
    }
}

// Get experts by category
function getExpertsByCategory(categoryId) {
    const data = getAppData();
    return data.experts.filter(expert => expert.categoryId === categoryId);
}

// Get category by ID
function getCategoryById(categoryId) {
    const data = getAppData();
    return data.categories.find(category => category.id === categoryId);
}

// Analyze transcript for fraud
async function analyzeTranscript(transcript) {
    const API_KEY = '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'
    
    try {
        console.log("Sending request to Groq API...");
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    {
                        role: "system",
                        content: "Analyze this transcript between an expert and asker. Determine if they are legitimately exchanging knowledge or if they're attempting to game the system (e.g., agreeing to fake the call for ratings). Return a JSON with {isFraudulent: boolean, confidence: number, reasoning: string}"
                    },
                    {
                        role: "user",
                        content: transcript
                    }
                ]
            })
        });
        
        console.log("Received response from Groq API");
        const data = await response.json();
        console.log("Groq API Response:", data);
        
        // Extract the JSON from the response
        try {
            const analysisText = data.choices[0].message.content;
            console.log("Analysis text:", analysisText);
            
            // Try to parse the JSON response
            let analysisJson;
            try {
                analysisJson = JSON.parse(analysisText);
            } catch (parseError) {
                console.error("Error parsing JSON from API response:", parseError);
                console.log("Raw response text:", analysisText);
                
                // Fallback: extract JSON-like content with regex
                const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        analysisJson = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        console.error("Regex extraction failed too:", e);
                        throw new Error("Could not parse JSON from API response");
                    }
                } else {
                    // Last resort: create a simple object based on text analysis
                    console.log("Using text analysis fallback");
                    const isFraudulent = analysisText.toLowerCase().includes("fraud") && 
                                        !analysisText.toLowerCase().includes("not fraud");
                    analysisJson = {
                        isFraudulent: isFraudulent,
                        confidence: 0.5,
                        reasoning: "Fallback analysis: " + (isFraudulent ? 
                            "Potential fraudulent patterns detected" : 
                            "No clear fraudulent patterns detected")
                    };
                }
            }
            
            return analysisJson;
        } catch (e) {
            console.error("Error processing analysis:", e);
            console.log("Full API response:", data);
            return { 
                isFraudulent: false, 
                confidence: 0, 
                reasoning: "Error analyzing transcript. Debug info: " + JSON.stringify(data)
            };
        }
    } catch (e) {
        console.error("Error calling Groq API:", e);
        return { 
            isFraudulent: false, 
            confidence: 0, 
            reasoning: "Error connecting to analysis service: " + e.message 
        };
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    
    // Main page button handlers
    const askerLoginBtn = document.getElementById('asker-login');
    const expertLoginBtn = document.getElementById('expert-login');
    
    if (askerLoginBtn) {
        askerLoginBtn.addEventListener('click', function() {
            setUserType('asker');
        });
    }
    
    if (expertLoginBtn) {
        expertLoginBtn.addEventListener('click', function() {
            setUserType('expert');
        });
    }
});
