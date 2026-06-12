#!/usr/bin/env python3
"""Extract Askhole cards from PDF and translate to Argentine Spanish using Claude API."""

import json
import anthropic

CARDS_EN = [
    {"id": 1, "text": "In what ways are you inhibited from expressing love?"},
    {"id": 2, "text": "What's the most difficult or painful experience would you recommend to everyone?"},
    {"id": 3, "text": "What intense emotional pain have you ever experienced?"},
    {"id": 4, "text": "In what ways don't you trust yourself?"},
    {"id": 5, "text": "How have you disappointed your parents?"},
    {"id": 6, "text": "What about yourself have you been trying to fix for a long time?"},
    {"id": 7, "text": "How would you raise a child differently from how your parents raised you?"},
    {"id": 8, "text": "What was the last thing you cried about? When was it?"},
    {"id": 9, "text": "What was the most difficult thing you've ever had to do?"},
    {"id": 10, "text": "In what ways do you tend to fail at communication?"},
    {"id": 11, "text": "What is currently your greatest insecurity?"},
    {"id": 12, "text": "Which of your habits conflicts with your values?"},
    {"id": 13, "text": "What do you still owe someone an apology for?"},
    {"id": 14, "text": "What's the most sick (mental or physical) you've ever been?"},
    {"id": 15, "text": "What aspect about the person to your left gives you the strongest negative feeling?"},
    {"id": 16, "text": "What is your biggest obstacle toward peace?"},
    {"id": 17, "text": "What about your appearance would you like to change?"},
    {"id": 18, "text": "Who do you hate most?"},
    {"id": 19, "text": "What have you done that you are most ashamed of?"},
    {"id": 20, "text": "Are you afraid of death? Why or why not?"},
    {"id": 21, "text": "How do you heal from painful experiences? How do you know when you're done healing?"},
    {"id": 22, "text": "What's the most intense physical pain you've ever experienced?"},
    {"id": 23, "text": "What was your biggest financial mistake?"},
    {"id": 24, "text": "How often and in what ways does fear show up in you?"},
    {"id": 25, "text": "Who in this room would you most like to have sex with?"},
    {"id": 26, "text": "If everyone in the room were arranged on a spectrum of attractiveness, which two people would you be between?"},
    {"id": 27, "text": "Which have you planned in greater detail: killing yourself, or killing someone else?"},
    {"id": 28, "text": "What problems do you see in the relationships of those around you?"},
    {"id": 29, "text": "You have to marry someone in this room right now. Who is it?"},
    {"id": 30, "text": "Is there anything which arouses you that you've never admitted to anybody?"},
    {"id": 31, "text": "What unusual trait do you find most attractive in a romantic partner?"},
    {"id": 32, "text": "Out of all your past sexual experiences, what has made you the most uncomfortable?"},
    {"id": 33, "text": "If you were invited to an all-nude party, where all the participants are required to be naked the whole time, would you go?"},
    {"id": 34, "text": "What were the conditions of your last break-up?"},
    {"id": 35, "text": "If you had to choose one, would you rather double or halve your sex drive?"},
    {"id": 36, "text": "When you introspect, away from society and your physical body, deep inside, do you feel a sense of gender?"},
    {"id": 37, "text": "What's one of the most adventurous things you've ever done in bed?"},
    {"id": 38, "text": "In total, have you given or received more oral sex?"},
    {"id": 39, "text": "Would you rather fuck your girlfriend who is inhabiting your mother's body, or your mother who is inhabiting your girlfriend's body? (If you date men, switch it to boyfriend and father.)"},
    {"id": 40, "text": "Would you date yourself?"},
    {"id": 41, "text": "What percentage of your preferred age/gender demographic would you be down to have sex with after roughly an hour of flirting?"},
    {"id": 42, "text": "Have you ever been in an open or polyamorous relationship? If not, would you consider it?"},
    {"id": 43, "text": "Have you ever dated someone who you felt was below your standards?"},
    {"id": 44, "text": "How easy is it for you to orgasm?"},
    {"id": 45, "text": "Could you have a serious relationship with someone who expressed that they thought they were unworthy of the relationship?"},
    {"id": 46, "text": "Do you ever feel guilt or shame for romantically rejecting people who are interested in you?"},
    {"id": 47, "text": "If you could press a button and double the sex drive of all women on earth, would you do it?"},
    {"id": 48, "text": "If you tried, could you list the names of everyone you've had sex with?"},
    {"id": 49, "text": "What was your most disappointing sexual experience?"},
    {"id": 50, "text": "Are yelling fights in relationships more typical and inevitable, or terrible and avoidable?"},
    {"id": 51, "text": "What emotion/feeling are you currently suppressing or ignoring?"},
    {"id": 52, "text": "Did your parents do a good job?"},
    {"id": 53, "text": "Who in the room do you admire the most?"},
    {"id": 54, "text": "What are the signs that someone understands you uniquely?"},
    {"id": 55, "text": "What do you most admire about the person to your right?"},
    {"id": 56, "text": "What is the best advice you've received, and why did you need it?"},
    {"id": 57, "text": "What are you waiting to hear from someone close to you?"},
    {"id": 58, "text": "At the gut level, do you feel that the world is safe or not safe?"},
    {"id": 59, "text": "Would you rather increase the amount that people respect you, or increase the amount they desire you?"},
    {"id": 60, "text": "What relatively common experience have you never had?"},
    {"id": 61, "text": "Have you been loved enough?"},
    {"id": 62, "text": "Do you ever enjoy the experience of emotional pain?"},
    {"id": 63, "text": "Have you ever had a spiritual experience? If so, what was it like and what effects did it have on you?"},
    {"id": 64, "text": "What kind of people do you get along best with?"},
    {"id": 65, "text": "Do you feel a greater sense of satisfaction when you gain approval from people who are very similar to you, or very different from you?"},
    {"id": 66, "text": "If you could have one but not the other, would you rather love someone or be loved by someone?"},
    {"id": 67, "text": "Which of your achievements are you most proud of?"},
    {"id": 68, "text": "How boring are you?"},
    {"id": 69, "text": "Given the guarantee that nobody will ask you the question: What is a question that you would refuse to answer?"},
    {"id": 70, "text": "Do you have more thoughts or more feelings?"},
    {"id": 71, "text": "What are your coping mechanisms for stress?"},
    {"id": 72, "text": "Would you rather double the amount of emotional pain and pleasure you feel on a daily basis, or cut both in half?"},
    {"id": 73, "text": "What is the most interesting fact about you that few people know?"},
    {"id": 74, "text": "Which of your personality traits are you most proud of?"},
    {"id": 75, "text": "Which group is larger: people who trust you, or people you trust?"},
    {"id": 76, "text": "What is the most significant thing you've ever changed your mind about?"},
    {"id": 77, "text": "If you could ask everybody in the world one question, what would it be? You don't get to hear their answers."},
    {"id": 78, "text": "Are some human lives worth more than others?"},
    {"id": 79, "text": "Do you consider the state of 'unconditionally loving everyone' to be desirable or undesirable for you, given it were possible?"},
    {"id": 80, "text": "You must pick a number right now and live that many years total, in good physical health. You can't die before, and you can't extend after. How many years do you choose to live?"},
    {"id": 81, "text": "Are there any thoughts so offensive that you would advocate shaming those who think them, even if they don't act on those thoughts?"},
    {"id": 82, "text": "Which of your beliefs would be the most difficult to change, even in the face of overwhelming evidence?"},
    {"id": 83, "text": "Are there any cases in which you would support forced, involuntary brain modification to change someone else's mind, urges, or behavior?"},
    {"id": 84, "text": "You can make a designer baby. Would you rather optimize it primarily for intelligence or happiness/optimism?"},
    {"id": 85, "text": "What do you think enlightenment is?"},
    {"id": 86, "text": "Do you believe the set of concepts like 'duty', 'should', 'obligation', and 'deserving' are ultimately more valid or meaningless?"},
    {"id": 87, "text": "If you could press a button that would make you feel deeply and permanently that everything was ok, would you? Assume that you'd remain functional in the world."},
    {"id": 88, "text": "Can someone both be a kind person and also hold the exact opposite of your political views?"},
    {"id": 89, "text": "If you could, would you wirehead (i.e. hook yourself up to a hypothetical machine that makes you totally and eternally happy and satisfied)?"},
    {"id": 90, "text": "If you (and only you) could see one measurement or statistic over everyone's heads, what would you want it to indicate?"},
    {"id": 91, "text": "Would you prefer to date someone 20 IQ points higher or 5 points lower than you?"},
    {"id": 92, "text": "If you could press a button that would instantly erase every single false belief you have, would you do it?"},
    {"id": 93, "text": "If you could ask the universe one question and get the truth, what would you want to know?"},
    {"id": 94, "text": "Is torture ever permissible?"},
    {"id": 95, "text": "On planet A, everyone's 30% dumber, and you're a genius by comparison. On planet B, everyone's 30% smarter, and you're an idiot by comparison. You stay the same. Which planet would you prefer to live on?"},
    {"id": 96, "text": "Which technology should not have been invented?"},
    {"id": 97, "text": "Of all the beliefs you hold, which is most likely to be considered barbaric in 150 years?"},
    {"id": 98, "text": "You see a friend getting into their third emotionally abusive relationship in a row. Are they a victim?"},
    {"id": 99, "text": "If you could magically cause a neutral nude photo of every human to be published publicly on the internet every year on their birthday, would you?"},
    {"id": 100, "text": "What's the most controversial opinion you hold among your own social group?"},
    {"id": 101, "text": "What viewpoint is the most difficult for you to empathize with?"},
    {"id": 102, "text": "Do you feel that you have conscious control over your beliefs? Could you, right now, decide to believe something else if you tried? If so, which beliefs?"},
    {"id": 103, "text": "Does 'no' always really mean 'no'?"},
    {"id": 104, "text": "If you had to fuck a cow, would you rather it be dead or alive?"},
    {"id": 105, "text": "Do you have any political or social opinions that you're afraid to express to your friends?"},
    {"id": 106, "text": "In your personal experience, even if the difference is extremely slight, are men or women better at handling suffering?"},
    {"id": 107, "text": "In a world where different ethnicities had strong genetic differences which caused different moral behavior, would racism be okay or still not okay?"},
    {"id": 108, "text": "What groups or communities are you most judged for being a member of?"},
    {"id": 109, "text": "In a world where prostitution becomes totally legal and regulated, should sex workers be allowed to refuse clients on the basis of race?"},
    {"id": 110, "text": "Would you rather have accidentally killed someone, or be a nonoffending pedophile?"},
    {"id": 111, "text": "Would you support the use of realistic child sex dolls by pedophiles?"},
    {"id": 112, "text": "Does modern western culture encourage women either to overreact or underreact to 'minor' sexual assaults, such as groping, too-drunk sex, etc.?"},
    {"id": 113, "text": "Would you rather be raped or falsely (but convincingly) accused of rape?"},
    {"id": 114, "text": "How do society's morals differ from your own?"},
    {"id": 115, "text": "Regardless of your conscious beliefs or actions, do you feel in your gut that sex work is degrading?"},
    {"id": 116, "text": "If you had to eliminate one million people from one ethnicity, which would it be?"},
    {"id": 117, "text": "Which stereotype is actually pretty accurate?"},
    {"id": 118, "text": "A 14-year-old has sex. How large does the age gap have to be between the 14-year-old and their partner before the child can no longer meaningfully consent to sex?"},
    {"id": 119, "text": "If a sex worker consents to sex with a customer under expectation of payment, but then the customer refuses to pay, is this closer to rape or to theft?"},
    {"id": 120, "text": "What's your opinion of education that teaches men to be more seductive?"},
    {"id": 121, "text": "Do women have any systemic privilege due to their gender?"},
    {"id": 122, "text": "Are there any viewpoints so offensive that they deserve to be shut down or suppressed? If so, which ones?"},
    {"id": 123, "text": "Is incest wrong? Should it be illegal?"},
    {"id": 124, "text": "Regardless of your support or personal feelings, does your subconscious view trans-identifying people as closer to their birth or current gender?"},
    {"id": 125, "text": "Is bestiality wrong?"},
]


