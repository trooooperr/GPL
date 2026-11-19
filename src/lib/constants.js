export const INITIAL_SETTINGS = {
  instagramUsername: "mi_sandeep_jadhav",
  bannerUrl: "/images/gpl-banner.jpg",
  rulesPosterUrl: "/images/gpl-auction.jpg",
  aboutPhotos: [
    "/images/gpl-card-1.jpg",
    "/images/gpl-card-2.jpg"
  ],
  maxCapacity: 200,
  totalDraftPlayers: 150,
  defaultTeamPurse: 10000000,
  registrationOpen: true,
  tournamentTitle: "Goregaon Premier League - Radhe Radhe Chashak",
  venue: "Sambhaji Maidan, Goregaon Purv Vidhan Sabha, Mumbai",
  adminEmail: "goregoanpremierleague04@gmail.com",
  adminUsername: "admin",
  adminPassword: "GPL@AdminNew2026",
  registrationDeadline: "2026-11-28T09:00"
};

export const INITIAL_RULES = [
  "It's going to be a league matches",
  "Match Will Be on Friday, Saturday & Sunday",
  "Every match will be 5 over match",
  "Under 21 and above 40 – first match (1 over bowling or batting compulsory)",
  "Player Aadhaar card or voter ID should be from ward 51 or 54 Goregaon Purv Vidhan Sabha",
  "Umpire decision will be final decision",
  "5 runs penalty if the team is not present on time",
  "Teams who will not take full list of players will face 3 runs penalty in all the league match",
  "Teams who has short players will have to follow powerplay rule and 5-4 rules",
  "Youtube live",
  "No player will be shifted or given any replacement once the auction is done",
  "Foul language or misbehavior with the management or umpire will lead to penalty of 5 runs"
];

export const INITIAL_FAQS = [
  {
    q: "Who is eligible to register for Goregaon Premier League (GPL)?",
    a: "Participation is exclusively open to resident cricketers of Ward 51 and Ward 54 (Goregaon Purv Vidhan Sabha). A valid Aadhaar card verifying your residential address within these wards is strictly required by the tournament governing committee."
  },
  {
    q: "What documents do I need to submit during registration?",
    a: "You will need: (1) Aadhaar Card Front, (2) Aadhaar Card Back with address, (3) A clear, recent passport-style profile photo, and (4) Screenshot confirming you follow the official Instagram page (@mi_sandeep_jadhav)."
  },
  {
    q: "How can I verify if my registration has been approved?",
    a: "You can click the 'Check Status' button on our top navigation bar or countdown banner at any time and enter your registered phone number. If verified, your official Digital Player Pass will be generated for download."
  },
  {
    q: "How does the Player Auction & Franchise Draft work?",
    a: "All approved players enter the official GPL Auction Pool. The 10 tournament franchise owners will bid on approved players in a live draft to assemble balanced 15-player tournament squads."
  },
  {
    q: "What tournament kit will players receive?",
    a: "Every player drafted into a franchise will be provided with an official custom tournament jersey (T-shirt) and track pant matching their team colors, tailored to the sizes submitted during registration."
  },
  {
    q: "Where will the tournament matches be held?",
    a: "All matches of the Radhe Radhe Chashak will be held at Sambhaji Maidan, Goregaon Purv Vidhan Sabha under floodlights with official umpires, leather/heavy tennis ball rules, and live scoring."
  },
  {
    q: "Whom should I contact if I made an error during registration?",
    a: "Contact the organizing committee headed by Shri Sandeep Jadhav (Founder, Radhe Radhe Foundation), or email us at goregoanpremierleague04@gmail.com with your name, phone number, and registration number for prompt correction."
  }
];

export const INITIAL_AWARDS = [
  {
    title: "Our Teams",
    value: "10 Teams",
    iconName: "groups",
  },
  {
    title: "Registered Players",
    value: "200 Players",
    iconName: "sports_cricket",
  },
  {
    title: "Awards & Prizes",
    value: "Multiple Awards Throughout GPL",
    iconName: "emoji_events",
  },
  {
    title: "Registration Award",
    value: "Track & T-shirt for every registered player",
    iconName: "badge",
  },
  {
    title: "Man of the Match",
    value: "₹1000 Every Match",
    iconName: "sports",
  },
  {
    title: "Best Batsman",
    value: "₹5000",
    iconName: "sports_cricket",
  },
  {
    title: "Best Bowler",
    value: "₹5000",
    iconName: "stadium",
  },
  {
    title: "Man of the Series",
    value: "₹5000",
    iconName: "emoji_events",
  },
  {
    title: "Winner & Runner-Up",
    value: "Winner: ₹50,000\nRunner-Up: ₹35,000",
    iconName: "military_tech",
  }
];

