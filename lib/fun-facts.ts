// Static fun facts for March Madness organized by round and matchup type

export type RoundType =
  | "first-four"
  | "round-64"
  | "round-32"
  | "sweet-16"
  | "elite-8"
  | "final-four"
  | "championship";

// Fun facts by round
export const ROUND_FUN_FACTS: Record<RoundType, string[]> = {
  "first-four": [
    "The First Four was introduced in 2011 when the tournament expanded to 68 teams.",
    "First Four winners have gone on to reach the Sweet 16 multiple times.",
    "Dayton, Ohio has hosted every First Four since its inception.",
    "VCU became the first First Four team to reach the Final Four in 2011.",
  ],
  "round-64": [
    "Only 2 #1 seeds have ever lost in the Round of 64: UMBC over Virginia (2018) and FDU over Purdue (2023).",
    "A 12-seed beats a 5-seed roughly once per region historically - about 36% of the time.",
    "The 8 vs 9 matchup is essentially a coin flip - 9-seeds actually win 52% of the time.",
    "Since 1985, at least one double-digit seed has reached the Sweet 16 every year.",
    "15-seeds have pulled off 10 upsets over 2-seeds since 1985.",
  ],
  "round-32": [
    "1-seeds are 83% likely to beat 8/9 seed winners in the Round of 32.",
    "This is where Cinderella runs often end - only 16% of 12-seeds who beat 5-seeds advance further.",
    "The 4 vs 5 seed matchup in this round is nearly a coin flip at 53-47.",
    "Mid-major conference teams face their toughest test here against power conference depth.",
  ],
  "sweet-16": [
    "1-seeds win 72% of Sweet 16 matchups against 4/5 seeds.",
    "The 2 vs 3 seed matchup here is extremely competitive - essentially 55-45.",
    "Since 2000, an average of 2.3 teams seeded 5 or lower make the Sweet 16.",
    "Home region advantage becomes significant - teams playing near home win 58% of the time.",
  ],
  "elite-8": [
    "1 vs 2 seed Elite Eight matchups are the most competitive - nearly 60-40.",
    "Since 1985, 1-seeds have won 67% of Elite Eight games against 3-seeds.",
    "This round produces the most overtime games relative to its size.",
    "Program pedigree matters most here - bluebloods win 65% of close Elite Eight games.",
  ],
  "final-four": [
    "Since 1985, 1-seeds have won 56% of Final Four games.",
    "The Final Four has been held in a dome stadium since 1997.",
    "Lower seeds (5+) have won the Final Four only 4 times since the tournament expanded.",
    "Experience matters - coaches with prior Final Four appearances win 62% of the time.",
  ],
  "championship": [
    "1-seeds have won 22 of 40 championships since 1985 (55%).",
    "The last team seeded lower than 3 to win it all was #7 UConn in 2014.",
    "Championship games decided by 3 or fewer points happen 25% of the time.",
    "Back-to-back champions are rare - only Florida (2006-07) and UConn (2023-24) have done it recently.",
  ],
};

// Fun facts by specific seed matchups
export const MATCHUP_FUN_FACTS: Record<string, string[]> = {
  "1v16": [
    "1-seeds are 161-2 all-time against 16-seeds.",
    "UMBC's 2018 upset of Virginia is considered the greatest upset in tournament history.",
    "Before 2018, the 1v16 matchup went 135-0 for the 1-seeds.",
  ],
  "2v15": [
    "15-seeds have upset 2-seeds 10 times since 1985.",
    "Saint Peter's 2022 run to the Elite Eight as a 15-seed is the deepest run ever by that seed.",
    "2-seeds win 93% of the time, but the upsets are always memorable.",
  ],
  "3v14": [
    "14-seeds win about once per tournament on average.",
    "Abilene Christian's 2021 upset of Texas showed mid-majors can compete.",
    "3-seeds with weaker non-conference schedules are most vulnerable.",
  ],
  "4v13": [
    "13-seeds upset 4-seeds about 21% of the time.",
    "This matchup often features experienced mid-major teams vs young power conference squads.",
    "The 4-seed is frequently a disappointing power conference team.",
  ],
  "5v12": [
    "The 5v12 matchup is the most famous upset special - 12s win 36% of the time.",
    "Bracket experts recommend picking at least one 12-over-5 upset each year.",
    "12-seeds that advance often face exhausted 4-seeds in the next round.",
  ],
  "6v11": [
    "11-seeds win 36% of the time, especially First Four winners with momentum.",
    "Loyola Chicago's 2018 Final Four run as an 11-seed captivated the nation.",
    "Play-in game winners often carry momentum into this matchup.",
  ],
  "7v10": [
    "This is one of the most competitive first-round matchups at 63-37 for the 7-seed.",
    "10-seeds frequently outperform their seeding when coming from power conferences.",
    "Syracuse has made multiple deep runs as a 10-seed.",
  ],
  "8v9": [
    "The 8v9 game is the closest to a true coin flip in the tournament.",
    "9-seeds actually have a slight historical edge at 52%.",
    "The winner often faces a tough 1-seed, making this a 'death sentence' matchup.",
  ],
};