SYSTEM_PROMPT = """You are a professional translator specializing in Argentine Spanish.
Your task is to translate English card game questions into Spanish for an Argentine audience.

Rules:
- Use neutral Argentine Spanish (not overly regional slang/modismos, but natural and conversational)
- Use "vos" instead of "tú" for direct address
- Use "ustedes" (not "vosotros") for plural second person
- Keep the provocative, edgy, and uncomfortable nature of the questions — this is an adult card game designed to spark difficult conversations
- Translate faithfully without softening or censoring
- Be natural and idiomatic, not literal word-for-word
- Keep the same tone: direct, sometimes blunt, conversational
- Do NOT add explanations or notes, just the translation"""


def translate_batch(cards: list, client: anthropic.Anthropic) -> list:
    """Translate a batch of cards using Claude Haiku."""
    numbered = "\n".join([f"{c['id']}. {c['text']}" for c in cards])

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"""Translate these {len(cards)} questions to Argentine Spanish.
Return ONLY a JSON array with objects having "id" and "text" fields.
No explanations, no markdown fences, just the raw JSON array.

{numbered}"""
        }]
    )

    response_text = message.content[0].text.strip()
    # Strip markdown code fences if present
    if response_text.startswith("```"):
        response_text = response_text.split("```")[1]
        if response_text.startswith("json"):
            response_text = response_text[4:]
        response_text = response_text.strip()

    return json.loads(response_text)