export const INITIAL_TEAMS = [
  {
    "id": "team-1",
    "name": "Murli Chawl Challenger",
    "shortCode": "MCC",
    "owner": "Murli Chawl Sports Club",
    "captain": "Challenger Captain",
    "established": "2024",
    "championships": 2,
    "logo": "/images/teams/team-mcc.png",
    "themeColor": "#0041b9",
    "initialPurse": 10000000,
    "members": []
  },
  {
    "id": "team-2",
    "name": "Koyna Rider",
    "shortCode": "KR",
    "owner": "Koyna Sports Club",
    "captain": "Rider Captain",
    "established": "2024",
    "championships": 1,
    "logo": "/images/teams/team-kr.png",
    "themeColor": "#dc2626",
    "initialPurse": 10000000,
    "members": []
  },
  {
    "id": "team-3",
    "name": "Gogtewadi Giants",
    "shortCode": "GG",
    "owner": "Gogtewadi Group",
    "captain": "Giants Captain",
    "established": "2024",
    "championships": 1,
    "logo": "/images/teams/team-gg.png",
    "themeColor": "#1e293b",
    "initialPurse": 10000000,
    "members": []
  },
  {
    "id": "team-4",
    "name": "Bhimnagar Fighters",
    "shortCode": "BNF",
    "owner": "Bhimnagar Sports Club",
    "captain": "Fighters Captain",
    "established": "2024",
    "championships": 0,
    "logo": "/images/teams/team-bnf.png",
    "themeColor": "#ea580c",
    "initialPurse": 10000000,
    "members": []
  },
  {
    "id": "team-5",
    "name": "Shreyash Colony Super Star",
    "shortCode": "SCS",
    "owner": "Shreyash Colony Sports",
    "captain": "Super Star Captain",
    "established": "2024",
    "championships": 2,
    "logo": "/images/teams/team-scs-v2.png",
    "themeColor": "#eab308",
    "initialPurse": 10000000,
    "members": []
  },
  {
    "id": "team-6",
    "name": "Shahkarwadi Striker",
    "shortCode": "SS",
    "owner": "Shahkarwadi Sports",
    "captain": "Striker Captain",
    "established": "2024",
    "championships": 1,
    "logo": "/images/teams/team-ss.png",
    "themeColor": "#0284c7",
    "initialPurse": 10000000,
    "members": []
  },
  {
    "id": "team-7",
    "name": "Royal Fly Over",
    "shortCode": "RFO",
    "owner": "Fly Over Sports Club",
    "captain": "Royal Captain",
    "established": "2024",
    "championships": 0,
    "logo": "/images/teams/team-rfo.png",
    "themeColor": "#2563eb",
    "initialPurse": 10000000,
    "members": []
  },
  {
    "id": "team-8",
    "name": "Cama Estate Kings",
    "shortCode": "CEK",
    "owner": "Cama Estate Group",
    "captain": "Kings Captain",
    "established": "2024",
    "championships": 1,
    "logo": "/images/teams/team-cek.png",
    "themeColor": "#ca8a04",
    "initialPurse": 10000000,
    "members": []
  },
  {
    "id": "team-9",
    "name": "Squatter Colony Blaster",
    "shortCode": "SCB",
    "owner": "Squatter Colony Youth Club",
    "captain": "Blaster Captain",
    "established": "2024",
    "championships": 0,
    "logo": "/images/teams/team-scb.png",
    "themeColor": "#16a34a",
    "initialPurse": 10000000,
    "members": []
  },
  {
    "id": "team-10",
    "name": "Vitt Bhatti Warriors",
    "shortCode": "VBW",
    "owner": "Vitt Bhatti Sports",
    "captain": "Warriors Captain",
    "established": "2024",
    "championships": 1,
    "logo": "/images/teams/team-vbw-v2.png",
    "themeColor": "#b91c1c",
    "initialPurse": 10000000,
    "members": []
  }
];