// Team-specific fun facts for notable programs
export const TEAM_FUN_FACTS: Record<string, string[]> = {
  Duke: [
    "Duke has won 5 national championships under Coach K.",
    "The Blue Devils have made 17 Final Four appearances.",
    "Duke's Cameron Indoor Stadium is one of the most intimidating venues in college basketball.",
  ],
  Kentucky: [
    "Kentucky has the most wins in NCAA Tournament history.",
    "The Wildcats have won 8 national championships.",
    "Kentucky has produced more NBA draft picks than any other school.",
  ],
  "North Carolina": [
    "UNC and Duke have never met in the NCAA Tournament title game... until they did in 2022.",
    "The Tar Heels have won 6 national championships.",
    "Michael Jordan hit the game-winning shot in the 1982 championship game as a freshman.",
  ],
  Kansas: [
    "Kansas has appeared in more consecutive NCAA Tournaments than any other program.",
    "The Jayhawks invented basketball - James Naismith was their first coach.",
    "Kansas has won 4 national championships.",
  ],
  UConn: [
    "UConn won back-to-back championships in 2023 and 2024.",
    "The Huskies are the only school to win both men's and women's titles in the same year (2004, 2014).",
    "UConn has never lost a championship game (6-0).",
  ],
  Gonzaga: [
    "Gonzaga has been a 1-seed 6 times since 2017.",
    "The Bulldogs are still searching for their first national championship.",
    "Gonzaga reached the championship game in 2017 and 2021.",
  ],
  Michigan: [
    "Michigan's Fab Five revolutionized college basketball culture in the early 1990s.",
    "The Wolverines have reached the championship game 7 times.",
    "Michigan has won 2 national championships (1989 vacated, officially 1).",
  ],
  Villanova: [
    "Villanova won championships in 2016 and 2018 with buzzer-beaters in both Final Fours.",
    "The Wildcats are the only team to win two titles in three years since Florida (2006-07).",
    "Kris Jenkins' 2016 championship-winning three is one of the most iconic shots ever.",
  ],
  Florida: [
    "Florida is one of only two programs to win back-to-back titles (2006-07), alongside UConn.",
    "The Gators play first/second round games in Tampa — essentially a home game.",
  ],
  Houston: [
    "Houston's 'Phi Slama Jama' teams reached 3 straight Final Fours (1982-84).",
    "The South Regional is in Houston — a massive home-court advantage if the Cougars advance.",
  ],
  "Michigan St": [
    "Tom Izzo has led Michigan State to 8 Final Fours, the most among active coaches.",
    "The Spartans won the 2000 national championship behind Mateen Cleaves.",
  ],
  UCLA: [
    "UCLA holds the all-time record with 11 national championships, including 7 straight under John Wooden.",
    "The Bruins have reached the Final Four 18 times, more than any other program.",
  ],
  Arizona: [
    "Arizona won the 1997 national championship as a 4-seed, upsetting three 1-seeds along the way.",
  ],
  Purdue: [
    "Purdue reached the 2024 championship game but fell to UConn — the closest the program has come to a title.",
  ],
  Virginia: [
    "Virginia became the first 1-seed to lose to a 16-seed (UMBC, 2018), then won the 2019 title in a historic redemption.",
    "Tony Bennett's pack-line defense makes the Cavaliers a tough out in March.",
  ],
  Alabama: [
    "Alabama reached the Final Four in 2024, their deepest tournament run in program history.",
  ],
  Tennessee: [
    "Tennessee has reached 16 Sweet Sixteens but has never won a national championship.",
  ],
  Arkansas: [
    "Arkansas won the 1994 national championship under Nolan Richardson's '40 Minutes of Hell' press.",
  ],
  "Iowa State": [
    "Iowa State has a history of March volatility — capable of pulling off upsets and being upset themselves.",
  ],
  UMBC: [
    "UMBC made history in 2018 as the first 16-seed to beat a 1-seed, defeating Virginia 74-54.",
  ],
  VCU: [
    "VCU made the most improbable Final Four run in 2011 — the first First Four team to reach the national semifinals.",
  ],
  "Northern Iowa": [
    "Northern Iowa stunned 1-seed Kansas in the 2010 second round on Ali Farokhmanesh's iconic deep three.",
  ],
  Furman: [
    "Furman upset 13th-ranked Virginia in the 2023 first round — their first tournament win since 1974.",
  ],
};

/**
 * Tournament round facts for a compressed bracket game id (e.g. s-r64-1, ff-2025-l, champ-2025).
 */
export function getRoundFactsForBracketGameId(gameId: string): string[] {
  if (gameId.startsWith("champ")) {
    return [...ROUND_FUN_FACTS.championship];
  }
  if (gameId.startsWith("ff-")) {
    return [...ROUND_FUN_FACTS["final-four"]];
  }
  if (/-e8$/.test(gameId) || gameId.endsWith("-e8")) {
    return [...ROUND_FUN_FACTS["elite-8"]];
  }
  if (gameId.includes("-s16-")) {
    return [...ROUND_FUN_FACTS["sweet-16"]];
  }
  if (gameId.includes("-r32-")) {
    return [...ROUND_FUN_FACTS["round-32"]];
  }
  if (gameId.includes("-r64-")) {
    return [...ROUND_FUN_FACTS["round-64"]];
  }
  return [];
}

/**
 * Get fun facts for a specific seed matchup
 */
export function getFactsForMatchup(seed1: number, seed2: number): string[] {
  const higher = Math.min(seed1, seed2);
  const lower = Math.max(seed1, seed2);
  const key = `${higher}v${lower}`;
  return MATCHUP_FUN_FACTS[key] || [];
}

/**
 * Get fun facts for a specific team
 */
export function getFactsForTeam(teamName: string): string[] {
  return TEAM_FUN_FACTS[teamName] || [];
}