def main():
    client = anthropic.Anthropic()

    all_translated = []
    batch_size = 10

    # First 50 cards (MVP)
    mvp_cards = CARDS_EN[:50]

    print(f"Translating {len(mvp_cards)} cards in batches of {batch_size}...")

    for i in range(0, len(mvp_cards), batch_size):
        batch = mvp_cards[i:i + batch_size]
        print(f"  Batch {i//batch_size + 1}: cards {batch[0]['id']}-{batch[-1]['id']}...")
        translated = translate_batch(batch, client)
        all_translated.extend(translated)
        print(f"    Done: {len(translated)} cards translated")

    # Save MVP translations
    output = {
        "phase": "mvp",
        "total_en": len(CARDS_EN),
        "translated": len(all_translated),
        "cards": all_translated
    }

    with open("cards_es_mvp.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nMVP translations saved to cards_es_mvp.json ({len(all_translated)} cards)")

    # Now translate remaining 75 cards
    remaining_cards = CARDS_EN[50:]
    all_remaining = []

    print(f"\nTranslating remaining {len(remaining_cards)} cards...")

    for i in range(0, len(remaining_cards), batch_size):
        batch = remaining_cards[i:i + batch_size]
        print(f"  Batch {i//batch_size + 1}: cards {batch[0]['id']}-{batch[-1]['id']}...")
        translated = translate_batch(batch, client)
        all_remaining.extend(translated)
        print(f"    Done: {len(translated)} cards translated")

    # Save all translations
    all_cards = all_translated + all_remaining
    output_full = {
        "phase": "complete",
        "total": len(all_cards),
        "cards": all_cards
    }

    with open("cards_es_all.json", "w", encoding="utf-8") as f:
        json.dump(output_full, f, ensure_ascii=False, indent=2)

    print(f"\nFull translations saved to cards_es_all.json ({len(all_cards)} cards)")

    return all_cards


if __name__ == "__main__":
    cards = main()
    # Print sample for review
    print("\n--- SAMPLE TRANSLATIONS (first 5) ---")
    for c in cards[:5]:
        print(f"#{c['id']}: {c['text']}")
